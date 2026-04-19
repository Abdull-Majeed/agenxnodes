export const NODE_DEFINITIONS = {
    // --- TRIGGERS ---
    webhook: { category: 'Triggers', label: 'Webhook', icon: 'Webhook', color: '#2ecc71', fields: [] },
    schedule: { category: 'Triggers', label: 'Cron Job', icon: 'CalendarClock', color: '#2ecc71', fields: [{ name: 'cron', label: 'Cron Expression', type: 'text' }] },
    manual: { category: 'Triggers', label: 'Manual Click', icon: 'Hand', color: '#2ecc71', fields: [] },
    formTrigger: { category: 'Triggers', label: 'Form Submit', icon: 'ClipboardList', color: '#2ecc71', fields: [{ name: 'testData', label: 'Simulate Input', type: 'textarea' }] },

    // --- AI & ML ---
    gemini: { category: 'AI & ML', label: 'Google Gemini', icon: 'Gem', color: '#9b59b6', fields: [{ name: 'apiKey', label: 'API Key', type: 'password' }, { name: 'prompt', label: 'Prompt', type: 'textarea' }] },
    openai: { category: 'AI & ML', label: 'OpenAI GPT', icon: 'Bot', color: '#10a37f', fields: [{ name: 'apiKey', label: 'API Key', type: 'password' }, { name: 'prompt', label: 'Prompt', type: 'textarea' }] },
    anthropic: { category: 'AI & ML', label: 'Claude 3', icon: 'BrainCircuit', color: '#d97757', fields: [{ name: 'apiKey', label: 'API Key', type: 'password' }, { name: 'prompt', label: 'Prompt', type: 'textarea' }] },
    huggingface: { category: 'AI & ML', label: 'HuggingFace', icon: 'Smile', color: '#f39c12', fields: [{ name: 'apiKey', label: 'Token', type: 'password' }, { name: 'model', label: 'Model ID', type: 'text' }, { name: 'prompt', label: 'Prompt', type: 'textarea' }] },
    stability: { category: 'AI & ML', label: 'Stability AI', icon: 'Image', color: '#8e44ad', fields: [{ name: 'apiKey', label: 'Key', type: 'password' }, { name: 'prompt', label: 'Image Prompt', type: 'text' }] },

    // --- COMM ---
    email: { category: 'Comm', label: 'Send Email', icon: 'Mail', color: '#e74c3c', fields: [{ name: 'user', label: 'Gmail', type: 'text' }, { name: 'pass', label: 'App Password', type: 'password' }, { name: 'to', label: 'To', type: 'text' }, { name: 'subject', label: 'Subject', type: 'text' }, { name: 'text', label: 'Body', type: 'textarea' }] },
    slack: { category: 'Comm', label: 'Slack', icon: 'Slack', color: '#4a154b', fields: [{ name: 'url', label: 'Webhook URL', type: 'password' }, { name: 'msg', label: 'Message', type: 'text' }] },
    discord: { category: 'Comm', label: 'Discord', icon: 'MessageSquare', color: '#5865f2', fields: [{ name: 'url', label: 'Webhook URL', type: 'password' }, { name: 'msg', label: 'Message', type: 'text' }] },
    telegram: { category: 'Comm', label: 'Telegram', icon: 'Send', color: '#0088cc', fields: [{ name: 'token', label: 'Bot Token', type: 'password' }, { name: 'chatId', label: 'Chat ID', type: 'text' }, { name: 'msg', label: 'Message', type: 'textarea' }] },
    twilio: { category: 'Comm', label: 'Twilio SMS', icon: 'Phone', color: '#f22f46', fields: [{ name: 'sid', label: 'Account SID', type: 'text' }, { name: 'token', label: 'Auth Token', type: 'password' }, { name: 'to', label: 'To Phone', type: 'text' }] },
    whatsapp: { category: 'Comm', label: 'WhatsApp', icon: 'MessageCircle', color: '#25d366', fields: [{ name: 'to', label: 'To Phone', type: 'text' }, { name: 'msg', label: 'Message', type: 'text' }] },

    // --- DATA ---
    httpRequest: { category: 'Data', label: 'HTTP Request', icon: 'Globe', color: '#3498db', fields: [{ name: 'url', label: 'URL', type: 'text' }, { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT'] }] },
    code: { category: 'Data', label: 'Javascript', icon: 'Code2', color: '#34495e', fields: [{ name: 'code', label: 'Code', type: 'textarea' }] },
    jsonParser: { category: 'Data', label: 'JSON Parser', icon: 'Braces', color: '#f1c40f', fields: [] },
    xmlParser: { category: 'Data', label: 'XML Parser', icon: 'Brackets', color: '#f1c40f', fields: [] },
    condition: { category: 'Logic', label: 'If / Else', icon: 'Split', color: '#e67e22', fields: [{ name: 'value', label: 'Contains Value', type: 'text' }] },
    delay: { category: 'Logic', label: 'Delay', icon: 'Timer', color: '#e67e22', fields: [{ name: 'seconds', label: 'Seconds', type: 'number' }] },

    // --- PROD ---
    sheets: { category: 'Prod', label: 'Sheets', icon: 'Sheet', color: '#0f9d58', fields: [{ name: 'client_email', label: 'Email', type: 'text' }, { name: 'private_key', label: 'Key', type: 'textarea' }, { name: 'sheetId', label: 'ID', type: 'text' }] },
    airtable: { category: 'Prod', label: 'Airtable', icon: 'Table2', color: '#fcb400', fields: [{ name: 'apiKey', label: 'API Key', type: 'password' }, { name: 'baseId', label: 'Base ID', type: 'text' }] },
    notion: { category: 'Prod', label: 'Notion', icon: 'BookOpen', color: '#000000', fields: [{ name: 'token', label: 'Token', type: 'password' }, { name: 'dbId', label: 'Database ID', type: 'text' }] },

    // --- CLOUD ---
    aws_s3: { category: 'Cloud', label: 'AWS S3', icon: 'Cloud', color: '#ff9900', fields: [{ name: 'key', label: 'Access Key', type: 'password' }, { name: 'bucket', label: 'Bucket', type: 'text' }] },
    postgres: { category: 'Cloud', label: 'Postgres', icon: 'Database', color: '#336791', fields: [{ name: 'host', label: 'Host', type: 'text' }, { name: 'user', label: 'User', type: 'text' }] },
    stripe: { category: 'Cloud', label: 'Stripe', icon: 'CreditCard', color: '#635bff', fields: [{ name: 'apiKey', label: 'Secret Key', type: 'password' }, { name: 'amount', label: 'Amount', type: 'number' }] },
};
