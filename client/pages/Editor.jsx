import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
    ReactFlowProvider, addEdge, useNodesState, useEdgesState,
    Controls, Background, Handle, Position, BaseEdge, EdgeLabelRenderer,
    getBezierPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

// Imports
import CustomNode from '../components/CustomNode';
import CustomEdge from '../components/CustomEdge';
import { NODE_DEFINITIONS } from '../constants/nodes';

// --- CREDENTIAL GUIDES (For Non-Technical Users) ---
const CREDENTIAL_GUIDES = {
    gemini: { title: "Google Gemini", url: "https://aistudio.google.com/app/apikey", instructions: "1. Click the link.\n2. Click 'Create API Key'.\n3. Copy the key and paste it here." },
    openai: { title: "OpenAI", url: "https://platform.openai.com/api-keys", instructions: "1. Sign up/Login.\n2. Create new secret key.\n3. Ensure you have billing credits." },
    huggingface: { title: "Hugging Face", url: "https://huggingface.co/settings/tokens", instructions: "1. Go to Settings > Access Tokens.\n2. Create a 'Write' token." },
    sheets: { title: "Google Sheets", url: "https://console.cloud.google.com/", instructions: "1. Create Service Account.\n2. Download JSON Key.\n3. Share your sheet with the client_email." },
    discord: { title: "Discord", url: "https://support.discord.com/hc/en-us/articles/228383668", instructions: "1. Go to Server Settings > Integrations > Webhooks.\n2. Create Webhook.\n3. Copy URL." },
    slack: { title: "Slack", url: "https://api.slack.com/messaging/webhooks", instructions: "1. Create New App.\n2. Activate Incoming Webhooks.\n3. Copy Webhook URL." },
    email: { title: "Gmail", url: "https://myaccount.google.com/apppasswords", instructions: "1. Enable 2FA on Google.\n2. Search 'App Passwords'.\n3. Generate password for 'Mail'." }
};

const initialNodes = [{ id: '1', type: 'custom', data: { label: 'Start', type: 'manual', config: {} }, position: { x: 350, y: 100 } }];

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const reactFlowWrapper = useRef(null);

    // Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [workflowName, setWorkflowName] = useState("Untitled");

    // UI State
    const [selectedNode, setSelectedNode] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState("");

    // AI Modal State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [guideNodes, setGuideNodes] = useState([]); // Stores nodes that need guides

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
    const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

    useEffect(() => {
        if (!token) return navigate('/');
        const load = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5005/api/workflows/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data) {
                    setWorkflowName(data.name);
                    if (data.nodes.length > 0) setNodes(data.nodes);
                    if (data.edges.length > 0) setEdges(data.edges);
                }
            } catch (e) { console.error("Load failed"); }
        };
        load();
    }, [id, token, navigate, setNodes, setEdges]);

    useEffect(() => { if (toast) setTimeout(() => setToast(null), 3000) }, [toast]);

    // --- HANDLERS ---
    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'custom', animated: true }, eds)), [setEdges]);

    const onDrop = (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/reactflow');
        if (!type) return;
        const pos = reactFlowWrapper.current.getBoundingClientRect();
        const newNode = {
            id: `${Date.now()}`, type: 'custom',
            position: { x: e.clientX - pos.left, y: e.clientY - pos.top },
            data: { label: NODE_DEFINITIONS[type].label, type, config: {}, status: 'idle' }
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const { data } = await axios.post('http://localhost:5005/api/generate-workflow',
                { prompt: aiPrompt },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 1. Update Canvas
            // Map the simple AI types to our 'custom' type logic
            const newNodes = data.nodes.map(n => ({
                ...n,
                type: 'custom', // Force custom type
                data: {
                    label: n.data.label || NODE_DEFINITIONS[n.type]?.label || n.type,
                    type: n.type, // Store real type in data
                    config: n.data.config || {},
                    status: 'idle'
                }
            }));

            // Force animated edges
            const newEdges = data.edges.map(e => ({ ...e, type: 'custom', animated: true, style: { strokeWidth: 2, stroke: '#888' } }));

            setNodes(newNodes);
            setEdges(newEdges);

            // 2. Identify Nodes needing Credentials
            const nodesNeedingGuide = newNodes
                .map(n => n.data.type)
                .filter(type => CREDENTIAL_GUIDES[type])
                .filter((value, index, self) => self.indexOf(value) === index); // Unique only

            setGuideNodes(nodesNeedingGuide);

            setShowAiModal(false);
            setAiPrompt("");
            setToast({ msg: "Workflow Generated!", type: "success" });

        } catch (e) {
            setToast({ msg: "AI Generation Failed. Try again.", type: "error" });
        }
        setIsGenerating(false);
    };

    const saveWorkflow = async () => {
        await axios.post('http://localhost:5005/api/workflows', { id, name: workflowName, nodes, edges }, { headers: { Authorization: `Bearer ${token}` } });
        setToast({ msg: "Workflow Saved!", type: "success" });
    };

    const executeWorkflow = async () => {
        setIsRunning(true);
        setToast({ msg: "Starting...", type: "info" });
        setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
        try {
            const { data } = await axios.post('http://localhost:5005/api/run', { nodes, edges });
            for (const log of data.logs) {
                setNodes(nds => nds.map(n => n.id === log.nodeId ? { ...n, data: { ...n.data, status: log.status } } : n));
                if (log.status === 'error') setToast({ msg: log.output.error, type: 'error' });
                await new Promise(r => setTimeout(r, 600));
            }
            if (data.logs.every(l => l.status === 'success')) setToast({ msg: "Success!", type: "success" });
        } catch (e) { setToast({ msg: "Execution Error", type: "error" }); }
        setIsRunning(false);
    };

    const updateConfig = (key, val) => {
        if (!selectedNode) return;
        setNodes(ns => ns.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: val } } } : n));
        setSelectedNode(prev => ({ ...prev, data: { ...prev.data, config: { ...prev.data.config, [key]: val } } }));
    };

    const selectedDef = selectedNode ? NODE_DEFINITIONS[selectedNode.data.type] : null;

    // Filter sidebar
    const groupedNodes = Object.entries(NODE_DEFINITIONS).reduce((acc, [key, def]) => {
        if (def.label.toLowerCase().includes(search.toLowerCase())) {
            if (!acc[def.category]) acc[def.category] = [];
            acc[def.category].push({ key, ...def });
        }
        return acc;
    }, {});

    return (
        <div className="layout">
            <header className="header">
                <div className="brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>🔙 {workflowName}</div>
                <div className="actions">
                    <button className="btn run" style={{ background: 'linear-gradient(45deg, #8e44ad, #3498db)' }} onClick={() => setShowAiModal(true)}>Workflow Generator</button>
                    <button className="btn sec" onClick={saveWorkflow}>💾 Save</button>
                    <button className="btn pri" onClick={executeWorkflow} disabled={isRunning}>{isRunning ? '...' : '▶ Run'}</button>
                </div>
            </header>

            <div className="workspace">
                <aside className="palette">
                    <input className="search-input" placeholder="Search nodes..." value={search} onChange={e => setSearch(e.target.value)} />
                    {Object.entries(groupedNodes).map(([cat, items]) => (
                        <div key={cat}>
                            <div className="category-title">{cat}</div>
                            {items.map(item => (
                                <div key={item.key} className="tool-item" draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', item.key)}>
                                    <span style={{ color: item.color }}>{item.icon}</span> {item.label}
                                </div>
                            ))}
                        </div>
                    ))}
                </aside>

                <div className="canvas-container" ref={reactFlowWrapper}>
                    <ReactFlowProvider>
                        <ReactFlow
                            nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
                            onDrop={onDrop} onDragOver={e => e.preventDefault()} onNodeClick={(e, n) => setSelectedNode(n)}
                        >
                            <Background color="#f1f2f5" gap={20} />
                            <Controls />
                        </ReactFlow>
                    </ReactFlowProvider>
                </div>

                {selectedNode && selectedDef && (
                    <aside className="properties">
                        <div className="prop-header">
                            <div className="prop-title" style={{ color: selectedDef.color }}>{selectedDef.icon} {selectedDef.label}</div>
                            <button className="close" onClick={() => setSelectedNode(null)}>×</button>
                        </div>
                        <div className="prop-body">
                            <div className="field-group">
                                <label>Name</label>
                                <input value={selectedNode.data.label} onChange={(e) => {
                                    const val = e.target.value;
                                    setNodes(ns => ns.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: val } } : n));
                                    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: val } });
                                }} />
                            </div>

                            {/* CREDENTIAL HELPER LINK */}
                            {CREDENTIAL_GUIDES[selectedNode.data.type] && (
                                <div className="cred-alert">
                                    Need keys? <a href={CREDENTIAL_GUIDES[selectedNode.data.type].url} target="_blank" rel="noreferrer">Get {CREDENTIAL_GUIDES[selectedNode.data.type].title} Credentials</a>
                                </div>
                            )}

                            {selectedDef.fields.map(f => (
                                <div key={f.name} className="field-group">
                                    <label>{f.label}</label>
                                    {f.type === 'textarea' ? <textarea rows="3" value={selectedNode.data.config[f.name] || ''} onChange={e => updateConfig(f.name, e.target.value)} placeholder={f.placeholder} />
                                        : <input type={f.type} value={selectedNode.data.config[f.name] || ''} onChange={e => updateConfig(f.name, e.target.value)} placeholder={f.placeholder} />}
                                </div>
                            ))}
                        </div>
                    </aside>
                )}
            </div>

            {/* AI GENERATION MODAL */}
            {showAiModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>✨ Describe your Workflow</h2>
                        <p>e.g., "Create a workflow, when a user submits a form, analyze the sentiment with Gemini, and if it's negative, send me an email."</p>
                        <textarea
                            rows="4"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Type here..."
                            style={{ width: '100%', border: '1px solid #ddd', borderRadius: '6px', padding: '10px' }}
                        />
                        <div className="modal-actions">
                            <button className="btn sec" onClick={() => setShowAiModal(false)}>Cancel</button>
                            <button className="btn pri" onClick={handleAiGenerate} disabled={isGenerating}>
                                {isGenerating ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREDENTIAL GUIDE MODAL (Shows after generation) */}
            {guideNodes.length > 0 && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '500px' }}>
                        <h2>🔐 Setup Required</h2>
                        <p>Your workflow is ready! To make it run, you need to add credentials for these nodes:</p>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
                            {guideNodes.map(type => (
                                <div key={type} className="guide-item" style={{ marginBottom: '15px', padding: '10px', background: '#f9f9fa', borderRadius: '6px' }}>
                                    <strong style={{ color: NODE_DEFINITIONS[type].color }}>
                                        {NODE_DEFINITIONS[type].icon} {NODE_DEFINITIONS[type].label}
                                    </strong>
                                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#555', margin: '5px 0' }}>
                                        {CREDENTIAL_GUIDES[type]?.instructions}
                                    </p>
                                    <a href={CREDENTIAL_GUIDES[type]?.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px' }}>Get Keys Here &rarr;</a>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn pri" onClick={() => setGuideNodes([])}>Got it!</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
        </div>
    );
};

export default Editor;