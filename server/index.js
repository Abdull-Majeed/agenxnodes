require('dotenv').config();
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
    .then(() => console.log(`\n✅ MongoDB Connected`))
    .catch(err => {
        console.error(`\n❌ MongoDB Connection Error: ${err.message}`);
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
    console.log(`\n🚀 Server active on http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use. Please kill the process and try again.`);
        process.exit(1);
    } else {
        console.error('\n❌ Server error:', err);
    }
});

process.on('SIGINT', () => {
    console.log('\nClosing server...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
