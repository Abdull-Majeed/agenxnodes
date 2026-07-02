export const NODE_DEFINITIONS = {
    // --- TRIGGERS ---
    webhook: { category: 'Triggers', label: 'Webhook', icon: 'Webhook', color: '#2ecc71', fields: [] },
    schedule: { category: 'Triggers', label: 'Cron Job', icon: 'CalendarClock', color: '#2ecc71', fields: [{ name: 'cron', label: 'Cron Expression', type: 'text', placeholder: '*/5 * * * *' }] },
    manual: { category: 'Triggers', label: 'Manual Click', icon: 'Hand', color: '#2ecc71', fields: [] },
    formTrigger: { category: 'Triggers', label: 'Form Submit', icon: 'ClipboardList', color: '#2ecc71', fields: [{ name: 'testData', label: 'Simulate Input', type: 'textarea', placeholder: 'Enter test data...' }] },
    emailTrigger: { category: 'Triggers', label: 'Email Trigger', icon: 'MailOpen', color: '#27ae60', fields: [{ name: 'testEmail', label: 'Test Email From', type: 'text', placeholder: 'sender@example.com' }, { name: 'testSubject', label: 'Test Subject', type: 'text', placeholder: 'New email subject' }] },
    apiPolling: { category: 'Triggers', label: 'API Polling', icon: 'Radio', color: '#27ae60', fields: [{ name: 'url', label: 'Poll URL', type: 'text', placeholder: 'https://api.example.com/data' }, { name: 'interval', label: 'Interval (seconds)', type: 'number', placeholder: '60' }, { name: 'testData', label: 'Fallback Test Data', type: 'textarea', placeholder: 'Fallback data if URL fails...' }] },
    chatTrigger: { category: 'Triggers', label: 'Chat Trigger', icon: 'MessagesSquare', color: '#27ae60', fields: [{ name: 'testMessage', label: 'Test Message', type: 'textarea', placeholder: 'Enter a test chat message...' }] },
    databaseTrigger: { category: 'Triggers', label: 'DB Trigger', icon: 'DatabaseZap', color: '#27ae60', fields: [{ name: 'table', label: 'Table Name', type: 'text', placeholder: 'users' }, { name: 'event', label: 'Event Type', type: 'select', options: ['INSERT', 'UPDATE', 'DELETE'] }, { name: 'testRecord', label: 'Test Record (JSON)', type: 'textarea', placeholder: '{"id": 1, "name": "Test"}' }] },
    telegramTrigger: { category: 'Triggers', label: 'Telegram Bot', icon: 'Bot', color: '#0088cc', fields: [{ name: 'token', label: 'Bot Token', type: 'password', placeholder: 'Your bot token from @BotFather' }, { name: 'testData', label: 'Test Message', type: 'textarea', placeholder: 'Simulate a message here...' }] },
    whatsappTrigger: { category: 'Triggers', label: 'WhatsApp (Twilio)', icon: 'MessageCircle', color: '#25D366', fields: [{ name: 'testData', label: 'Test Message', type: 'textarea', placeholder: 'Simulate a WhatsApp message...' }] },

    // --- AI & ML ---
    gemini: { category: 'AI & ML', label: 'Google Gemini', icon: 'Gem', color: '#9b59b6', fields: [{ name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Gemini API key' }, { name: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Analyze the following data...' }] },
    openai: { category: 'AI & ML', label: 'OpenAI GPT', icon: 'Bot', color: '#10a37f', fields: [{ name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-...' }, { name: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Process this data...' }] },
    anthropic: { category: 'AI & ML', label: 'Claude 3', icon: 'BrainCircuit', color: '#d97757', fields: [{ name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-ant-...' }, { name: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Analyze...' }] },
    huggingface: { category: 'AI & ML', label: 'HuggingFace', icon: 'Smile', color: '#f39c12', fields: [{ name: 'apiKey', label: 'Token', type: 'password', placeholder: 'hf_...' }, { name: 'model', label: 'Model ID', type: 'text', placeholder: 'google/flan-t5-base' }, { name: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Input text...' }] },
    stability: { category: 'AI & ML', label: 'Stability AI', icon: 'Image', color: '#8e44ad', fields: [{ name: 'apiKey', label: 'Key', type: 'password', placeholder: 'sk-...' }, { name: 'prompt', label: 'Image Prompt', type: 'text', placeholder: 'A beautiful sunset over mountains' }] },
    aiAgent: {
        category: 'AI & ML', label: 'AI Agent', icon: 'Workflow', color: '#7c3aed', fields: [
            // --- LLM Section ---
            { name: '_llmHeader', label: '🧠 LLM Configuration', type: 'header' },
            { name: 'llmProvider', label: 'LLM Provider', type: 'select', options: ['gemini', 'openai'] },
            { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your API key for the selected LLM' },
            { name: 'model', label: 'Model', type: 'select', options: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] },
            { name: 'goal', label: 'Agent Goal / Task', type: 'textarea', placeholder: 'Analyze the data and provide actionable insights...' },
            // --- Tools Section ---
            { name: '_toolsHeader', label: '🔧 Tools', type: 'header' },
            { name: 'toolWebSearch', label: 'Web Search', type: 'select', options: ['disabled', 'enabled'] },
            { name: 'toolCalculator', label: 'Calculator', type: 'select', options: ['disabled', 'enabled'] },
            { name: 'toolSummarizer', label: 'Summarizer', type: 'select', options: ['disabled', 'enabled'] },
            { name: 'toolCodeInterpreter', label: 'Code Interpreter', type: 'select', options: ['disabled', 'enabled'] },
            // --- Memory Section ---
            { name: '_memoryHeader', label: '💾 Memory', type: 'header' },
            { name: 'memoryType', label: 'Memory Mode', type: 'select', options: ['none', 'buffer', 'summary'] },
            { name: 'maxSteps', label: 'Max Reasoning Steps', type: 'select', options: ['1', '2', '3', '5', '10'] },
            { name: 'temperature', label: 'Temperature', type: 'select', options: ['0.1', '0.3', '0.5', '0.7', '0.9'] }
        ]
    },

    // --- COMM ---
    email: { category: 'Comm', label: 'Send Email', icon: 'Mail', color: '#e74c3c', fields: [{ name: 'user', label: 'Gmail', type: 'text', placeholder: 'your@gmail.com' }, { name: 'pass', label: 'App Password', type: 'password', placeholder: 'App password from Google' }, { name: 'to', label: 'To', type: 'text', placeholder: 'recipient@email.com' }, { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject' }, { name: 'text', label: 'Body', type: 'textarea', placeholder: 'Email body content...' }] },
    slack: { category: 'Comm', label: 'Slack', icon: 'Slack', color: '#4a154b', fields: [{ name: 'url', label: 'Webhook URL', type: 'password', placeholder: 'https://hooks.slack.com/...' }, { name: 'msg', label: 'Message', type: 'text', placeholder: 'Hello from AgenXNodes!' }] },
    discord: { category: 'Comm', label: 'Discord', icon: 'MessageSquare', color: '#5865f2', fields: [{ name: 'url', label: 'Webhook URL', type: 'password', placeholder: 'https://discord.com/api/webhooks/...' }, { name: 'msg', label: 'Message', type: 'text', placeholder: 'Hello from AgenXNodes!' }] },
    telegram: { category: 'Comm', label: 'Telegram', icon: 'Send', color: '#0088cc', fields: [{ name: 'token', label: 'Bot Token', type: 'password', placeholder: 'Bot token from @BotFather' }, { name: 'chatId', label: 'Chat ID', type: 'text', placeholder: '123456789' }, { name: 'msg', label: 'Message', type: 'textarea', placeholder: 'Hello from AgenXNodes!' }] },
    twilio: { category: 'Comm', label: 'Twilio SMS', icon: 'Phone', color: '#f22f46', fields: [{ name: 'sid', label: 'Account SID', type: 'text', placeholder: 'AC...' }, { name: 'token', label: 'Auth Token', type: 'password', placeholder: 'Auth token' }, { name: 'from', label: 'From Number', type: 'text', placeholder: '+1234567890' }, { name: 'to', label: 'To Phone', type: 'text', placeholder: '+1987654321' }, { name: 'msg', label: 'Message', type: 'textarea', placeholder: 'SMS message...' }] },
    whatsapp: { category: 'Comm', label: 'WhatsApp', icon: 'MessageCircle', color: '#25d366', fields: [{ name: 'sid', label: 'Twilio SID', type: 'text', placeholder: 'AC...' }, { name: 'token', label: 'Twilio Token', type: 'password', placeholder: 'Auth token' }, { name: 'to', label: 'To Phone', type: 'text', placeholder: '+1234567890' }, { name: 'from', label: 'From Number', type: 'text', placeholder: '+14155238886' }, { name: 'msg', label: 'Message', type: 'text', placeholder: 'Hello from AgenXNodes!' }] },

    // --- DATA ---
    httpRequest: { category: 'Data', label: 'HTTP Request', icon: 'Globe', color: '#3498db', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/data' }, { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] }, { name: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer token", "Content-Type": "application/json"}' }, { name: 'body', label: 'Body (JSON)', type: 'textarea', placeholder: '{"key": "value"}' }] },
    jsonParser: { category: 'Data', label: 'JSON Parser', icon: 'Braces', color: '#f1c40f', fields: [] },
    xmlParser: { category: 'Data', label: 'XML Parser', icon: 'Brackets', color: '#f1c40f', fields: [] },
    condition: { category: 'Logic', label: 'If / Else', icon: 'Split', color: '#e67e22', fields: [{ name: 'value', label: 'Contains Value', type: 'text', placeholder: 'keyword to check for...' }] },
    delay: { category: 'Logic', label: 'Delay', icon: 'Timer', color: '#e67e22', fields: [{ name: 'seconds', label: 'Seconds', type: 'number', placeholder: '5' }] },

    // --- PROD ---
    sheets: { category: 'Prod', label: 'Sheets', icon: 'Sheet', color: '#0f9d58', fields: [{ name: 'client_email', label: 'Service Account Email', type: 'text', placeholder: 'name@project.iam.gserviceaccount.com' }, { name: 'private_key', label: 'Private Key', type: 'textarea', placeholder: '-----BEGIN PRIVATE KEY-----' }, { name: 'sheetId', label: 'Sheet ID', type: 'text', placeholder: 'Spreadsheet ID from URL' }, { name: 'action', label: 'Action', type: 'select', options: ['append', 'read'] }, { name: 'range', label: 'Range (for read mode)', type: 'text', placeholder: 'Sheet1!A:B' }] },
    airtable: { category: 'Prod', label: 'Airtable', icon: 'Table2', color: '#fcb400', fields: [{ name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'pat...' }, { name: 'baseId', label: 'Base ID', type: 'text', placeholder: 'app...' }, { name: 'table', label: 'Table Name', type: 'text', placeholder: 'Table 1' }] },
    notion: { category: 'Prod', label: 'Notion', icon: 'BookOpen', color: '#000000', fields: [{ name: 'token', label: 'Integration Token', type: 'password', placeholder: 'secret_...' }, { name: 'dbId', label: 'Database ID', type: 'text', placeholder: 'Database ID from URL' }] },

    // --- CLOUD ---
    aws_s3: { category: 'Cloud', label: 'AWS S3', icon: 'Cloud', color: '#ff9900', fields: [{ name: 'key', label: 'Access Key', type: 'password', placeholder: 'AKIA...' }, { name: 'bucket', label: 'Bucket', type: 'text', placeholder: 'my-bucket' }] },
    postgres: { category: 'Cloud', label: 'Postgres', icon: 'Database', color: '#336791', fields: [{ name: 'host', label: 'Host', type: 'text', placeholder: 'localhost:5432' }, { name: 'user', label: 'User', type: 'text', placeholder: 'postgres' }] },
    stripe: { category: 'Cloud', label: 'Stripe', icon: 'CreditCard', color: '#635bff', fields: [{ name: 'apiKey', label: 'Secret Key', type: 'password', placeholder: 'sk_...' }, { name: 'amount', label: 'Amount', type: 'number', placeholder: '29.99' }, { name: 'currency', label: 'Currency', type: 'select', options: ['usd', 'eur', 'gbp', 'pkr'] }] },
};
