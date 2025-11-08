import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WorkflowNode, getNodeStyle } from "./NodeTypes";
import { GripVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "../ui/button";

interface NodeProps {
  node: WorkflowNode;
  onSelect: (id: string, multiSelect: boolean) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onDrag: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, newName: string) => void;
  darkMode?: boolean;
}

export function Node({ node, onSelect, onDragStart, isDragging, onDelete, onEdit, darkMode = true }: NodeProps) {
  const Icon = node.icon;
  const isFlowNode = node.type === 'flow';
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(node.name);
  const [showActions, setShowActions] = useState(false);

  const getGradient = () => {
    switch (node.type) {
      case 'trigger':
        return 'from-[#FFBA08] to-[#FAA307]';
      case 'action':
        return 'from-[#0072FF] to-[#00C6FF]';
      case 'data':
        return 'from-[#E85D04] to-[#D00000]';
      case 'database':
        return 'from-[#0072FF] via-[#00C6FF] to-[#0072FF]';
      case 'flow':
        return 'from-[#FFBA08] to-[#E85D04]';
      case 'ai':
        return 'from-[#00C6FF] via-[#FFBA08] to-[#FAA307]';
      default:
        return 'from-[#FFBA08] to-[#FAA307]';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedName(node.name);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editedName.trim()) {
      onEdit(node.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedName(node.name);
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onDragStart(node.id, e);
        onSelect(node.id, e.shiftKey);
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        if (isEditing) {
          setIsEditing(false);
          setEditedName(node.name);
        }
      }}
      className="group z-20"
    >
      <div
        className={`
          relative
          ${isFlowNode ? 'w-24 h-24' : node.type === 'trigger' ? 'w-20 h-20' : 'w-32 h-24'}
          ${getNodeStyle(node.type)}
          bg-gradient-to-br ${getGradient()}
          ${node.selected ? 'ring-4 ring-white/50 ring-offset-2 ring-offset-[#03071E]' : ''}
          shadow-lg
          transition-all duration-200
          hover:shadow-2xl hover:scale-105
        `}
        style={{
          boxShadow: node.selected 
            ? `0 0 30px rgba(255, 186, 8, 0.6)` 
            : `0 10px 30px rgba(0, 0, 0, 0.3)`
        }}
      >
        {/* Connection ports */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/90 border-2 border-[#FFBA08] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/90 border-2 border-[#FFBA08] opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Node content */}
        <div className={`
          flex flex-col items-center justify-center h-full gap-2
          ${isFlowNode ? 'rotate-[-45deg]' : ''}
          text-white
        `}>
          <Icon className={node.type === 'trigger' ? 'w-8 h-8' : 'w-7 h-7'} strokeWidth={2} />
          {node.type !== 'trigger' && (
            <span className="text-xs px-2 text-center line-clamp-1">{node.name}</span>
          )}
        </div>

        {/* Drag handle */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-5 h-5 text-white drop-shadow-lg" />
        </div>

        {/* Glow effect */}
        {node.selected && (
          <motion.div
            className={`absolute inset-0 ${getNodeStyle(node.type)} bg-gradient-to-br ${getGradient()}`}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'blur(20px)', zIndex: -1 }}
          />
        )}
      </div>

      {/* Node label (below node) */}
      {node.type === 'trigger' && !isEditing && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className={`text-xs px-2 py-1 rounded backdrop-blur-sm ${
            darkMode ? 'text-white/80 bg-black/30' : 'text-gray-700 bg-white/80'
          }`}>
            {node.name}
          </span>
        </div>
      )}

      {/* Edit Input - shown when editing */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  handleSaveEdit(e as any);
                } else if (e.key === 'Escape') {
                  handleCancelEdit(e as any);
                }
              }}
              className={`text-xs px-2 py-1 rounded border-2 border-[#FFBA08] outline-none ${
                darkMode ? 'bg-[#03071E] text-white' : 'bg-white text-gray-900'
              }`}
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSaveEdit}
              className="h-6 w-6 bg-green-500 hover:bg-green-600 text-white"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancelEdit}
              className="h-6 w-6 bg-red-500 hover:bg-red-600 text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <AnimatePresence>
        {showActions && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 backdrop-blur-md rounded-lg p-1 border"
            style={{
              backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
              borderColor: darkMode ? 'rgba(255,186,8,0.3)' : 'rgba(255,186,8,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={handleEditClick}
              className={`h-7 w-7 hover:bg-[#FFBA08]/20 ${darkMode ? 'text-white' : 'text-gray-700'}`}
              title="Edit Node"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              className={`h-7 w-7 hover:bg-red-500/20 ${darkMode ? 'text-white hover:text-red-400' : 'text-gray-700 hover:text-red-600'}`}
              title="Delete Node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
