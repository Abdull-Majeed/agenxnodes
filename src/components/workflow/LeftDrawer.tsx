import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Settings, 
  GitBranch, 
  Link, 
  CreditCard, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Database,
  MousePointerClick
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface LeftDrawerProps {
  onNavigate: (page: string) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function LeftDrawer({ onNavigate, darkMode, setDarkMode }: LeftDrawerProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Home', onClick: () => onNavigate('landing') },
    { icon: GitBranch, label: 'Workflows', active: true },
    { icon: Link, label: 'Connections' },
    { icon: CreditCard, label: 'Billing' },
    { icon: FileText, label: 'Logs' },
    { icon: Settings, label: 'Settings' },
  ];

  const iconItems = [
    { icon: MousePointerClick, label: 'Select Tool' },
    { icon: GitBranch, label: 'Connections' },
    { icon: Database, label: 'Data Sources' },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 70 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`h-full border-r flex flex-col backdrop-blur-xl ${
        darkMode ? 'bg-[#03071E] border-white/10' : 'bg-white border-gray-200'
      }`}
    >
      {/* Logo & Toggle */}
      <div className="p-4 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFBA08] to-[#E85D04] flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-[#03071E]" />
              </div>
              <span className={darkMode 
                ? "bg-gradient-to-r from-[#FFBA08] to-[#FAA307] bg-clip-text text-transparent"
                : "bg-gradient-to-r from-[#FFBA08] to-[#FAA307] bg-clip-text text-transparent"
              }>
                AGX
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={darkMode 
            ? "text-white/70 hover:text-white hover:bg-white/10"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <Separator className={darkMode ? "bg-white/10" : "bg-gray-200"} />

      {/* Main Menu */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            onClick={item.onClick}
            className={`
              w-full justify-start gap-3
              ${item.active 
                ? 'bg-gradient-to-r from-[#FFBA08]/20 to-[#FAA307]/20 text-[#FFBA08] border border-[#FFBA08]/30' 
                : darkMode
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }
              ${collapsed ? 'px-2' : 'px-3'}
            `}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        ))}
      </div>

      <Separator className={darkMode ? "bg-white/10" : "bg-gray-200"} />

      {/* Middle Icons Section */}
      <div className="p-3 space-y-1">
        {iconItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={`
              w-full justify-start gap-3
              ${darkMode 
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }
              ${collapsed ? 'px-2' : 'px-3'}
            `}
            title={item.label}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        ))}
      </div>

      <Separator className={darkMode ? "bg-white/10" : "bg-gray-200"} />

      {/* Dark Mode Toggle */}
      <div className="p-3">
        <Button
          variant="ghost"
          onClick={() => setDarkMode(!darkMode)}
          className={`
            w-full justify-start gap-3
            ${darkMode 
              ? 'text-white/70 hover:text-white hover:bg-white/10'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }
            ${collapsed ? 'px-2' : 'px-3'}
          `}
        >
          <motion.div
            animate={{ rotate: darkMode ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="shrink-0"
          >
            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  );
}
