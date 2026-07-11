const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const runWorkflow = require('../engine/runWorkflow');
const { safeAxios } = require('../utils/helpers');

const telegramOffsets = {};

const startTelegramPolling = async () => {
    // Only run if DB is connected
    if (mongoose.connection.readyState !== 1) {
        setTimeout(startTelegramPolling, 5000);
        return;
    }

    try {
        const workflows = await Workflow.find();
        
        for (const wf of workflows) {
            const triggerNode = wf.nodes.find(n => n.data.type === 'telegramTrigger');
            if (triggerNode && triggerNode.data.config && triggerNode.data.config.token) {
                const token = triggerNode.data.config.token;
                const offset = telegramOffsets[token] || 0;
                
                try {
                    const res = await safeAxios({
                        method: 'GET',
                        url: `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=2`
                    });
                    
                    if (res.data && res.data.ok && res.data.result.length > 0) {
                        for (const update of res.data.result) {
                            telegramOffsets[token] = update.update_id + 1;
                            
                            if (update.message && update.message.text) {
                                console.log(`\n[Telegram Trigger] Message received for workflow "${wf.name}": ${update.message.text}`);
                                
                                // Run workflow in background
                                runWorkflow(wf.nodes, wf.edges, {
                                    form_text: update.message.text,
                                    user_message: update.message.text,
                                    chatId: update.message.chat.id,
                                    ai_text: update.message.text
                                }, triggerNode.id).then(() => {
                                    console.log(`[Background Run] Finished workflow "${wf.name}" successfully.`);
                                }).catch(e => {
                                    console.error(`[Background Run] Failed workflow "${wf.name}":`, e);
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error(`[Telegram Polling Error for ${wf.name}]: ${e.message}`);
                }
            }
        }
    } catch (e) {
        console.error(`[Telegram Polling Loop Error]: ${e.message}`);
    }
    
    setTimeout(startTelegramPolling, 3000);
};

module.exports = startTelegramPolling;
