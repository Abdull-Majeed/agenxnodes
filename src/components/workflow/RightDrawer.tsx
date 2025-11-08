import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { nodeCategories, NodeCategory } from "./NodeTypes";

interface RightDrawerProps {
  onAddNode: (category: NodeCategory) => void;
  darkMode?: boolean;
}

export function RightDrawer({ onAddNode, darkMode = true }: RightDrawerProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    Object.keys(nodeCategories)
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredCategories = Object.entries(nodeCategories).reduce((acc, [key, nodes]) => {
    const filtered = nodes.filter((node) =>
      node.name.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[key] = filtered;
    }
    return acc;
  }, {} as Record<string, NodeCategory[]>);

  return (
    <div className={`w-80 h-full flex flex-col backdrop-blur-xl border-l ${
      darkMode ? 'bg-[#03071E] border-white/10' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <h3 className={darkMode ? 'text-white mb-3' : 'text-gray-900 mb-3'}>Node Library</h3>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            darkMode ? 'text-white/40' : 'text-gray-400'
          }`} />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={darkMode 
              ? 'pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FFBA08] focus:ring-[#FFBA08]/20'
              : 'pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FFBA08] focus:ring-[#FFBA08]/20'
            }
          />
        </div>
      </div>

      {/* Node Categories */}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-3 space-y-2">
          {Object.entries(filteredCategories).map(([categoryName, nodes]) => (
            <div key={categoryName} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryName)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  darkMode ? 'text-white/90 hover:bg-white/5' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm">{categoryName}</span>
                {expandedCategories.includes(categoryName) ? (
                  <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-white/50' : 'text-gray-500'}`} />
                ) : (
                  <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-white/50' : 'text-gray-500'}`} />
                )}
              </button>

              {/* Category Nodes */}
              <AnimatePresence>
                {expandedCategories.includes(categoryName) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-1 pl-2"
                  >
                    {nodes.map((node) => (
                      <motion.button
                        key={node.id}
                        onClick={() => onAddNode(node)}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border hover:border-[#FFBA08]/50 transition-all group cursor-grab active:cursor-grabbing ${
                          darkMode 
                            ? 'bg-white/5 hover:bg-white/10 border-white/10' 
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }`}
                        style={{
                          background: darkMode 
                            ? `linear-gradient(135deg, ${node.color}10, transparent)`
                            : `linear-gradient(135deg, ${node.color}15, transparent)`,
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${node.color}, ${node.color}dd)`,
                          }}
                        >
                          <node.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className={`text-sm transition-colors ${
                          darkMode 
                            ? 'text-white/90 group-hover:text-white' 
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {node.name}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className={`text-xs space-y-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          <p>💡 Drag nodes onto the canvas</p>
          <p>⌨️ Shift+Click for multi-select</p>
        </div>
      </div>
    </div>
  );
}
