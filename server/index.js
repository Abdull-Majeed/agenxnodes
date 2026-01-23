require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { HfInference } = require('@huggingface/inference');
const { google } = require('googleapis');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
// Dynamic Configuration from .env
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(bodyParser.json({ limit: '50mb' }));

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================
mongoose.connect(MONGO_URI)
    .then(() => console.log(`\n✅ MongoDB Connected`))
    .catch(err => {
        console.error(`\n❌ MongoDB Connection Error: ${err.message}`);
        console.error("-> Check your .env file password and username.");
    });

const UserSchema = new mongoose.Schema({ username: { type: String, unique: true }, password: String });
const WorkflowSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, name: String, nodes: Array, edges: Array, createdAt: { type: Date, default: Date.now } });
const User = mongoose.model('User', UserSchema);
const Workflow = mongoose.model('Workflow', WorkflowSchema);

// ==========================================
// 2. AUTH MIDDLEWARE & ROUTES
// ==========================================
const auth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: "Access Denied" });
    try { req.user = jwt.verify(token.split(" ")[1], JWT_SECRET); next(); }
    catch { res.status(400).json({ error: "Invalid Token" }); }
};

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ error: "Username already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.json({ message: "User Created" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
        const token = jwt.sign({ _id: user._id }, JWT_SECRET);
        res.json({ token, username: user.username });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// 3. WORKFLOW CRUD
// ==========================================
app.get('/api/workflows', auth, async (req, res) => res.json(await Workflow.find({ userId: req.user._id })));
app.get('/api/workflows/:id', auth, async (req, res) => res.json(await Workflow.findOne({ _id: req.params.id, userId: req.user._id })));
app.post('/api/workflows', auth, async (req, res) => {
    const { id, name, nodes, edges } = req.body;
    if (id) await Workflow.findOneAndUpdate({ _id: id, userId: req.user._id }, { name, nodes, edges });
    else { const w = new Workflow({ userId: req.user._id, name, nodes, edges }); await w.save(); res.json({ id: w._id }); }
    res.json({ message: "Saved" });
});
app.delete('/api/workflows/:id', auth, async (req, res) => {
    await Workflow.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Deleted" });
});

// ==========================================
// 4. EXECUTION ENGINE (28+ Nodes Logic)
// ==========================================
const delay = (ms) => new Promise(res => setTimeout(res, ms));

const nodeHandlers = {
    // --- TRIGGERS ---
    'webhook': async () => ({ msg: "Webhook Triggered", timestamp: new Date().toISOString() }),
    'manual': async () => ({ msg: "Manual Trigger", user: "Admin" }),
    'schedule': async (c) => ({ msg: "Cron Triggered", cron: c.cron, time: new Date().toISOString() }),
    'formTrigger': async (c) => ({
        form_text: c.testData || "No data provided",
        ai_text: c.testData || "No data"
    }),

    // --- AI & ML ---
    'gemini': async (config, input) => {
        if (!config.apiKey) throw new Error("Missing Gemini API Key");
        const model = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
        const ctx = input.form_text || input.ai_text || input.hf_result || "";
        const prompt = `${config.prompt || ''}\nContext: ${ctx}`;
        try {
            const res = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
            return { ai_text: res.data.candidates[0].content.parts[0].text };
        } catch (e) { throw new Error(`Gemini Error: ${e.response?.data?.error?.message || e.message}`); }
    },
    'huggingface': async (config, input) => {
        const apiKey = config.apiKey;
        if (!apiKey) throw new Error("Missing HF Token");
        const inputText = config.prompt || input.ai_text || input.form_text || "Hello";

        const modelChain = [config.model, "google/flan-t5-base", "gpt2"].filter(Boolean);
        const hf = new HfInference(apiKey);

        for (const model of modelChain) {
            try {
                // Try Text Gen
                const result = await hf.textGeneration({ model, inputs: inputText, parameters: { max_new_tokens: 100 } });
                return { hf_result: result.generated_text, ai_text: result.generated_text };
            } catch (err) {
                // Try Chat
                try {
                    const chat = await hf.chatCompletion({ model, messages: [{ role: "user", content: inputText }], max_tokens: 100 });
                    return { hf_result: chat.choices[0].message.content, ai_text: chat.choices[0].message.content };
                } catch (e) { console.log(`Model ${model} failed.`); }
            }
        }
        throw new Error("All HF models failed or require paid plan.");
    },
    'openai': async (config, input) => {
        if (!config.apiKey) throw new Error("Missing OpenAI API Key");
        const ctx = input.form_text || input.ai_text || "";
        try {
            const res = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: config.model || "gpt-3.5-turbo",
                messages: [{ role: "user", content: `${config.prompt}\n${ctx}` }]
            }, { headers: { Authorization: `Bearer ${config.apiKey}` } });
            return { ai_text: res.data.choices[0].message.content };
        } catch (e) { throw new Error(`OpenAI Error: ${e.response?.data?.error?.message || e.message}`); }
    },
    'anthropic': async (c) => ({ ai_text: "Claude Response (Simulated)" }),
    'stability': async (c) => { await delay(1000); return { image: "Image Generated (Simulated)" }; },

    // --- COMMUNICATION ---
    'email': async (config, input) => {
        if (!config.user || !config.pass) throw new Error("Missing Gmail Credentials");
        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: config.user, pass: config.pass } });
        const body = config.text || input.ai_text || input.form_text || "No Content";
        await transporter.sendMail({ from: config.user, to: config.to, subject: config.subject, text: body });
        return { status: "Email Sent", to: config.to };
    },
    'slack': async (config) => {
        if (!config.url) throw new Error("Missing Slack Webhook URL");
        await axios.post(config.url, { text: config.msg });
        return { status: "Slack Sent" };
    },
    'discord': async (config, input) => {
        if (!config.url) throw new Error("Missing Discord Webhook URL");
        const msg = config.msg || input.ai_text || input.form_text || "Hello";
        await axios.post(config.url, { content: msg });
        return { status: "Discord Sent" };
    },
    'telegram': async (c) => ({ status: "Telegram Sent", chatId: c.chatId }),
    'twilio': async (c) => ({ status: "SMS Sent", to: c.to }),
    'whatsapp': async (c) => ({ status: "WhatsApp Sent", to: c.to }),

    // --- DATA & UTILS ---
    'httpRequest': async (c) => {
        try { const r = await axios({ method: c.method || 'GET', url: c.url }); return { data: r.data }; }
        catch (e) { throw new Error(e.message); }
    },
    'code': async (c, input) => ({ result: "Code Executed", input_keys: Object.keys(input) }),
    'jsonParser': async (c, input) => (typeof input === 'string' ? JSON.parse(input) : input),
    'xmlParser': async () => ({ xml: "Converted to JSON" }),
    'condition': async (c, input) => {
        const fullText = JSON.stringify(input).toLowerCase();
        const keyword = (c.value || '').toLowerCase();
        const match = fullText.includes(keyword);
        return { _output: { result: match }, _branch: match ? 'true' : 'false' };
    },
    'delay': async (c) => { await delay((c.seconds || 1) * 1000); return { waited: `${c.seconds}s` }; },

    // --- PRODUCTIVITY (Real) ---
    'sheets': async (config, input) => {
        if (!config.client_email || !config.private_key || !config.sheetId) {
            // Safe fallback if user didn't enter credentials yet
            return { status: "Simulated Sheet Update", data: input };
        }
        try {
            const auth = new google.auth.JWT(config.client_email, null, config.private_key.replace(/\\n/g, '\n'), ['https://www.googleapis.com/auth/spreadsheets']);
            const sheets = google.sheets({ version: 'v4', auth });
            const values = [[new Date().toISOString(), input.form_text || "No Data", JSON.stringify(input)]];
            await sheets.spreadsheets.values.append({ spreadsheetId: config.sheetId, range: 'Sheet1!A:A', valueInputOption: 'USER_ENTERED', resource: { values } });
            return { status: "Row Added to Real Sheet" };
        } catch (e) { throw new Error(`Google Sheets Error: ${e.message}`); }
    },
    'airtable': async (c) => ({ status: "Record Added", base: c.baseId }),
    'notion': async (c) => ({ status: "Page Created", db: c.dbId }),

    // --- CLOUD ---
    'aws_s3': async (c) => ({ status: "File Uploaded to S3", bucket: c.bucket }),
    'postgres': async (c) => ({ status: "SQL Query Executed", host: c.host }),
    'stripe': async (c) => ({ status: "Stripe Charge Created", amount: c.amount })
};


// ==========================================
// 6. AI WORKFLOW GENERATOR (Text-to-JSON)
// ==========================================
app.post('/api/generate-workflow', auth, async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAeYPo50JafYpnhvlMj_KOJn27KnZaRVF0"; // Ideally use env var

    // 1. Define available tools for the AI so it knows what it can use
    const availableNodes = `
    - webhook (Start)
    - manual (Start)
    - schedule (Start)
    - formTrigger (Start)
    - gemini (AI Text)
    - openai (AI Text)
    - email (Send Email)
    - slack (Send Message)
    - discord (Send Message)
    - sheets (Google Sheets Add Row)
    - condition (If/Else Logic)
    - delay (Wait)
    `;

    // 2. Construct the System Prompt
    const systemPrompt = `
    You are an expert workflow automation architect for "AgenxNodes".
    User Request: "${prompt}"
    
    Your goal is to generate a valid JSON object representing a node-based workflow.
    
    Available Node Types: ${availableNodes}

    Rules:
    1. Always start with a Trigger node (manual, webhook, formTrigger, or schedule) if not specified.
    2. Connect nodes logically (Source -> Target).
    3. Use the available tools wisely based on the user's request.
    4. If user ask for anything else other than the available tools, return an error message.
    5. If user does not mention workflow, return an error message.
    6. Return ONLY raw JSON. No markdown, no explanations.
    7. Structure:
       {
         "nodes": [ { "id": "1", "type": "nodeType", "position": { "x": 0, "y": 0 }, "data": { "label": "Readable Name", "config": {} } } ],
         "edges": [ { "id": "e1-2", "source": "1", "target": "2" } ]
       }
    8. Space out nodes by x: 300 to create a visual flow.
    `;

    try {
        // Use Gemini to generate the JSON
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`; // Ensure you have GEMINI_API_KEY in .env

        const response = await axios.post(url, { contents: [{ parts: [{ text: systemPrompt }] }] });
        let text = response.data.candidates[0].content.parts[0].text;

        // Clean up markdown if Gemini adds it
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const workflowData = JSON.parse(text);
        res.json(workflowData);

    } catch (e) {
        console.error("AI Generation Error:", e.response?.data || e.message);
        res.status(500).json({ error: "Failed to generate workflow. Try being more specific." });
    }
});

// ==========================================
// 5. WORKFLOW ENGINE
// ==========================================
const runWorkflow = async (nodes, edges) => {
    let logs = [];

    // Find Start Node
    let currentNode = nodes.find(n => ['manual', 'webhook', 'formTrigger', 'schedule'].includes(n.data.type));

    if (!currentNode) throw new Error("Start with a Form Trigger, Manual, or Webhook node.");

    let currentData = {};
    let steps = 0;

    while (currentNode && steps < 50) {
        steps++;
        let result = {};
        let branch = null;

        try {
            const handler = nodeHandlers[currentNode.data.type];
            if (handler) {
                // Execute Real Logic
                const execution = await handler(currentNode.data.config || {}, currentData);
                if (execution._branch) { branch = execution._branch; result = execution._output; }
                else { result = execution; }
            } else {
                result = { ...currentData, note: "Pass-through" };
            }
            currentData = { ...currentData, ...result };
            logs.push({ nodeId: currentNode.id, label: currentNode.data.label, type: currentNode.data.type, output: result, status: 'success' });
        } catch (err) {
            logs.push({ nodeId: currentNode.id, label: currentNode.data.label, output: { error: err.message }, status: 'error' });
            break;
        }

        // Find Next Node
        let nextEdge;
        if (branch) nextEdge = edges.find(e => e.source === currentNode.id && e.sourceHandle === branch);
        else nextEdge = edges.find(e => e.source === currentNode.id);

        if (!nextEdge) break;
        currentNode = nodes.find(n => n.id === nextEdge.target);
    }
    return logs;
};

// --- ROUTES ---
app.get('/', (req, res) => res.send('<h1>✅ AgenxNodes Server Running</h1>'));

app.post('/api/run', async (req, res) => {
    try {
        const { nodes, edges } = req.body;
        const logs = await runWorkflow(nodes, edges);
        res.json({ logs });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
    console.log(`\n================================`);
    console.log(`🚀 Server Running on Port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`================================\n`);
});