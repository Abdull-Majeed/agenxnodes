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
    catch (err) { res.status(400).json({ error: "Invalid Token" }); }
};

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
        if (password.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });
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
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
        const token = jwt.sign({ _id: user._id }, JWT_SECRET);
        res.json({ token, username: user.username });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// 3. WORKFLOW CRUD (Fixed double-response bug)
// ==========================================
app.get('/api/workflows', auth, async (req, res) => res.json(await Workflow.find({ userId: req.user._id })));
app.get('/api/workflows/:id', auth, async (req, res) => res.json(await Workflow.findOne({ _id: req.params.id, userId: req.user._id })));
app.post('/api/workflows', auth, async (req, res) => {
    try {
        const { id, name, nodes, edges } = req.body;
        if (id) {
            await Workflow.findOneAndUpdate({ _id: id, userId: req.user._id }, { name, nodes, edges });
            return res.json({ message: "Saved" });
        } else {
            const w = new Workflow({ userId: req.user._id, name, nodes, edges });
            await w.save();
            return res.json({ id: w._id });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/workflows/:id', auth, async (req, res) => {
    await Workflow.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Deleted" });
});

// ==========================================
// 4. EXECUTION ENGINE (All Node Handlers)
// ==========================================
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Helper: safe HTTP request with timeout
const safeAxios = async (config, timeoutMs = 15000) => {
    return axios({ ...config, timeout: timeoutMs });
};

// Helper: validate URL
const isValidUrl = (str) => {
    try { new URL(str); return true; } catch { return false; }
};

const nodeHandlers = {
    // =====================
    // --- TRIGGERS ---
    // =====================
    'webhook': async (config) => ({
        msg: "Webhook Triggered",
        timestamp: new Date().toISOString(),
        method: config.method || "POST",
        form_text: config.testData || "Webhook payload"
    }),

    'manual': async () => ({
        msg: "Manual Trigger",
        user: "Admin",
        timestamp: new Date().toISOString()
    }),

    'schedule': async (config) => ({
        msg: "Cron Triggered",
        cron: config.cron || "* * * * *",
        time: new Date().toISOString()
    }),

    'formTrigger': async (config) => ({
        form_text: config.testData || "No data provided",
        ai_text: config.testData || "No data",
        timestamp: new Date().toISOString()
    }),

    'emailTrigger': async (config) => ({
        msg: "Email Trigger Fired",
        from: config.testEmail || "sender@example.com",
        subject: config.testSubject || "New Email Received",
        form_text: config.testEmail ? `Email from ${config.testEmail}: ${config.testSubject || 'No subject'}` : "Test email trigger",
        ai_text: config.testEmail ? `Email from ${config.testEmail}: ${config.testSubject || 'No subject'}` : "Test email trigger",
        timestamp: new Date().toISOString()
    }),

    'apiPolling': async (config) => {
        if (config.url && isValidUrl(config.url)) {
            try {
                const res = await safeAxios({ method: 'GET', url: config.url });
                const dataStr = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
                return {
                    msg: "API Polling Triggered",
                    data: res.data,
                    form_text: dataStr.substring(0, 500),
                    ai_text: dataStr.substring(0, 500),
                    timestamp: new Date().toISOString()
                };
            } catch (e) {
                return {
                    msg: "API Polling Triggered (fetch failed, using test data)",
                    form_text: config.testData || "API polling test data",
                    ai_text: config.testData || "API polling test data",
                    error: e.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
        return {
            msg: "API Polling Triggered",
            form_text: config.testData || "Poll result: no URL configured",
            ai_text: config.testData || "Poll result: no URL configured",
            interval: config.interval || "60",
            timestamp: new Date().toISOString()
        };
    },

    'chatTrigger': async (config) => ({
        msg: "Chat Trigger Fired",
        form_text: config.testMessage || "Hello, this is a chat message",
        ai_text: config.testMessage || "Hello, this is a chat message",
        user_message: config.testMessage || "Hello, this is a chat message",
        timestamp: new Date().toISOString()
    }),

    'databaseTrigger': async (config) => ({
        msg: "Database Trigger Fired",
        form_text: config.testRecord || '{"id": 1, "name": "New Record", "action": "INSERT"}',
        ai_text: config.testRecord || '{"id": 1, "name": "New Record", "action": "INSERT"}',
        record: config.testRecord || '{"id": 1, "name": "New Record", "action": "INSERT"}',
        table: config.table || "records",
        event: config.event || "INSERT",
        timestamp: new Date().toISOString()
    }),

    // =====================
    // --- AI & ML ---
    // =====================
    'gemini': async (config, input) => {
        if (!config.apiKey) throw new Error("Missing Gemini API Key. Get one at: https://aistudio.google.com/app/apikey");
        const model = config.model || "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
        const ctx = input.form_text || input.ai_text || input.hf_result || "";
        const prompt = `${config.prompt || 'Process the following:'}\nContext: ${ctx}`;
        try {
            const res = await safeAxios({
                method: 'POST',
                url,
                data: { contents: [{ parts: [{ text: prompt }] }] }
            }, 30000);
            const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("Empty response from Gemini");
            return { ai_text: text };
        } catch (e) {
            throw new Error(`Gemini Error: ${e.response?.data?.error?.message || e.message}`);
        }
    },

    'huggingface': async (config, input) => {
        const apiKey = config.apiKey;
        if (!apiKey) throw new Error("Missing HuggingFace Token. Get one at: https://huggingface.co/settings/tokens");
        const inputText = config.prompt || input.ai_text || input.form_text || "Hello";
        const modelChain = [config.model, "google/flan-t5-base", "gpt2"].filter(Boolean);
        const hf = new HfInference(apiKey);

        for (const model of modelChain) {
            try {
                const result = await hf.textGeneration({ model, inputs: inputText, parameters: { max_new_tokens: 100 } });
                return { hf_result: result.generated_text, ai_text: result.generated_text };
            } catch (err) {
                try {
                    const chat = await hf.chatCompletion({ model, messages: [{ role: "user", content: inputText }], max_tokens: 100 });
                    return { hf_result: chat.choices[0].message.content, ai_text: chat.choices[0].message.content };
                } catch (e) { console.log(`Model ${model} failed, trying next...`); }
            }
        }
        throw new Error("All HuggingFace models failed. Check your token and try a different model ID.");
    },

    'openai': async (config, input) => {
        if (!config.apiKey) throw new Error("Missing OpenAI API Key. Get one at: https://platform.openai.com/api-keys");
        const ctx = input.form_text || input.ai_text || "";
        const prompt = `${config.prompt || 'Process this:'}\n${ctx}`;
        try {
            const res = await safeAxios({
                method: 'POST',
                url: "https://api.openai.com/v1/chat/completions",
                data: {
                    model: config.model || "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }]
                },
                headers: { Authorization: `Bearer ${config.apiKey}` }
            }, 30000);
            const text = res.data?.choices?.[0]?.message?.content;
            if (!text) throw new Error("Empty response from OpenAI");
            return { ai_text: text };
        } catch (e) {
            throw new Error(`OpenAI Error: ${e.response?.data?.error?.message || e.message}`);
        }
    },

    'anthropic': async (config, input) => {
        if (!config.apiKey) throw new Error("Missing Anthropic API Key. Get one at: https://console.anthropic.com/");
        const ctx = input.form_text || input.ai_text || "";
        const prompt = `${config.prompt || 'Process this:'}\n${ctx}`;
        try {
            const res = await safeAxios({
                method: 'POST',
                url: "https://api.anthropic.com/v1/messages",
                data: {
                    model: config.model || "claude-3-haiku-20240307",
                    max_tokens: 1024,
                    messages: [{ role: "user", content: prompt }]
                },
                headers: {
                    'x-api-key': config.apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                }
            }, 30000);
            const text = res.data?.content?.[0]?.text;
            if (!text) throw new Error("Empty response from Claude");
            return { ai_text: text };
        } catch (e) {
            throw new Error(`Anthropic Error: ${e.response?.data?.error?.message || e.message}`);
        }
    },

    'stability': async (config) => {
        if (!config.apiKey) throw new Error("Missing Stability AI Key.");
        const prompt = config.prompt || "A beautiful landscape";
        try {
            const res = await safeAxios({
                method: 'POST',
                url: "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image",
                data: {
                    text_prompts: [{ text: prompt }],
                    cfg_scale: 7, height: 512, width: 512, steps: 30, samples: 1
                },
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }, 60000);
            return {
                image: "Image Generated Successfully",
                ai_text: `Image generated for prompt: "${prompt}"`,
                artifacts: res.data?.artifacts?.length || 0
            };
        } catch (e) {
            throw new Error(`Stability AI Error: ${e.response?.data?.message || e.message}`);
        }
    },

    // =====================
    // --- AI AGENT (LLM + Tools + Memory) ---
    // =====================
    'aiAgent': async (config, input) => {
        if (!config.apiKey) throw new Error("Missing API Key for AI Agent. Provide your LLM API key in the settings.");

        const llmProvider = config.llmProvider || 'gemini';
        const model = config.model || (llmProvider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash');
        const maxSteps = Math.min(parseInt(config.maxSteps) || 5, 10);
        const goal = config.goal || "Analyze the given data and provide insights";
        const temperature = parseFloat(config.temperature) || 0.7;
        const memoryType = config.memoryType || 'none';
        const ctx = input.form_text || input.ai_text || input.user_message || JSON.stringify(input);

        // --- Build enabled tools list ---
        const enabledTools = [];
        if (config.toolWebSearch === 'enabled') enabledTools.push({
            name: 'web_search',
            description: 'Search the web for current information. Use when you need up-to-date facts, news, or data.',
            instruction: 'To use: Write "TOOL_CALL: web_search(query)" with your search query. The system will return results.'
        });
        if (config.toolCalculator === 'enabled') enabledTools.push({
            name: 'calculator',
            description: 'Perform mathematical calculations, unit conversions, and data analysis.',
            instruction: 'To use: Write "TOOL_CALL: calculator(expression)" with the math expression. Evaluate it yourself.'
        });
        if (config.toolSummarizer === 'enabled') enabledTools.push({
            name: 'summarizer',
            description: 'Summarize long text into concise bullet points or paragraphs.',
            instruction: 'To use: Summarize the provided context directly as part of your reasoning.'
        });
        if (config.toolCodeInterpreter === 'enabled') enabledTools.push({
            name: 'code_interpreter',
            description: 'Write and reason about code to solve programming tasks or transform data.',
            instruction: 'To use: Write code blocks and explain the output as part of your reasoning.'
        });

        // --- Build tools section for prompt ---
        let toolsSection = '';
        if (enabledTools.length > 0) {
            toolsSection = `\n## Available Tools\nYou have the following tools available. Use them when needed:\n${enabledTools.map((t, i) => `${i + 1}. **${t.name}**: ${t.description}\n   ${t.instruction}`).join('\n')}\n`;
        } else {
            toolsSection = '\n## Tools\nNo external tools are enabled. Rely on your knowledge and the provided context.\n';
        }

        // --- Build memory section for prompt ---
        let memorySection = '';
        if (memoryType === 'buffer') {
            memorySection = `\n## Memory Mode: Buffer\nYou have full access to the entire conversation/input context below. Treat every detail as potentially relevant. Reference specific data points in your analysis.\n`;
        } else if (memoryType === 'summary') {
            memorySection = `\n## Memory Mode: Summary\nFocus on extracting key themes and patterns from the input context. Provide a high-level synthesis rather than granular details. Prioritize the most important information.\n`;
        } else {
            memorySection = `\n## Memory Mode: Stateless\nProcess only the current input. No prior conversation context is retained.\n`;
        }

        // --- Build the complete agent system prompt ---
        const systemPrompt = `You are an advanced AI Agent operating within AgenXNodes, a workflow automation platform.
You use structured, step-by-step reasoning (ReAct pattern) to accomplish complex tasks.
${toolsSection}${memorySection}
## Your Goal
${goal}

## Input Context from Previous Workflow Nodes
${ctx}

## Instructions
1. **Think** step-by-step about how to accomplish the goal
2. **Act** by using available tools or your own knowledge
3. **Observe** the results of your actions
4. Repeat until you have a comprehensive answer (max ${maxSteps} steps)

## Output Format
For each reasoning step:
**Step N — [Action Type]:** [Your reasoning and what you're doing]
**Observation:** [What you found or concluded]

After all steps:
**Final Answer:** [Your comprehensive, actionable final answer]

Be thorough, precise, and structure your output clearly.`;

        let reasoning = [];
        let finalAnswer = "";

        try {
            // --- LLM Call based on provider ---
            let agentOutput;

            if (llmProvider === 'openai') {
                // OpenAI call
                const res = await safeAxios({
                    method: 'POST',
                    url: "https://api.openai.com/v1/chat/completions",
                    data: {
                        model: model,
                        messages: [
                            { role: "system", content: "You are an advanced AI agent that uses structured reasoning." },
                            { role: "user", content: systemPrompt }
                        ],
                        temperature: temperature,
                        max_tokens: 3000
                    },
                    headers: { Authorization: `Bearer ${config.apiKey}` }
                }, 60000);
                agentOutput = res.data?.choices?.[0]?.message?.content;
            } else {
                // Gemini call (default)
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
                const res = await safeAxios({
                    method: 'POST',
                    url,
                    data: {
                        contents: [{ parts: [{ text: systemPrompt }] }],
                        generationConfig: {
                            temperature: temperature,
                            maxOutputTokens: 3000
                        }
                    }
                }, 60000);
                agentOutput = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            }

            if (!agentOutput) throw new Error("Agent received empty response from LLM");

            // --- Process web search tool calls if enabled ---
            if (config.toolWebSearch === 'enabled') {
                const searchCalls = agentOutput.match(/TOOL_CALL:\s*web_search\(([^)]+)\)/gi);
                if (searchCalls && searchCalls.length > 0) {
                    for (const call of searchCalls.slice(0, 3)) {
                        const queryMatch = call.match(/web_search\(["']?([^"')]+)["']?\)/i);
                        if (queryMatch) {
                            try {
                                const searchRes = await safeAxios({
                                    method: 'GET',
                                    url: `https://api.duckduckgo.com/?q=${encodeURIComponent(queryMatch[1])}&format=json&no_html=1`
                                }, 10000);
                                const searchData = searchRes.data;
                                const snippet = searchData.AbstractText || searchData.RelatedTopics?.[0]?.Text || "No results found";
                                reasoning.push(`**Web Search:** "${queryMatch[1]}" → ${snippet.substring(0, 300)}`);
                            } catch (searchErr) {
                                reasoning.push(`**Web Search:** "${queryMatch[1]}" → Search unavailable`);
                            }
                        }
                    }
                }
            }

            // --- Extract final answer ---
            const finalMatch = agentOutput.match(/\*\*Final Answer:\*\*\s*([\s\S]*?)$/i);
            finalAnswer = finalMatch ? finalMatch[1].trim() : agentOutput;

            // --- Extract reasoning steps ---
            const stepMatches = agentOutput.match(/\*\*Step\s+\d+[\s\S]*?(?=\*\*Step|\*\*Final|$)/gi);
            if (stepMatches) {
                reasoning = [...reasoning, ...stepMatches.map(s => s.trim())];
            }

            // --- Refinement pass if memory is summary mode and steps > 1 ---
            if (maxSteps > 1 && memoryType === 'summary' && finalAnswer.length > 50) {
                const summaryPrompt = `Summarize the following analysis into a concise, well-structured executive summary with key findings and recommended actions:\n\n"${finalAnswer}"`;

                try {
                    let summaryOutput;
                    if (llmProvider === 'openai') {
                        const sRes = await safeAxios({
                            method: 'POST',
                            url: "https://api.openai.com/v1/chat/completions",
                            data: {
                                model: model,
                                messages: [{ role: "user", content: summaryPrompt }],
                                temperature: 0.3, max_tokens: 1500
                            },
                            headers: { Authorization: `Bearer ${config.apiKey}` }
                        }, 30000);
                        summaryOutput = sRes.data?.choices?.[0]?.message?.content;
                    } else {
                        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
                        const sRes = await safeAxios({
                            method: 'POST', url,
                            data: {
                                contents: [{ parts: [{ text: summaryPrompt }] }],
                                generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
                            }
                        }, 30000);
                        summaryOutput = sRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    }
                    if (summaryOutput) {
                        finalAnswer = summaryOutput;
                        reasoning.push("**Summary Pass:** Final answer condensed into executive summary.");
                    }
                } catch (refineErr) {
                    reasoning.push("**Note:** Summary refinement skipped.");
                }
            }

            return {
                ai_text: finalAnswer,
                agent_reasoning: reasoning.join('\n\n'),
                steps_taken: reasoning.length,
                goal: goal,
                model: model,
                llm_provider: llmProvider,
                tools_used: enabledTools.map(t => t.name),
                memory_mode: memoryType
            };
        } catch (e) {
            throw new Error(`AI Agent Error: ${e.response?.data?.error?.message || e.message}`);
        }
    },

    // =====================
    // --- COMMUNICATION ---
    // =====================
    'email': async (config, input) => {
        if (!config.user) throw new Error("Missing Gmail address. Go to Node Settings and enter your Gmail.");
        if (!config.pass) throw new Error("Missing Gmail App Password. Generate one at: https://myaccount.google.com/apppasswords");
        if (!config.to) throw new Error("Missing recipient email address (To field).");
        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: config.user, pass: config.pass } });
        const body = config.text || input.ai_text || input.form_text || "No Content";
        const subject = config.subject || "AgenXNodes Notification";
        await transporter.sendMail({ from: config.user, to: config.to, subject, text: body });
        return { status: "Email Sent", to: config.to, subject };
    },

    'slack': async (config, input) => {
        if (!config.url) throw new Error("Missing Slack Webhook URL. Create one at: https://api.slack.com/messaging/webhooks");
        if (!isValidUrl(config.url)) throw new Error("Invalid Slack Webhook URL format.");
        const msg = config.msg || input.ai_text || input.form_text || "AgenXNodes Notification";
        await safeAxios({ method: 'POST', url: config.url, data: { text: msg } });
        return { status: "Slack Sent", message: msg.substring(0, 100) };
    },

    'discord': async (config, input) => {
        if (!config.url) throw new Error("Missing Discord Webhook URL. Create one in Server Settings > Integrations > Webhooks.");
        if (!isValidUrl(config.url)) throw new Error("Invalid Discord Webhook URL format.");
        const msg = config.msg || input.ai_text || input.form_text || "Hello from AgenXNodes";
        await safeAxios({ method: 'POST', url: config.url, data: { content: msg } });
        return { status: "Discord Sent", message: msg.substring(0, 100) };
    },

    'telegram': async (config, input) => {
        if (!config.token) throw new Error("Missing Telegram Bot Token. Create a bot via @BotFather on Telegram.");
        if (!config.chatId) throw new Error("Missing Chat ID. Send /start to your bot and check updates.");
        const msg = config.msg || input.ai_text || input.form_text || "Hello from AgenXNodes";
        try {
            await safeAxios({
                method: 'POST',
                url: `https://api.telegram.org/bot${config.token}/sendMessage`,
                data: { chat_id: config.chatId, text: msg, parse_mode: 'HTML' }
            });
            return { status: "Telegram Sent", chatId: config.chatId };
        } catch (e) {
            throw new Error(`Telegram Error: ${e.response?.data?.description || e.message}`);
        }
    },

    'twilio': async (config, input) => {
        if (!config.sid) throw new Error("Missing Twilio Account SID.");
        if (!config.token) throw new Error("Missing Twilio Auth Token.");
        if (!config.to) throw new Error("Missing recipient phone number.");
        if (!config.from) config.from = config.twilioNumber || "";
        const msg = config.msg || input.ai_text || input.form_text || "Hello from AgenXNodes";
        try {
            await safeAxios({
                method: 'POST',
                url: `https://api.twilio.com/2010-04-01/Accounts/${config.sid}/Messages.json`,
                data: new URLSearchParams({ To: config.to, From: config.from, Body: msg }).toString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                auth: { username: config.sid, password: config.token }
            });
            return { status: "SMS Sent", to: config.to };
        } catch (e) {
            throw new Error(`Twilio Error: ${e.response?.data?.message || e.message}`);
        }
    },

    'whatsapp': async (config, input) => {
        if (!config.sid) throw new Error("Missing Twilio Account SID for WhatsApp.");
        if (!config.token) throw new Error("Missing Twilio Auth Token for WhatsApp.");
        if (!config.to) throw new Error("Missing recipient WhatsApp number.");
        const msg = config.msg || input.ai_text || input.form_text || "Hello from AgenXNodes";
        try {
            await safeAxios({
                method: 'POST',
                url: `https://api.twilio.com/2010-04-01/Accounts/${config.sid}/Messages.json`,
                data: new URLSearchParams({
                    To: `whatsapp:${config.to}`,
                    From: `whatsapp:${config.from || '+14155238886'}`,
                    Body: msg
                }).toString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                auth: { username: config.sid, password: config.token }
            });
            return { status: "WhatsApp Sent", to: config.to };
        } catch (e) {
            throw new Error(`WhatsApp Error: ${e.response?.data?.message || e.message}`);
        }
    },

    // =====================
    // --- DATA & UTILS ---
    // =====================
    'httpRequest': async (config, input) => {
        if (!config.url) throw new Error("Missing URL for HTTP Request.");
        if (!isValidUrl(config.url)) throw new Error("Invalid URL format. Must start with http:// or https://");
        try {
            const method = (config.method || 'GET').toUpperCase();
            const requestConfig = { method, url: config.url, headers: {} };

            // Helper to clean JSON strings from control characters
            const cleanJson = (str) => str.replace(/[\x00-\x1F\x7F]/g, ' ').trim();

            // Parse custom headers
            if (config.headers) {
                try {
                    const customHeaders = JSON.parse(cleanJson(config.headers));
                    requestConfig.headers = { ...requestConfig.headers, ...customHeaders };
                } catch (he) {
                    throw new Error("Invalid Headers JSON. Example: {\"Authorization\": \"Bearer YOUR_TOKEN\"}");
                }
            }

            // Add body for POST/PUT and default Content-Type if not set
            if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
                if (!requestConfig.headers['Content-Type'] && !requestConfig.headers['content-type']) {
                    requestConfig.headers['Content-Type'] = 'application/json';
                }
                if (config.body) {
                    // Replace template variables like {{ai_text}}, {{form_text}}, {{result}}
                    let bodyStr = config.body;
                    bodyStr = bodyStr.replace(/\{\{ai_text\}\}/g, (input.ai_text || '').replace(/"/g, '\\"').replace(/\n/g, '\\n'));
                    bodyStr = bodyStr.replace(/\{\{form_text\}\}/g, (input.form_text || '').replace(/"/g, '\\"').replace(/\n/g, '\\n'));
                    bodyStr = bodyStr.replace(/\{\{result\}\}/g, (input.result || '').replace(/"/g, '\\"').replace(/\n/g, '\\n'));
                    try { requestConfig.data = JSON.parse(cleanJson(bodyStr)); }
                    catch { requestConfig.data = bodyStr; }
                } else if (input.ai_text) {
                    requestConfig.data = { content: input.ai_text };
                }
            }

            const r = await safeAxios(requestConfig);
            const dataStr = typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
            return { data: r.data, ai_text: dataStr.substring(0, 1000), status_code: r.status };
        } catch (e) {
            throw new Error(`HTTP Request failed: ${e.response?.status || ''} ${e.message}`);
        }
    },

    'jsonParser': async (config, input) => {
        try {
            const raw = input.ai_text || input.form_text || input.data;
            if (typeof raw === 'string') {
                const parsed = JSON.parse(raw);
                return { data: parsed, ai_text: JSON.stringify(parsed, null, 2) };
            }
            return { data: raw, ai_text: JSON.stringify(raw, null, 2) };
        } catch (e) {
            throw new Error(`JSON Parse Error: ${e.message}. Check that the input is valid JSON.`);
        }
    },

    'xmlParser': async (config, input) => {
        // Basic XML to text extraction
        const raw = input.ai_text || input.form_text || "<root>No data</root>";
        const textContent = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return { xml_text: textContent, ai_text: textContent, original: raw };
    },

    'condition': async (config, input) => {
        const fullText = JSON.stringify(input).toLowerCase();
        const keyword = (config.value || '').toLowerCase();
        if (!keyword) {
            return { _output: { result: false, reason: "No condition value specified" }, _branch: 'false' };
        }
        const match = fullText.includes(keyword);
        return {
            _output: { result: match, checked: keyword, reason: match ? `Found "${keyword}" in data` : `"${keyword}" not found in data` },
            _branch: match ? 'true' : 'false'
        };
    },

    'delay': async (config) => {
        const seconds = Math.min(Math.max(parseInt(config.seconds) || 1, 1), 300);
        await delay(seconds * 1000);
        return { waited: `${seconds}s`, timestamp: new Date().toISOString() };
    },

    // =====================
    // --- PRODUCTIVITY ---
    // =====================
    'sheets': async (config, input) => {
        if (!config.client_email || !config.private_key || !config.sheetId) {
            return { status: "Simulated Sheet Update (add credentials for real)", data: input };
        }
        try {
            const auth = new google.auth.JWT(config.client_email, null, config.private_key.replace(/\\n/g, '\n'), ['https://www.googleapis.com/auth/spreadsheets']);
            const sheets = google.sheets({ version: 'v4', auth });
            const values = [[new Date().toISOString(), input.form_text || "No Data", JSON.stringify(input)]];
            await sheets.spreadsheets.values.append({ spreadsheetId: config.sheetId, range: 'Sheet1!A:A', valueInputOption: 'USER_ENTERED', resource: { values } });
            return { status: "Row Added to Google Sheet", sheetId: config.sheetId };
        } catch (e) { throw new Error(`Google Sheets Error: ${e.message}`); }
    },

    'airtable': async (config, input) => {
        if (!config.apiKey) throw new Error("Missing Airtable API Key.");
        if (!config.baseId) throw new Error("Missing Airtable Base ID.");
        const tableName = config.table || "Table 1";
        try {
            const data = input.ai_text || input.form_text || "AgenXNodes Data";
            await safeAxios({
                method: 'POST',
                url: `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(tableName)}`,
                data: { fields: { Content: data, Timestamp: new Date().toISOString() } },
                headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' }
            });
            return { status: "Record Added to Airtable", base: config.baseId };
        } catch (e) {
            throw new Error(`Airtable Error: ${e.response?.data?.error?.message || e.message}`);
        }
    },

    'notion': async (config, input) => {
        if (!config.token) throw new Error("Missing Notion Integration Token.");
        if (!config.dbId) throw new Error("Missing Notion Database ID.");
        const content = input.ai_text || input.form_text || "AgenXNodes Entry";
        try {
            await safeAxios({
                method: 'POST',
                url: "https://api.notion.com/v1/pages",
                data: {
                    parent: { database_id: config.dbId },
                    properties: {
                        Name: { title: [{ text: { content: content.substring(0, 200) } }] }
                    }
                },
                headers: {
                    Authorization: `Bearer ${config.token}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                }
            });
            return { status: "Page Created in Notion", db: config.dbId };
        } catch (e) {
            throw new Error(`Notion Error: ${e.response?.data?.message || e.message}`);
        }
    },

    // =====================
    // --- CLOUD ---
    // =====================
    'aws_s3': async (config) => {
        if (!config.key) throw new Error("Missing AWS Access Key.");
        if (!config.bucket) throw new Error("Missing S3 Bucket name.");
        // Real S3 would need aws-sdk — return actionable message
        return {
            status: "S3 Upload Ready",
            bucket: config.bucket,
            ai_text: `S3 bucket "${config.bucket}" configured. For full S3 operations, install aws-sdk on the server.`
        };
    },

    'postgres': async (config) => {
        if (!config.host) throw new Error("Missing PostgreSQL host.");
        if (!config.user) throw new Error("Missing PostgreSQL user.");
        // Real Postgres would need pg package
        return {
            status: "PostgreSQL Query Ready",
            host: config.host,
            ai_text: `PostgreSQL connection to ${config.host} configured. For full SQL operations, install pg on the server.`
        };
    },

    'stripe': async (config) => {
        if (!config.apiKey) throw new Error("Missing Stripe Secret Key.");
        if (!config.amount) throw new Error("Missing payment amount.");
        try {
            const res = await safeAxios({
                method: 'POST',
                url: "https://api.stripe.com/v1/payment_intents",
                data: new URLSearchParams({
                    amount: String(Math.round(parseFloat(config.amount) * 100)),
                    currency: config.currency || 'usd'
                }).toString(),
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return { status: "Stripe Payment Intent Created", id: res.data?.id, amount: config.amount };
        } catch (e) {
            throw new Error(`Stripe Error: ${e.response?.data?.error?.message || e.message}`);
        }
    }
};


// ==========================================
// 5. AI WORKFLOW GENERATOR (Improved)
// ==========================================
app.post('/api/generate-workflow', auth, async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured in server .env file." });
    }

    if (!prompt || prompt.trim().length < 3) {
        return res.status(400).json({ error: "Please provide a meaningful workflow description." });
    }

    const systemPrompt = `You are an expert workflow automation architect for "AgenXNodes".
User Request: "${prompt}"

Your goal is to generate a valid JSON object representing a node-based workflow.

## Available Node Types (use ONLY these exact type values):

### Triggers (every workflow MUST start with exactly one trigger):
- "manual" — Manual button click trigger
- "webhook" — HTTP webhook trigger  
- "formTrigger" — Form submission trigger
- "schedule" — Cron/scheduled trigger
- "emailTrigger" — Triggered by incoming email
- "apiPolling" — Polls an API endpoint periodically
- "chatTrigger" — Triggered by a chat message
- "databaseTrigger" — Triggered by a database event

### AI & ML:
- "gemini" — Google Gemini AI (text generation, analysis, summarization)
- "openai" — OpenAI GPT (text generation, analysis)
- "anthropic" — Anthropic Claude (text generation, analysis)
- "huggingface" — HuggingFace models (text generation, classification)
- "stability" — Stability AI (image generation)
- "aiAgent" — Multi-step AI agent (complex reasoning, multi-step analysis)

### Communication:
- "email" — Send email via Gmail
- "slack" — Send Slack message
- "discord" — Send Discord message
- "telegram" — Send Telegram message
- "twilio" — Send SMS via Twilio
- "whatsapp" — Send WhatsApp message

### Data & Logic:
- "httpRequest" — Make HTTP API calls
- "jsonParser" — Parse JSON data
- "xmlParser" — Parse XML data
- "condition" — If/Else branching logic
- "delay" — Wait/delay timer

### Productivity:
- "sheets" — Google Sheets (add row)
- "airtable" — Airtable (add record)
- "notion" — Notion (create page)

### Cloud:
- "aws_s3" — AWS S3 file upload
- "postgres" — PostgreSQL query
- "stripe" — Stripe payment

## Rules:
1. ALWAYS start with exactly ONE trigger node.
2. Connect nodes logically using edges (source → target).
3. Choose the most appropriate nodes for the user's request.
4. If the request is unrelated to workflows or automation, return: {"error": "Please describe a workflow automation task."}
5. Return ONLY raw JSON. No markdown, no explanations, no code fences.
6. Use this exact structure:
{
  "nodes": [
    { "id": "1", "type": "manual", "position": { "x": 100, "y": 50 }, "data": { "label": "Start", "config": {} } },
    { "id": "2", "type": "gemini", "position": { "x": 100, "y": 250 }, "data": { "label": "Analyze with AI", "config": { "prompt": "Analyze the input data" } } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}
7. Position nodes vertically: increase Y by 200 for each step. Keep X at 100 for linear flows.
8. For condition nodes with branches, offset the true branch at x:0 and false branch at x:350.
9. Give each node a clear, descriptive label.
10. Include sensible default config values (like prompts for AI nodes).`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Retry logic
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 4096
                }
            }, { timeout: 30000 });

            let text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("Empty response from AI");

            // Clean up markdown fences if present
            text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

            // Validate JSON structure
            const workflowData = JSON.parse(text);

            if (workflowData.error) {
                return res.status(400).json({ error: workflowData.error });
            }

            if (!workflowData.nodes || !Array.isArray(workflowData.nodes) || workflowData.nodes.length === 0) {
                throw new Error("Invalid workflow: no nodes generated");
            }
            if (!workflowData.edges || !Array.isArray(workflowData.edges)) {
                workflowData.edges = [];
            }

            // Ensure all nodes have required fields
            workflowData.nodes = workflowData.nodes.map((n, i) => ({
                id: n.id || String(i + 1),
                type: n.type || "manual",
                position: n.position || { x: 100, y: i * 200 + 50 },
                data: {
                    label: n.data?.label || n.type || "Node",
                    type: n.type || "manual",
                    config: n.data?.config || {},
                    status: "idle"
                }
            }));

            return res.json(workflowData);
        } catch (e) {
            console.error(`AI Generation attempt ${attempt + 1} failed:`, e.message);
            if (attempt === 2) {
                return res.status(500).json({
                    error: `Failed to generate workflow after 3 attempts. ${e.message}. Try being more specific about what you want to automate.`
                });
            }
            await delay(1000);
        }
    }
});

// ==========================================
// 6. WORKFLOW ENGINE
// ==========================================
const TRIGGER_TYPES = ['manual', 'webhook', 'formTrigger', 'schedule', 'emailTrigger', 'apiPolling', 'chatTrigger', 'databaseTrigger'];

const runWorkflow = async (nodes, edges) => {
    let logs = [];

    // Find Start Node
    let currentNode = nodes.find(n => TRIGGER_TYPES.includes(n.data.type));

    if (!currentNode) throw new Error("Workflow must start with a trigger node (Manual, Form, Webhook, Schedule, Email, API Polling, Chat, or Database trigger).");

    let currentData = {};
    let steps = 0;

    while (currentNode && steps < 50) {
        steps++;
        let result = {};
        let branch = null;

        try {
            const handler = nodeHandlers[currentNode.data.type];
            if (handler) {
                const execution = await handler(currentNode.data.config || {}, currentData);
                if (execution._branch) { branch = execution._branch; result = execution._output; }
                else { result = execution; }
            } else {
                result = { ...currentData, note: `Unknown node type: ${currentNode.data.type}` };
            }
            currentData = { ...currentData, ...result };
            logs.push({ nodeId: currentNode.id, label: currentNode.data.label, type: currentNode.data.type, output: result, status: 'success' });
        } catch (err) {
            logs.push({ nodeId: currentNode.id, label: currentNode.data.label, type: currentNode.data.type, output: { error: err.message }, status: 'error' });
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
        if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
            return res.status(400).json({ error: "No nodes provided." });
        }
        const logs = await runWorkflow(nodes, edges || []);
        res.json({ logs });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
    console.log(`\n================================`);
    console.log(`🚀 Server Running on Port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`================================\n`);
});