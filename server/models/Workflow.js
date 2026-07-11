const mongoose = require('mongoose');
const WorkflowSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, name: String, nodes: Array, edges: Array, createdAt: { type: Date, default: Date.now } });
const Workflow = mongoose.model('Workflow', WorkflowSchema);
module.exports = Workflow;
