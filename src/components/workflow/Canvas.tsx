import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ZoomIn, ZoomOut, Lock, Unlock, Maximize2 } from "lucide-react";
import { Button } from "../ui/button";
import { WorkflowNode } from "./NodeTypes";
import { Node } from "./Node";

interface CanvasProps {
  nodes: WorkflowNode[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onSelectNode: (id: string, multiSelect: boolean) => void;
  onDeleteNode: (id: string) => void;
  onEditNode: (id: string, newName: string) => void;
  darkMode?: boolean;
}

export function Canvas({ nodes, onNodesChange, onSelectNode, onDeleteNode, onEditNode, darkMode = true }: CanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const startPanRef = useRef({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.max(0.5, Math.min(2, prev * delta)));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && e.button === 0) {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && !isLocked) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    } else if (draggedNodeId) {
      const node = nodes.find(n => n.id === draggedNodeId);
      if (node) {
        const newX = (e.clientX - dragOffset.x - pan.x) / zoom;
        const newY = (e.clientY - dragOffset.y - pan.y) / zoom;
        
        const updatedNodes = nodes.map(n => 
          n.id === draggedNodeId 
            ? { ...n, position: { x: newX, y: newY } }
            : n
        );
        onNodesChange(updatedNodes);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleNodeDragStart = (id: string, e: React.MouseEvent) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      setDraggedNodeId(id);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - (node.position.x * zoom + pan.x + rect.left),
          y: e.clientY - (node.position.y * zoom + pan.y + rect.top)
        });
      }
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(2, prev * 1.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev / 1.2));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setDraggedNodeId(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div 
      ref={canvasRef}
      className={`absolute inset-0 overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-[#03071E] via-[#0a0a1a] to-[#03071E]' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isPanning ? 'grabbing' : 'default' }}
    >
      {/* Dotted grid background */}
      <div 
        className={`absolute inset-0 pointer-events-none ${darkMode ? 'opacity-30' : 'opacity-20'}`}
        style={{
          backgroundImage: darkMode 
            ? 'radial-gradient(circle, rgba(255,186,8,0.4) 1.5px, transparent 1.5px)'
            : 'radial-gradient(circle, rgba(255,186,8,0.6) 1.5px, transparent 1.5px)',
          backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Canvas content */}
      <div
        className="z-10"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {nodes.map((node, i) => {
            if (i < nodes.length - 1) {
              const nextNode = nodes[i + 1];
              const x1 = node.position.x + (node.type === 'trigger' ? 40 : 64);
              const y1 = node.position.y + (node.type === 'trigger' ? 40 : 48);
              const x2 = nextNode.position.x + (nextNode.type === 'trigger' ? 40 : 64);
              const y2 = nextNode.position.y + (nextNode.type === 'trigger' ? 40 : 48);
              
              const midX = (x1 + x2) / 2;
              
              return (
                <motion.path
                  key={`${node.id}-${nextNode.id}`}
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  stroke="url(#connectionGradient)"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              );
            }
            return null;
          })}
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFBA08" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0072FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFBA08" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            onSelect={onSelectNode}
            onDragStart={handleNodeDragStart}
            onDrag={handleMouseMove}
            onDragEnd={handleMouseUp}
            isDragging={draggedNodeId === node.id}
            onDelete={onDeleteNode}
            onEdit={onEditNode}
            darkMode={darkMode}
          />
        ))}
      </div>

      {/* Controls */}
      <div className={`absolute top-4 right-4 z-30 flex flex-col gap-2 backdrop-blur-md rounded-xl p-2 border ${
        darkMode ? 'bg-black/40 border-white/10' : 'bg-white/90 border-gray-200'
      }`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className={darkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className={darkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetView}
          className={darkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <div className={`h-px my-1 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsLocked(!isLocked)}
          className={`${isLocked ? 'text-[#FFBA08]' : darkMode ? 'text-white' : 'text-gray-700'} ${
            darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
          title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </Button>
      </div>

      {/* Minimap */}
      <div className={`absolute bottom-4 right-4 z-30 w-48 h-32 backdrop-blur-md rounded-xl border overflow-hidden ${
        darkMode ? 'bg-black/40 border-white/10' : 'bg-white/90 border-gray-200'
      }`}>
        <div className="w-full h-full relative">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,186,8,0.6) 1px, transparent 1px)',
              backgroundSize: '10px 10px',
            }}
          />
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute w-2 h-2 rounded-full bg-[#FFBA08]"
              style={{
                left: `${(node.position.x / 2000) * 100}%`,
                top: `${(node.position.y / 1500) * 100}%`,
              }}
            />
          ))}
          <div
            className={`absolute border-2 rounded ${darkMode ? 'border-white/50' : 'border-gray-400'}`}
            style={{
              left: `${(-pan.x / zoom / 2000) * 100}%`,
              top: `${(-pan.y / zoom / 1500) * 100}%`,
              width: `${(100 / zoom)}%`,
              height: `${(100 / zoom)}%`,
            }}
          />
        </div>
      </div>

      {/* Zoom indicator */}
      <div className={`absolute bottom-4 left-4 z-30 backdrop-blur-md rounded-lg px-3 py-2 border ${
        darkMode ? 'bg-black/40 border-white/10' : 'bg-white/90 border-gray-200'
      }`}>
        <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-700'}`}>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
