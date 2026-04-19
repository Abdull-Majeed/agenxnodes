import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PanelLeft, LayoutGrid, Layers3, Sliders, ChevronLeft, ChevronRight, Bot, Save, Play } from 'lucide-react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

import CustomNode from '../components/CustomNode';
import CustomEdge from '../components/CustomEdge';
import NodeIcon from '../components/NodeIcon';
import { NODE_DEFINITIONS } from '../constants/nodes';

const CREDENTIAL_GUIDES = {
  gemini: { title: "Google Gemini", url: "https://aistudio.google.com/app/apikey", instructions: "1. Click the link.\n2. Click 'Create API Key'.\n3. Copy the key and paste it here." },
  openai: { title: "OpenAI", url: "https://platform.openai.com/api-keys", instructions: "1. Sign up/Login.\n2. Create new secret key.\n3. Ensure you have billing credits." },
  huggingface: { title: "Hugging Face", url: "https://huggingface.co/settings/tokens", instructions: "1. Go to Settings > Access Tokens.\n2. Create a 'Write' token." },
  sheets: { title: "Google Sheets", url: "https://console.cloud.google.com/", instructions: "1. Create Service Account.\n2. Download JSON Key.\n3. Share your sheet with the client_email." },
  discord: { title: "Discord", url: "https://support.discord.com/hc/en-us/articles/228383668", instructions: "1. Go to Server Settings > Integrations > Webhooks.\n2. Create Webhook.\n3. Copy URL." },
  slack: { title: "Slack", url: "https://api.slack.com/messaging/webhooks", instructions: "1. Create New App.\n2. Activate Incoming Webhooks.\n3. Copy Webhook URL." },
  email: { title: "Gmail", url: "https://myaccount.google.com/apppasswords", instructions: "1. Enable 2FA on Google.\n2. Search 'App Passwords'.\n3. Generate password for 'Mail'." }
};

const initialNodes = [
  { id: '1', type: 'custom', data: { label: 'Start', type: 'manual', config: {}, status: 'idle' }, position: { x: 320, y: 100 } }
];

const DEFAULT_EDGE_STYLE = { stroke: '#0f172a', strokeWidth: 2.4 };

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState("Untitled");

  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [guideNodes, setGuideNodes] = useState([]);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    if (!id) return;
    const load = async () => {
      setIsLoadingWorkflow(true);
      try {
        const { data } = await axios.get(`http://localhost:5005/api/workflows/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data) {
          setWorkflowName(data.name);
          if (data.nodes.length > 0) {
            const hydratedNodes = data.nodes.map((node) => ({
              ...node,
              type: 'custom',
              data: { ...node.data, status: node.data?.status || 'idle' }
            }));
            setNodes(hydratedNodes);
          }
          if (data.edges.length > 0) {
            const hydratedEdges = data.edges.map((edge) => ({
              ...edge,
              type: 'custom',
              animated: true,
              style: { ...DEFAULT_EDGE_STYLE, ...(edge.style || {}) }
            }));
            setEdges(hydratedEdges);
          }
        }
      } catch (e) {
        console.error("Load failed");
      } finally {
        setIsLoadingWorkflow(false);
      }
    };
    load();
  }, [id, token, navigate, setNodes, setEdges]);

  useEffect(() => {
    if (toast) setTimeout(() => setToast(null), 3000);
  }, [toast]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: 'custom', animated: true, style: DEFAULT_EDGE_STYLE }, eds)
      ),
    [setEdges]
  );

  const onDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const pos = reactFlowWrapper.current.getBoundingClientRect();
    const newNode = {
      id: `${Date.now()}`,
      type: 'custom',
      position: { x: e.clientX - pos.left, y: e.clientY - pos.top },
      data: { label: NODE_DEFINITIONS[type].label, type, config: {}, status: 'idle' }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5005/api/generate-workflow',
        { prompt: aiPrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newNodes = data.nodes.map((n) => ({
        ...n,
        type: 'custom',
        data: {
          label: n.data.label || NODE_DEFINITIONS[n.type]?.label || n.type,
          type: n.type,
          config: n.data.config || {},
          status: 'idle'
        }
      }));

      const newEdges = data.edges.map((e) => ({
        ...e,
        type: 'custom',
        animated: true,
        style: DEFAULT_EDGE_STYLE
      }));

      setNodes(newNodes);
      setEdges(newEdges);

      const nodesNeedingGuide = newNodes
        .map((n) => n.data.type)
        .filter((type) => CREDENTIAL_GUIDES[type])
        .filter((value, index, self) => self.indexOf(value) === index);

      setGuideNodes(nodesNeedingGuide);
      setShowAiModal(false);
      setAiPrompt("");
      setToast({ msg: "Workflow generated.", type: "success" });
    } catch (e) {
      setToast({ msg: "AI generation failed. Try again.", type: "error" });
    }
    setIsGenerating(false);
  };

  const saveWorkflow = async () => {
    await axios.post(
      'http://localhost:5005/api/workflows',
      { id, name: workflowName, nodes, edges },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setToast({ msg: "Workflow saved.", type: "success" });
  };

  const executeWorkflow = async () => {
    setIsRunning(true);
    setToast({ msg: "Starting run...", type: "info" });
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'idle' } })));
    try {
      const { data } = await axios.post('http://localhost:5005/api/run', { nodes, edges });
      for (const log of data.logs) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === log.nodeId ? { ...n, data: { ...n.data, status: log.status } } : n
          )
        );
        if (log.status === 'error') setToast({ msg: log.output.error, type: 'error' });
        await new Promise((r) => setTimeout(r, 600));
      }
      if (data.logs.every((l) => l.status === 'success')) setToast({ msg: "All agents completed.", type: "success" });
    } catch (e) {
      setToast({ msg: "Execution error.", type: "error" });
    }
    setIsRunning(false);
  };

  const updateConfig = (key, val) => {
    if (!selectedNode) return;
    setNodes((ns) =>
      ns.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: val } } }
          : n
      )
    );
    setSelectedNode((prev) => ({
      ...prev,
      data: { ...prev.data, config: { ...prev.data.config, [key]: val } }
    }));
  };

  const selectedDef = selectedNode ? NODE_DEFINITIONS[selectedNode.data.type] : null;

  const groupedNodes = Object.entries(NODE_DEFINITIONS).reduce((acc, [key, def]) => {
    if (def.label.toLowerCase().includes(search.toLowerCase())) {
      if (!acc[def.category]) acc[def.category] = [];
      acc[def.category].push({ key, ...def });
    }
    return acc;
  }, {});

  const toastStyle = toast?.type === "success"
    ? "bg-emerald-600 text-white"
    : toast?.type === "error"
      ? "bg-rose-600 text-white"
      : "bg-indigo-600 text-white";

  return (
    <div className="min-h-screen w-full text-slate-900">
      <div className="flex min-h-screen flex-col gap-4 p-4 md:flex-row md:p-6">
        <aside
          className={`glass-panel w-full rounded-3xl p-4 md:sticky md:top-6 md:h-[calc(100vh-3rem)] transition-all ${
            isDrawerCollapsed ? 'md:w-20' : 'md:w-64'
          }`}
        >
          <div className={`flex h-full flex-col ${isDrawerCollapsed ? 'items-center' : ''} gap-6`}>
            <div className={`flex w-full items-center ${isDrawerCollapsed ? 'justify-center' : 'justify-between'}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-xs font-bold uppercase tracking-[0.2em] text-white">
                  AX
                </div>
                {!isDrawerCollapsed && (
                  <div>
                    <div className="text-sm font-semibold">AgenXNodes</div>
                    <div className="text-xs text-slate-500">Automation Studio</div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerCollapsed((prev) => !prev)}
                className="ml-auto hidden h-8 w-8 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-500 transition hover:bg-white md:flex"
                title={isDrawerCollapsed ? 'Expand drawer' : 'Collapse drawer'}
              >
                {isDrawerCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            <nav className={`flex flex-row gap-2 overflow-x-auto md:flex-col ${isDrawerCollapsed ? 'items-center' : ''}`}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-white ${
                  isDrawerCollapsed ? 'w-10 justify-center bg-white/70' : 'bg-white/70'
                }`}
                title="Dashboard"
              >
                <LayoutGrid className="h-4 w-4" />
                {!isDrawerCollapsed && 'Dashboard'}
              </button>
              <div
                className={`flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-left text-sm font-medium text-white shadow-soft ${
                  isDrawerCollapsed ? 'w-10 justify-center' : ''
                }`}
                title="Workflow Canvas"
              >
                <Layers3 className="h-4 w-4" />
                {!isDrawerCollapsed && 'Workflow Canvas'}
              </div>
            </nav>

            {!isDrawerCollapsed ? (
              <div className="rounded-2xl border border-white/50 bg-white/70 p-4 text-xs text-slate-600 shadow-soft">
                <div className="text-sm font-semibold text-slate-900">Agent Status</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-900/5 px-3 py-2 text-[11px]">
                  <span>Running</span>
                  <span className="font-semibold text-slate-900">{isRunning ? "Yes" : "Idle"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-900/5 px-3 py-2 text-[11px]">
                  <span>Nodes</span>
                  <span className="font-semibold text-slate-900">{nodes.length}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/50 bg-white/70 p-3 text-[11px] text-slate-500 shadow-soft">
                <PanelLeft className="h-4 w-4 text-indigo-500" />
                <span>{nodes.length}</span>
              </div>
            )}

            <div className={`mt-auto ${isDrawerCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-2'}`}>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className={`rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500 ${
                  isDrawerCollapsed ? 'w-10 px-0' : 'w-full'
                }`}
                title="AI Workflow"
              >
                {isDrawerCollapsed ? <Bot className="mx-auto h-4 w-4" /> : 'AI Workflow'}
              </button>
              <button
                type="button"
                onClick={saveWorkflow}
                className={`rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white ${
                  isDrawerCollapsed ? 'w-10 px-0' : 'w-full'
                }`}
                title="Save Workflow"
              >
                {isDrawerCollapsed ? <Save className="mx-auto h-4 w-4" /> : 'Save Workflow'}
              </button>
              {isDrawerCollapsed && (
                <button
                  type="button"
                  onClick={executeWorkflow}
                  disabled={isRunning}
                  className="w-10 rounded-xl bg-indigo-600 px-0 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-70"
                  title="Run"
                >
                  <Play className="mx-auto h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col gap-4">
          <header className="glass-panel-strong rounded-3xl px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Workflow</div>
                <input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full max-w-md border-none bg-transparent text-xl font-semibold text-slate-900 outline-none"
                />
                <div className="text-xs text-slate-500">AI-driven automation canvas</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(isRunning || isGenerating) && (
                  <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                    {isRunning ? "Agents running" : "Generating workflow"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="rounded-xl border border-indigo-200/60 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={saveWorkflow}
                  className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={executeWorkflow}
                  disabled={isRunning}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-70"
                >
                  {isRunning ? "Running" : "Run"}
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 lg:flex-row">
            <aside
              className={`glass-panel w-full rounded-3xl p-4 transition-all ${
                isLibraryCollapsed ? 'lg:w-20' : 'lg:w-72'
              }`}
            >
              <div className={`flex items-center justify-between ${isLibraryCollapsed ? 'mb-0' : ''}`}>
                {!isLibraryCollapsed && (
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Node Library</div>
                    <div className="text-sm font-semibold text-slate-900">Drag nodes onto canvas</div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsLibraryCollapsed((prev) => !prev)}
                  className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-500 transition hover:bg-white"
                  title={isLibraryCollapsed ? 'Expand Node Library' : 'Collapse Node Library'}
                >
                  {isLibraryCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              </div>

              {isLibraryCollapsed ? (
                <div className="mt-6 grid gap-3">
                  {['manual', 'openai', 'gemini', 'slack', 'httpRequest', 'condition'].map((key) => (
                    <div
                      key={key}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-soft"
                      title={NODE_DEFINITIONS[key]?.label}
                    >
                      <NodeIcon name={NODE_DEFINITIONS[key]?.icon} className="h-5 w-5" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <input
                    className="mt-4 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Search nodes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <div className="mt-4 max-h-[55vh] space-y-4 overflow-y-auto pr-1">
                    {Object.entries(groupedNodes).map(([cat, items]) => (
                      <div key={cat}>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                          {cat}
                        </div>
                        <div className="mt-2 space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.key}
                              className="group flex cursor-grab items-center gap-3 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', item.key)}
                            >
                              <span
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/5 text-sm"
                                style={{ color: item.color }}
                              >
                                <NodeIcon name={item.icon} className="h-4 w-4" />
                              </span>
                              <span className="flex-1 font-medium">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </aside>

            <div className="relative flex min-h-[60vh] flex-1 flex-col rounded-3xl border border-white/60 bg-white/70 p-2 shadow-soft">
              <div className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-soft">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Live Canvas
              </div>

              {isLoadingWorkflow && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400/40 border-t-slate-600" />
                    Loading workflow
                  </div>
                </div>
              )}

              <div className="h-full w-full rounded-3xl" ref={reactFlowWrapper}>
                <ReactFlowProvider>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onNodeClick={(e, n) => setSelectedNode(n)}
                    defaultEdgeOptions={{ type: 'custom', animated: true, style: DEFAULT_EDGE_STYLE }}
                    className="h-full w-full rounded-3xl"
                  >
                    <Background variant="dots" gap={18} size={1.2} color="rgba(15, 23, 42, 0.12)" />
                    <Controls showInteractive={false} className="!m-4" />
                  </ReactFlow>
                </ReactFlowProvider>
              </div>
            </div>

            <aside
              className={`glass-panel w-full rounded-3xl p-4 transition-all ${
                isSettingsCollapsed ? 'lg:w-20' : 'lg:w-80'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/60 pb-3">
                {!isSettingsCollapsed && (
                  <div className="text-sm font-semibold text-slate-900">Node Settings</div>
                )}
                <button
                  type="button"
                  onClick={() => setIsSettingsCollapsed((prev) => !prev)}
                  className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-500 transition hover:bg-white"
                  title={isSettingsCollapsed ? 'Expand Settings' : 'Collapse Settings'}
                >
                  {isSettingsCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {!isSettingsCollapsed && selectedNode && (
                  <button
                    type="button"
                    className="rounded-full border border-slate-200/70 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-500"
                    onClick={() => setSelectedNode(null)}
                  >
                    Close
                  </button>
                )}
              </div>

              {isSettingsCollapsed ? (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-soft">
                    <Sliders className="h-5 w-5 text-indigo-500" />
                  </div>
                  {selectedNode && selectedDef && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-soft">
                      <NodeIcon name={selectedDef.icon} className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {!selectedNode && (
                    <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm text-slate-500">
                      Select a node on the canvas to edit its configuration and credentials.
                    </div>
                  )}

                  {selectedNode && selectedDef && (
                    <>
                      <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                          <span style={{ color: selectedDef.color }}>
                            <NodeIcon name={selectedDef.icon} className="h-4 w-4" />
                          </span>
                          {selectedDef.label}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Customize node inputs below.</div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600">Node name</label>
                        <input
                          value={selectedNode.data.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNodes((ns) =>
                              ns.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, label: val } } : n))
                            );
                            setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: val } });
                          }}
                          className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>

                      {CREDENTIAL_GUIDES[selectedNode.data.type] && (
                        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs text-amber-700">
                          Need keys?{" "}
                          <a
                            href={CREDENTIAL_GUIDES[selectedNode.data.type].url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-amber-800 underline-offset-2 hover:underline"
                          >
                            Get {CREDENTIAL_GUIDES[selectedNode.data.type].title} credentials
                          </a>
                        </div>
                      )}

                      {selectedDef.fields.map((field) => (
                        <div key={field.name}>
                          <label className="text-xs font-semibold text-slate-600">{field.label}</label>
                          {field.type === 'textarea' ? (
                            <textarea
                              rows="3"
                              value={selectedNode.data.config[field.name] || ''}
                              onChange={(e) => updateConfig(field.name, e.target.value)}
                              placeholder={field.placeholder}
                              className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                            />
                          ) : field.type === 'select' ? (
                            <select
                              value={selectedNode.data.config[field.name] || field.options?.[0] || ''}
                              onChange={(e) => updateConfig(field.name, e.target.value)}
                              className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                            >
                              {field.options?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              value={selectedNode.data.config[field.name] || ''}
                              onChange={(e) => updateConfig(field.name, e.target.value)}
                              placeholder={field.placeholder}
                              className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                            />
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="glass-panel-strong w-full max-w-xl rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">AI Generator</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Describe your workflow</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Example: "When a user submits a form, analyze sentiment with Gemini and send an email on negative sentiment."
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500"
              >
                Close
              </button>
            </div>

            <textarea
              rows="4"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Type your workflow request..."
              className="mt-4 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            />

            {isGenerating && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`gen-${idx}`}
                    className="h-14 animate-pulse rounded-2xl border border-white/60 bg-white/70 shadow-soft"
                  />
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Generating
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {guideNodes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="glass-panel-strong w-full max-w-2xl rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Setup required</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Add credentials to run</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Your workflow is ready. Add credentials for the nodes below to start automation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGuideNodes([])}
                className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid max-h-[320px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {guideNodes.map((type) => (
                <div key={type} className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm text-slate-700 shadow-soft">
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: NODE_DEFINITIONS[type].color }}>
                    <NodeIcon name={NODE_DEFINITIONS[type].icon} className="h-4 w-4" />
                    {NODE_DEFINITIONS[type].label}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-xs text-slate-500">
                    {CREDENTIAL_GUIDES[type]?.instructions}
                  </p>
                  <a
                    href={CREDENTIAL_GUIDES[type]?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Get keys
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setGuideNodes([])}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-glass ${toastStyle}`}>
            <span className="h-2 w-2 rounded-full bg-white/80" />
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
