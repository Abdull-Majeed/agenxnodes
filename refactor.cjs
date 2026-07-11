const fs = require('fs');
const lines = fs.readFileSync('server/index.js', 'utf8').split('\n');

function getLines(startPattern, endPattern) {
    let startIdx = lines.findIndex(l => l.includes(startPattern));
    let endIdx = endPattern ? lines.findIndex((l, i) => i > startIdx && l.includes(endPattern)) : lines.length;
    if (startIdx === -1) throw new Error("Could not find " + startPattern);
    return lines.slice(startIdx, endIdx).join('\n');
}

// 1. Models
const userSchema = lines.slice(lines.findIndex(l => l.includes('const UserSchema')), lines.findIndex(l => l.includes('const Workflow =')) + 1).join('\n');
fs.writeFileSync('server/models/User.js', `const mongoose = require('mongoose');\n${userSchema.split('\n').filter(l => !l.includes('const Workflow')).join('\n')}\nmodule.exports = User;\n`);
fs.writeFileSync('server/models/Workflow.js', `const mongoose = require('mongoose');\n${userSchema.split('\n').filter(l => l.includes('const Workflow')).join('\n')}\nmodule.exports = Workflow;\n`);

// 2. Utils
const utils = getLines('const delay = (ms)', 'const nodeHandlers');
fs.writeFileSync('server/utils/helpers.js', `const axios = require('axios');\n${utils}\nmodule.exports = { delay, safeAxios, isValidUrl };\n`);

// 3. Engine - nodeHandlers
const nodeHandlersLines = getLines('const nodeHandlers = {', 'app.post(\'/api/generate-workflow\'');
fs.writeFileSync('server/engine/nodeHandlers.js', `const axios = require('axios');\nconst { HfInference } = require('@huggingface/inference');\nconst nodemailer = require('nodemailer');\nconst { google } = require('googleapis');\nconst { safeAxios, isValidUrl, delay } = require('../utils/helpers');\n\n${nodeHandlersLines}\nmodule.exports = nodeHandlers;\n`);

// 4. Engine - runWorkflow
const runWorkflowLines = getLines('const TRIGGER_TYPES =', 'app.get(\'/\',');
fs.writeFileSync('server/engine/runWorkflow.js', `const nodeHandlers = require('./nodeHandlers');\n\n${runWorkflowLines}\nmodule.exports = runWorkflow;\n`);

// 5. Routes - auth
const authMiddleware = lines.slice(lines.findIndex(l => l.includes('const auth =')), lines.findIndex(l => l.includes('app.post(\'/api/auth/signup\''))).join('\n');
const authRoutes = getLines('app.post(\'/api/auth/signup\'', 'app.get(\'/api/workflows\'');
fs.writeFileSync('server/routes/auth.js', `const express = require('express');\nconst router = express.Router();\nconst bcrypt = require('bcryptjs');\nconst jwt = require('jsonwebtoken');\nconst crypto = require('crypto');\nconst nodemailer = require('nodemailer');\nconst User = require('../models/User');\nconst JWT_SECRET = process.env.JWT_SECRET || "default_secret";\n\n${authRoutes.replace(/app\./g, 'router.')}\nmodule.exports = { router, auth: ${authMiddleware.replace('const auth = ', '').replace(/;$/, '')} };\n`);

// 6. Routes - workflows
const workflowRoutes = getLines('app.get(\'/api/workflows\'', 'const TRIGGER_TYPES');
fs.writeFileSync('server/routes/workflows.js', `const express = require('express');\nconst router = express.Router();\nconst axios = require('axios');\nconst Workflow = require('../models/Workflow');\nconst { auth } = require('./auth');\n\n${workflowRoutes.replace(/app\./g, 'router.')}\nmodule.exports = router;\n`);

// 7. Routes - execution
const executionRoutes = getLines('app.post(\'/api/run\'', 'app.post(\'/api/webhooks/twilio\'');
fs.writeFileSync('server/routes/execution.js', `const express = require('express');\nconst router = express.Router();\nconst runWorkflow = require('../engine/runWorkflow');\n\n${executionRoutes.replace(/app\./g, 'router.')}\nmodule.exports = router;\n`);

// 8. Routes - webhooks
const webhookRoutes = getLines('app.post(\'/api/webhooks/twilio\'', 'const startTelegramPolling');
fs.writeFileSync('server/routes/webhooks.js', `const express = require('express');\nconst router = express.Router();\nconst Workflow = require('../models/Workflow');\nconst runWorkflow = require('../engine/runWorkflow');\n\n${webhookRoutes.replace(/app\./g, 'router.')}\nmodule.exports = router;\n`);

// 9. Services - telegramPolling
const telegramPollingLines = getLines('const telegramOffsets = {};', 'server.on(\'error\'');
fs.writeFileSync('server/services/telegramPolling.js', `const axios = require('axios');\nconst Workflow = require('../models/Workflow');\nconst runWorkflow = require('../engine/runWorkflow');\n\n${telegramPollingLines}\nmodule.exports = startTelegramPolling;\n`);

// 10. Write the new index.js
const newIndex = `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5005;
const HOST = process.env.HOST || '0.0.0.0';
const MONGO_URI = process.env.MONGO_URI;

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(MONGO_URI)
    .then(() => console.log(\`\\n✅ MongoDB Connected\`))
    .catch(err => {
        console.error(\`\\n❌ MongoDB Connection Error: \${err.message}\`);
    });

// Mount Routes
const authModule = require('./routes/auth');
app.use('/', authModule.router);
app.use('/', require('./routes/workflows'));
app.use('/', require('./routes/execution'));
app.use('/', require('./routes/webhooks'));

app.get('/', (req, res) => res.send('<h1>✅ AgenxNodes Server Running</h1>'));

const startTelegramPolling = require('./services/telegramPolling');
setTimeout(startTelegramPolling, 5000);

const server = app.listen(PORT, HOST, () => {
    console.log(\`\\n🚀 Server active on http://\${HOST}:\${PORT}\`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(\`\\n❌ Port \${PORT} is already in use. Please kill the process and try again.\`);
        process.exit(1);
    } else {
        console.error('\\n❌ Server error:', err);
    }
});

process.on('SIGINT', () => {
    console.log('\\nClosing server...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
`;
fs.writeFileSync('server/index.js', newIndex);

console.log('Refactoring complete.');
