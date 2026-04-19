import { motion } from "motion/react";
import { 
  Workflow, GitBranch, Code2, Laptop, Boxes, Binary, 
  Sparkles, Network, Database, Cpu, Braces, FileCode 
} from "lucide-react";

interface FloatingIcon {
  id: string;
  icon: any;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

export function AnimatedWorkflowBackground() {
  const icons: FloatingIcon[] = [
    { id: '1', icon: Workflow, x: 15, y: 20, delay: 0, duration: 20, size: 48 },
    { id: '2', icon: Laptop, x: 70, y: 15, delay: 2, duration: 25, size: 56 },
    { id: '3', icon: Code2, x: 25, y: 60, delay: 1, duration: 22, size: 44 },
    { id: '4', icon: GitBranch, x: 80, y: 65, delay: 3, duration: 23, size: 40 },
    { id: '5', icon: Boxes, x: 50, y: 35, delay: 1.5, duration: 24, size: 52 },
    { id: '6', icon: Network, x: 10, y: 75, delay: 2.5, duration: 21, size: 42 },
    { id: '7', icon: Database, x: 85, y: 40, delay: 0.5, duration: 26, size: 46 },
    { id: '8', icon: Sparkles, x: 40, y: 70, delay: 3.5, duration: 19, size: 38 },
    { id: '9', icon: Cpu, x: 60, y: 25, delay: 1.2, duration: 23, size: 50 },
    { id: '10', icon: Binary, x: 30, y: 45, delay: 2.8, duration: 22, size: 40 },
    { id: '11', icon: Braces, x: 75, y: 80, delay: 0.8, duration: 24, size: 44 },
    { id: '12', icon: FileCode, x: 20, y: 30, delay: 3.2, duration: 20, size: 48 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-40">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFB700]/5 via-transparent to-[#FFB700]/5" />

      {/* Floating icons */}
      {icons.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.id}
            className="absolute"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
            initial={{ y: 0, opacity: 0.4 }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.4, 0.7, 0.4],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon 
              className="text-white/60" 
              style={{ 
                width: item.size, 
                height: item.size,
                strokeWidth: 1.5,
              }} 
            />
          </motion.div>
        );
      })}

      {/* Subtle animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-64 h-64 bg-[#FFB700]/10 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#FFB700]/8 rounded-full blur-[120px]"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}