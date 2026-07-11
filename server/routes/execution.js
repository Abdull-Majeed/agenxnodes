const express = require('express');
const router = express.Router();
const runWorkflow = require('../engine/runWorkflow');

router.post('/api/run', async (req, res) => {
    try {
        const { nodes, edges } = req.body;
        if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
            return res.status(400).json({ error: "No nodes provided." });
        }
        const logs = await runWorkflow(nodes, edges || []);
        res.json({ logs });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/run-stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const { nodes, edges } = req.body;
    if (!nodes || nodes.length === 0) return res.end();

    const onProgress = (data) => {
        res.write(JSON.stringify(data) + '\n');
    };

    try {
        await runWorkflow(nodes, edges || [], {}, null, onProgress);
        res.write(JSON.stringify({ type: 'done' }) + '\n');
        res.end();
    } catch (e) {
        res.write(JSON.stringify({ type: 'error', error: e.message }) + '\n');
        res.end();
    }
});

module.exports = router;
