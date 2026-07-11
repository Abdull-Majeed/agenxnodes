const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const runWorkflow = require('../engine/runWorkflow');

router.post('/api/webhooks/twilio', async (req, res) => {
    // Twilio expects a quick 200 OK or TwiML response. 
    // We send empty TwiML so Twilio knows we received it.
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');

    const fromNumber = req.body.From;
    const messageBody = req.body.Body;
    if (!fromNumber || !messageBody) return;

    if (mongoose.connection.readyState !== 1) {
        console.error(`[Twilio Webhook] Received message but MongoDB is disconnected.`);
        return;
    }

    try {
        const workflows = await Workflow.find();
        for (const wf of workflows) {
            const triggerNode = wf.nodes.find(n => n.data.type === 'whatsappTrigger');
            if (triggerNode) {
                console.log(`\n[WhatsApp Trigger] Message received for workflow "${wf.name}": ${messageBody}`);
                
                // Run workflow in background
                runWorkflow(wf.nodes, wf.edges, {
                    form_text: messageBody,
                    user_message: messageBody,
                    ai_text: messageBody,
                    fromNumber: fromNumber
                }, triggerNode.id).then((logs) => {
                    const errors = logs.filter(l => l.status === 'error');
                    if (errors.length > 0) {
                        console.error(`[Background Run] Workflow "${wf.name}" stopped due to an error in node "${errors[0].label}":`, errors[0].output.error);
                    } else {
                        const executedNodes = logs.map(l => l.label).join(' -> ');
                        console.log(`[Background Run] Finished WhatsApp workflow "${wf.name}" successfully! Executed: ${executedNodes}`);
                    }
                }).catch(e => {
                    console.error(`[Background Run] Failed WhatsApp workflow "${wf.name}":`, e);
                });
            }
        }
    } catch (e) {
        console.error(`[Twilio Webhook Error]: ${e.message}`);
    }
});

// ==========================================
// 6.5 BACKGROUND TELEGRAM POLLING
// ==========================================
const telegramOffsets = {};

module.exports = router;
