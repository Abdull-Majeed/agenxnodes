const nodeHandlers = require('./nodeHandlers');

const TRIGGER_TYPES = ['manual', 'webhook', 'formTrigger', 'schedule', 'emailTrigger', 'apiPolling', 'chatTrigger', 'databaseTrigger', 'telegramTrigger', 'whatsappTrigger'];

const runWorkflow = async (nodes, edges, initialData = {}, startNodeId = null, onProgress = null) => {
    let logs = [];

    // Find Start Node
    let currentNode = startNodeId ? nodes.find(n => n.id === startNodeId) : nodes.find(n => TRIGGER_TYPES.includes(n.data.type));

    if (!currentNode) throw new Error("Workflow must start with a trigger node (Manual, Form, Webhook, Schedule, Email, API Polling, Chat, Telegram, or Database trigger).");

    let currentData = { ...initialData };
    let steps = 0;

    while (currentNode && steps < 50) {
        steps++;
        let result = {};
        let branch = null;

        try {
            if (onProgress) onProgress({ type: 'start', nodeId: currentNode.id });
            const handler = nodeHandlers[currentNode.data.type];
            if (handler) {
                const execution = await handler(currentNode.data.config || {}, currentData);
                if (execution._branch) { branch = execution._branch; result = execution._output; }
                else { result = execution; }
            } else {
                result = { ...currentData, note: `Unknown node type: ${currentNode.data.type}` };
            }
            currentData = { ...currentData, ...result };
            const logEntry = { nodeId: currentNode.id, label: currentNode.data.label, type: currentNode.data.type, output: result, status: 'success' };
            logs.push(logEntry);
            if (onProgress) onProgress({ type: 'finish', log: logEntry });
        } catch (err) {
            console.error(`\n❌ [Node Error in ${currentNode.data.label}]:`, err.message);
            const logEntry = { nodeId: currentNode.id, label: currentNode.data.label, type: currentNode.data.type, output: { error: err.message }, status: 'error' };
            logs.push(logEntry);
            if (onProgress) onProgress({ type: 'finish', log: logEntry });
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
module.exports = runWorkflow;
