import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, Loader2, Plus, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";

interface PromptBarProps {
  onSubmit: (prompt: string) => void;
  darkMode?: boolean;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

export function PromptBar({ onSubmit, darkMode = true, isExpanded, setIsExpanded }: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setIsProcessing(true);
      onSubmit(prompt);
      
      // Simulate AI processing
      setTimeout(() => {
        setIsProcessing(false);
        setPrompt("");
      }, 1500);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-6">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`backdrop-blur-xl rounded-2xl border shadow-2xl ${
              darkMode 
                ? 'border-white/10 bg-[#03071E]/95' 
                : 'border-gray-200 bg-white/95'
            }`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFBA08]" />
                  <span className={`${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    AI Workflow Builder
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleExpanded}
                  className={`h-7 w-7 rounded-full ${
                    darkMode 
                      ? 'hover:bg-white/10 text-white/60' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="relative">
                {/* Glow effect */}
                <motion.div
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#FFBA08]/20 via-[#0072FF]/20 to-[#FFBA08]/20 blur-xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <div className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl border border-[#FFBA08]/30 shadow-xl ${
                  darkMode ? 'bg-gradient-to-r from-[#1a1a2e] to-[#03071E]' : 'bg-gradient-to-r from-white to-gray-50'
                }`}>
                  {/* AI Icon */}
                  <motion.div
                    animate={{
                      rotate: isProcessing ? 360 : 0,
                    }}
                    transition={{
                      duration: 2,
                      repeat: isProcessing ? Infinity : 0,
                      ease: "linear"
                    }}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 text-[#FFBA08]" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-[#FFBA08]" />
                    )}
                  </motion.div>

                  {/* Input */}
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your workflow... (e.g., 'Create a workflow that summarizes text using OpenAI and saves it to MySQL')"
                    disabled={isProcessing}
                    className={`flex-1 bg-transparent outline-none disabled:opacity-50 ${
                      darkMode ? 'text-white placeholder:text-white/40' : 'text-gray-900 placeholder:text-gray-400'
                    }`}
                  />

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1"
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[#FFBA08]"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[#FAA307]"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[#E85D04]"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!prompt.trim() || isProcessing}
                    className="rounded-xl bg-gradient-to-r from-[#FFBA08] to-[#FAA307] text-[#03071E] hover:opacity-90 disabled:opacity-50 shadow-lg shadow-[#FFBA08]/30"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>

              {/* Suggestions */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Try:</span>
                {[
                  "Email to Slack workflow",
                  "Analyze sentiment with AI",
                  "Schedule database backup"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className={`text-xs px-3 py-1.5 rounded-full border hover:border-[#FFBA08]/50 transition-all ${
                      darkMode 
                        ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 border-white/10'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border-gray-200'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`backdrop-blur-xl rounded-full border shadow-2xl ${
              darkMode 
                ? 'border-white/10 bg-[#03071E]/95' 
                : 'border-gray-200 bg-white/95'
            }`}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpanded}
                className={`h-10 w-10 rounded-full bg-gradient-to-r from-[#FFBA08] to-[#FAA307] text-[#03071E] hover:opacity-90 shadow-lg shadow-[#FFBA08]/30`}
                title="Add Node"
              >
                <Plus className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpanded}
                className={`h-10 w-10 rounded-full ${
                  darkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Open AI Prompt"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpanded}
                className={`h-8 w-8 rounded-full ${
                  darkMode 
                    ? 'hover:bg-white/10 text-white/60' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
                title="Expand"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
