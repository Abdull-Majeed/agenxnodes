import { useState } from "react";
import { Zap, Brain, Database, MessageSquare } from "lucide-react";
import { LeftDrawer } from "./workflow/LeftDrawer";
import { RightDrawer } from "./workflow/RightDrawer";
import { Canvas } from "./workflow/Canvas";
import { PromptBar } from "./workflow/PromptBar";
import { WorkflowNode, NodeCategory } from "./workflow/NodeTypes";

interface WorkflowBuilderProps {
  onNavigate: (page: string) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function WorkflowBuilder({ onNavigate, darkMode, setDarkMode }: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [nextNodeId, setNextNodeId] = useState(1);
  const [isPromptBarExpanded, setIsPromptBarExpanded] = useState(true);

  const handleAddNode = (category: NodeCategory) => {
    const canvasCenter = {
      x: 400 + (nodes.length * 200),
      y: 300 + (Math.random() * 100 - 50),
    };

    const newNode: WorkflowNode = {
      id: `node-${nextNodeId}`,
      type: category.type,
      category: category.id,
      name: category.name,
      icon: category.icon,
      position: canvasCenter,
      selected: false,
    };

    setNodes([...nodes, newNode]);
    setNextNodeId(nextNodeId + 1);
  };

  const handlePromptSubmit = (prompt: string) => {
    console.log("Prompt submitted:", prompt);
    
    // Simulate AI workflow generation
    // In a real app, this would call an AI API to parse the prompt
    // and generate appropriate nodes
    
    // For demo purposes, generate a simple workflow based on keywords
    const lowercasePrompt = prompt.toLowerCase();
    const generatedNodes: WorkflowNode[] = [];
    let x = 300;
    const y = 300;
    let id = nextNodeId;

    // Check for trigger keywords
    if (lowercasePrompt.includes('email') || lowercasePrompt.includes('webhook') || lowercasePrompt.includes('schedule')) {
      generatedNodes.push({
        id: `node-${id++}`,
        type: 'trigger',
        category: 'webhook',
        name: 'Webhook Trigger',
        icon: Zap,
        position: { x, y },
      });
      x += 200;
    }

    // Check for AI/processing keywords
    if (lowercasePrompt.includes('openai') || lowercasePrompt.includes('ai') || lowercasePrompt.includes('summarize') || lowercasePrompt.includes('analyze')) {
      generatedNodes.push({
        id: `node-${id++}`,
        type: 'ai',
        category: 'openai',
        name: 'OpenAI',
        icon: Brain,
        position: { x, y },
      });
      x += 200;
    }

    // Check for database keywords
    if (lowercasePrompt.includes('mysql') || lowercasePrompt.includes('database') || lowercasePrompt.includes('save') || lowercasePrompt.includes('store')) {
      generatedNodes.push({
        id: `node-${id++}`,
        type: 'database',
        category: 'mysql',
        name: 'MySQL',
        icon: Database,
        position: { x, y },
      });
      x += 200;
    }

    // Check for action keywords
    if (lowercasePrompt.includes('slack') || lowercasePrompt.includes('send') || lowercasePrompt.includes('notify')) {
      generatedNodes.push({
        id: `node-${id++}`,
        type: 'action',
        category: 'slack',
        name: 'Slack Message',
        icon: MessageSquare,
        position: { x, y },
      });
    }

    if (generatedNodes.length > 0) {
      setNodes([...nodes, ...generatedNodes]);
      setNextNodeId(id);
    }
  };

  const handleSelectNode = (id: string, multiSelect: boolean) => {
    if (multiSelect) {
      setNodes(nodes.map(node => 
        node.id === id ? { ...node, selected: !node.selected } : node
      ));
    } else {
      setNodes(nodes.map(node => ({
        ...node,
        selected: node.id === id
      })));
    }
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(node => node.id !== id));
  };

  const handleEditNode = (id: string, newName: string) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, name: newName } : node
    ));
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-[#03071E]' : 'bg-white'}`}>
      <LeftDrawer 
        onNavigate={onNavigate} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      <div className="relative flex-1">
        <Canvas 
          nodes={nodes}
          onNodesChange={setNodes}
          onSelectNode={handleSelectNode}
          onDeleteNode={handleDeleteNode}
          onEditNode={handleEditNode}
          darkMode={darkMode}
        />
        
        <PromptBar 
          onSubmit={handlePromptSubmit} 
          darkMode={darkMode}
          isExpanded={isPromptBarExpanded}
          setIsExpanded={setIsPromptBarExpanded}
        />
      </div>
      
      <RightDrawer onAddNode={handleAddNode} darkMode={darkMode} />
    </div>
  );
}
