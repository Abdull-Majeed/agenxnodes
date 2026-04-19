import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Network, Database, Zap, GitBranch, Code2, ChevronRight, 
  MousePointerClick, Edit3, Bell, Users, Activity, FileText, 
  Timer, Layers, TrendingUp, Shield, Settings 
} from "lucide-react";
import logoImage from 'figma:asset/3a52773383009544bf518db8182ae38b7a14ae90.png';
import { useState, useEffect } from "react";

// Animated Workflow Section Component
function WorkflowAnimationSection() {
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const fullText = "Send daily reports";

  useEffect(() => {
    // Typing animation
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 150);
      return () => clearTimeout(timeout);
    } else {
      // Start the workflow animation cycle after typing completes
      const timeout = setTimeout(() => {
        setAnimationPhase(1);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [typedText]);

  useEffect(() => {
    // Cursor blink
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animation phase cycle
    if (animationPhase === 1) {
      const timeout = setTimeout(() => setAnimationPhase(2), 1500);
      return () => clearTimeout(timeout);
    } else if (animationPhase === 2) {
      const timeout = setTimeout(() => setAnimationPhase(3), 2000);
      return () => clearTimeout(timeout);
    } else if (animationPhase === 3) {
      const timeout = setTimeout(() => setAnimationPhase(4), 1500);
      return () => clearTimeout(timeout);
    } else if (animationPhase === 4) {
      const timeout = setTimeout(() => {
        // Reset cycle
        setTypedText("");
        setAnimationPhase(0);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [animationPhase]);

  return (
    <section className="relative container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
          Watch Your Ideas Come to Life
        </h2>
        <p className="text-white/60">From prompt to workflow to automation — all in seconds</p>
      </div>

      <div className="relative max-w-5xl mx-auto h-80 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-visible shadow-xl shadow-[#FFB700]/10">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,183,0,0.2) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        
        {/* Animation flow: Prompt -> Workflow -> Automation */}
        <div className="relative h-full flex items-center justify-between px-16">
          {/* Prompt Section */}
          <div className="flex flex-col items-center gap-3 relative">
            <motion.div
              className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#FFB700] to-[#FF8C00] flex items-center justify-center shadow-lg shadow-[#FFB700]/30"
              animate={{
                scale: typedText.length > 0 ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-12 h-12 text-black" />
            </motion.div>
            <span className="text-sm text-white/70">Prompt</span>
            
            {/* Typing text bubble */}
            <AnimatePresence>
              {typedText.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/90 border-2 border-[#FFB700] rounded-lg px-4 py-2 shadow-lg whitespace-nowrap backdrop-blur-sm"
                >
                  <div className="text-sm text-white">
                    {typedText}
                    {showCursor && <span className="text-[#FFB700]">|</span>}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-r-2 border-b-2 border-[#FFB700] rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Particle flow to workflow */}
            {animationPhase >= 1 && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-full top-1/2 w-2 h-2 bg-[#FFB700] rounded-full"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ 
                      x: 200,
                      y: Math.sin(i * 2) * 20,
                      opacity: 0 
                    }}
                    transition={{ 
                      duration: 1, 
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 4
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Connection line */}
          <motion.div
            className="h-0.5 flex-1 bg-gradient-to-r from-[#FFB700] to-[#FF8C00] mx-8 relative"
            animate={{
              opacity: animationPhase >= 1 ? [0.3, 1, 0.3] : 0.3
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Workflow Section */}
          <div className="flex flex-col items-center gap-3 relative">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#FFB700] to-[#FF8C00] flex items-center justify-center shadow-lg shadow-[#FFB700]/30 relative">
              <AnimatePresence mode="wait">
                {animationPhase < 2 && (
                  <motion.div
                    key="gitbranch"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GitBranch className="w-12 h-12 text-black" />
                  </motion.div>
                )}
                
                {animationPhase === 2 && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: 360 
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 0.3 },
                      scale: { duration: 0.3 }
                    }}
                  >
                    <Settings className="w-12 h-12 text-black" />
                  </motion.div>
                )}

                {animationPhase >= 3 && (
                  <motion.div
                    key="gitbranch-final"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GitBranch className="w-12 h-12 text-black" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3 Small nodes appearing */}
              <AnimatePresence>
                {animationPhase === 2 && (
                  <>
                    {[
                      { angle: 0, icon: Database },
                      { angle: 120, icon: Network },
                      { angle: 240, icon: Code2 }
                    ].map((node, i) => {
                      const radian = (node.angle * Math.PI) / 180;
                      const x = Math.cos(radian) * 50;
                      const y = Math.sin(radian) * 50;
                      
                      return (
                        <motion.div
                          key={i}
                          className="absolute w-8 h-8 rounded-lg bg-black/90 border-2 border-[#FFB700] flex items-center justify-center shadow-md backdrop-blur-sm"
                          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            x, 
                            y 
                          }}
                          exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: i * 0.15 
                          }}
                        >
                          <node.icon className="w-4 h-4 text-[#FFB700]" />
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </AnimatePresence>
            </div>
            <span className="text-sm text-white/70">Workflow</span>

            {/* Particle flow to automation */}
            {animationPhase >= 3 && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-full top-1/2 w-2 h-2 bg-[#FFB700] rounded-full"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ 
                      x: 200,
                      y: Math.sin(i * 2) * 20,
                      opacity: 0 
                    }}
                    transition={{ 
                      duration: 1, 
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Connection line */}
          <motion.div
            className="h-0.5 flex-1 bg-gradient-to-r from-[#FFB700] to-[#FF8C00] mx-8"
            animate={{
              opacity: animationPhase >= 3 ? [0.3, 1, 0.3] : 0.3
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Automation Section */}
          <div className="flex flex-col items-center gap-3 relative">
            <motion.div
              className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#FFB700] to-[#FF8C00] flex items-center justify-center shadow-lg shadow-[#FFB700]/30 relative overflow-visible"
              animate={{
                scale: animationPhase === 4 ? [1, 1.15, 1] : 1,
                boxShadow: animationPhase === 4 
                  ? [
                      "0 10px 30px rgba(255, 183, 0, 0.3)",
                      "0 10px 50px rgba(255, 183, 0, 0.6)",
                      "0 10px 30px rgba(255, 183, 0, 0.3)"
                    ]
                  : "0 10px 30px rgba(255, 183, 0, 0.3)"
              }}
              transition={{ 
                duration: 0.8, 
                repeat: animationPhase === 4 ? Infinity : 0 
              }}
            >
              <motion.div
                animate={{
                  rotate: animationPhase === 4 ? [0, 15, -15, 0] : 0
                }}
                transition={{
                  duration: 0.4,
                  repeat: animationPhase === 4 ? Infinity : 0,
                  repeatDelay: 0.4
                }}
              >
                <Zap className="w-12 h-12 text-black" />
              </motion.div>

              {/* Energy burst effect */}
              <AnimatePresence>
                {animationPhase === 4 && (
                  <>
                    {[...Array(8)].map((_, i) => {
                      const angle = (i * 45 * Math.PI) / 180;
                      const distance = 60;
                      const x = Math.cos(angle) * distance;
                      const y = Math.sin(angle) * distance;
                      
                      return (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-8 bg-gradient-to-t from-[#FFB700] to-transparent rounded-full"
                          style={{
                            left: '50%',
                            top: '50%',
                            originX: 0.5,
                            originY: 0,
                          }}
                          initial={{ 
                            x: 0, 
                            y: 0, 
                            opacity: 0,
                            rotate: i * 45,
                            scaleY: 0
                          }}
                          animate={{ 
                            x, 
                            y, 
                            opacity: [0, 1, 0],
                            scaleY: [0, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      );
                    })}
                  </>
                )}
              </AnimatePresence>
            </motion.div>
            <span className="text-sm text-white/70">Automation</span>
          </div>
        </div>
      </div>
    </section>
  );
}

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const features = [
    {
      icon: MousePointerClick,
      title: "Drag & Drop Builder",
      description: "Intuitively design workflows with a visual canvas and intelligent node connections."
    },
    {
      icon: Edit3,
      title: "Real-time Node Editing",
      description: "Edit node properties on the fly and see changes reflected instantly in your workflow."
    },
    {
      icon: Timer,
      title: "Auto Triggers",
      description: "Schedule workflows or trigger them based on events, webhooks, and custom conditions."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Work together with your team in real-time with shared workspaces and version control."
    },
    {
      icon: Activity,
      title: "AI Monitoring",
      description: "Track workflow performance with intelligent insights and automated optimization suggestions."
    },
    {
      icon: FileText,
      title: "Smart Templates",
      description: "Start fast with pre-built templates for common automation patterns and use cases."
    }
  ];

  const promptExamples = [
    "Send automated alerts",
    "Post on LinkedIn daily",
    "Summarize my emails",
    "Generate analytics report",
    "Sync CRM data",
    "Notify team on updates"
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="AgenXnodes" className="h-8" />
          </div>
          <nav className="flex items-center gap-6">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              Pricing
            </Button>
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              Docs
            </Button>
            <Button variant="ghost" onClick={() => onNavigate('login')} className="text-white/70 hover:text-white hover:bg-white/10">
              Login
            </Button>
            <Button onClick={() => onNavigate('signup')} className="bg-gradient-to-r from-[#FFB700] to-[#FF8C00] text-black hover:opacity-90 shadow-lg shadow-[#FFB700]/30">
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-20">
        {/* Curved Black Background with Nodes */}
        <div className="absolute inset-0 -mx-6 overflow-visible pointer-events-none">
          {/* Black half-circle background with rounded bottom */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[120%] h-[90%]">
            {/* Main black half-circle */}
            <div 
              className="absolute inset-0 bg-black"
              style={{
                borderRadius: '0 0 50% 50%',
              }}
            />
            
            {/* Neon orange curved line at bottom edge - follows the circle curve */}
            <div 
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: '100%',
                borderRadius: '0 0 50% 50%',
                border: '3px solid transparent',
                borderBottomColor: '#FFB700',
                borderLeftColor: '#FFB700',
                borderRightColor: '#FFB700',
                boxShadow: `
                  0 0 15px rgba(255, 183, 0, 0.9),
                  0 0 30px rgba(255, 183, 0, 0.7),
                  0 0 45px rgba(255, 183, 0, 0.5),
                  inset 0 -20px 40px rgba(255, 183, 0, 0.2)
                `,
                filter: 'drop-shadow(0 5px 20px rgba(255, 183, 0, 0.6))',
                pointerEvents: 'none'
              }}
            />
            
            {/* Additional soft glow effect beneath */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-24"
              style={{
                borderRadius: '0 0 50% 50%',
                background: 'radial-gradient(ellipse at bottom, rgba(255, 183, 0, 0.4) 0%, transparent 70%)',
                filter: 'blur(25px)'
              }}
            />
            
            {/* Decorative Nodes - Smaller with mini workflows inside some */}
            
            {/* Orange Nodes with workflow visualizations */}
            <motion.div
              className="absolute top-[15%] left-[10%] w-10 h-10 rounded-full bg-[#FFB700] opacity-40 flex items-center justify-center"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                y: [0, 30, 0],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Mini workflow inside */}
              <div className="flex items-center gap-0.5 scale-50">
                <div className="w-1 h-1 rounded-full bg-black/40" />
                <div className="w-2 h-px bg-black/30" />
                <div className="w-1 h-1 rounded-full bg-black/40" />
              </div>
            </motion.div>
            
            <motion.div
              className="absolute top-[25%] right-[15%] w-8 h-8 rounded-lg bg-[#FFB700] opacity-50 rotate-45"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                y: [0, -20, 0],
                rotate: [45, 90, 45],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[40%] left-[20%] w-6 h-6 rounded bg-[#FFB700] opacity-35"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                x: [0, 15, 0],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[50%] right-[25%] w-12 h-12 rounded-full bg-gradient-to-br from-[#FFB700] to-[#FF8C00] opacity-45 flex items-center justify-center"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.45, 0.65, 0.45],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Mini workflow chain */}
              <div className="flex items-center gap-0.5 scale-[0.4]">
                <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                <div className="w-3 h-px bg-black/30" />
                <div className="w-1.5 h-1.5 rounded bg-black/40" />
                <div className="w-3 h-px bg-black/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
              </div>
            </motion.div>

            <motion.div
              className="absolute top-[35%] left-[8%] w-7 h-7 rounded-xl bg-[#FFB700] opacity-38 rotate-12"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                y: [0, 25, 0],
                rotate: [12, 45, 12],
                opacity: [0.38, 0.58, 0.38],
              }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* White Nodes with workflow visualizations */}
            <motion.div
              className="absolute top-[20%] right-[8%] w-9 h-9 rounded-full bg-white opacity-35 flex items-center justify-center"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                y: [0, -25, 0],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Mini branching workflow */}
              <div className="relative scale-[0.35]">
                <div className="w-1.5 h-1.5 rounded-full bg-black/40 absolute left-0 top-0" />
                <div className="w-4 h-px bg-black/30 absolute left-1.5 top-0.5 rotate-12" />
                <div className="w-4 h-px bg-black/30 absolute left-1.5 top-0.5 -rotate-12" />
              </div>
            </motion.div>

            <motion.div
              className="absolute top-[30%] left-[15%] w-7 h-7 rounded-lg bg-white opacity-45 rotate-30"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                x: [0, -20, 0],
                rotate: [30, 60, 30],
                opacity: [0.45, 0.65, 0.45],
              }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[45%] right-[12%] w-8 h-8 rounded bg-white opacity-40"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                y: [0, 20, 0],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[18%] left-[25%] w-10 h-10 rounded-2xl bg-white opacity-32 rotate-45 flex items-center justify-center"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                scale: [1, 1.15, 1],
                rotate: [45, 90, 45],
                opacity: [0.32, 0.52, 0.32],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Mini connected workflow */}
              <div className="flex items-center gap-0.5 scale-[0.4] -rotate-45">
                <div className="w-1 h-1 rounded-full bg-black/30" />
                <div className="w-2 h-px bg-black/25" />
                <div className="w-1 h-1 rounded bg-black/30" />
                <div className="w-2 h-px bg-black/25" />
                <div className="w-1 h-1 rounded-full bg-black/30" />
              </div>
            </motion.div>

            <motion.div
              className="absolute top-[55%] left-[30%] w-6 h-6 rounded-full bg-white opacity-48"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                x: [0, 12, 0],
                y: [0, -15, 0],
                opacity: [0.48, 0.68, 0.48],
              }}
              transition={{
                duration: 4.3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[38%] right-[20%] w-9 h-9 rounded-xl bg-gradient-to-br from-white to-white/80 opacity-36 rotate-20 flex items-center justify-center"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                y: [0, -18, 0],
                rotate: [20, 50, 20],
                opacity: [0.36, 0.56, 0.36],
              }}
              transition={{
                duration: 4.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Vertical workflow */}
              <div className="flex flex-col items-center gap-0.5 scale-[0.4] -rotate-20">
                <div className="w-1 h-1 rounded-full bg-black/30" />
                <div className="w-px h-2 bg-black/25" />
                <div className="w-1 h-1 rounded bg-black/30" />
              </div>
            </motion.div>

            {/* Additional scattered small nodes */}
            <motion.div
              className="absolute top-[28%] left-[35%] w-5 h-5 rounded-full bg-[#FFB700] opacity-52"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                opacity: [0.52, 0.7, 0.52],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[48%] right-[35%] w-5 h-5 rounded-full bg-white opacity-46"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                opacity: [0.46, 0.65, 0.46],
              }}
              transition={{
                duration: 3.3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[60%] left-[18%] w-7 h-7 rounded-lg bg-[#FFB700] opacity-38 rotate-15"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                rotate: [15, 40, 15],
                opacity: [0.38, 0.58, 0.38],
              }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[62%] right-[28%] w-6 h-6 rounded bg-white opacity-42"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                x: [0, 10, 0],
                opacity: [0.42, 0.62, 0.42],
              }}
              transition={{
                duration: 3.7,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Extra small nodes for density */}
            <motion.div
              className="absolute top-[22%] left-[30%] w-4 h-4 rounded-full bg-white opacity-40"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[52%] left-[12%] w-5 h-5 rounded bg-[#FFB700] opacity-45"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                opacity: [0.45, 0.65, 0.45],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute top-[42%] right-[8%] w-4 h-4 rounded-full bg-white opacity-38"
              style={{ filter: 'blur(1.5px)' }}
              animate={{
                opacity: [0.38, 0.58, 0.38],
              }}
              transition={{
                duration: 2.9,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-8">
              <img src={logoImage} alt="AgenXnodes" className="h-20 relative z-20" />
            </div>
            <h1 className="text-6xl mb-6 bg-gradient-to-r from-white via-[#FFB700] to-[#FF8C00] bg-clip-text text-transparent relative z-20">
              Build Agentic AI Workflows with Your Prompts
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto relative z-20">
              Design, automate, and control intelligent workflows effortlessly.
            </p>
            <div className="flex items-center justify-center gap-4 relative z-20">
              <Button 
                onClick={() => onNavigate('signup')} 
                size="lg"
                className="bg-gradient-to-r from-[#FFB700] to-[#FF8C00] text-black hover:opacity-90 shadow-lg shadow-[#FFB700]/30 group"
              >
                Get Started
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>


        </div>
      </section>

      {/* Workflow Animation Section */}
      <WorkflowAnimationSection />

      {/* How It Works Section */}
      <section className="relative container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-white/60">Three simple steps to powerful automation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Write a Prompt",
              description: "Simply describe what you want to automate in natural language. No coding required.",
              icon: Sparkles,
            },
            {
              step: "02",
              title: "AI Builds Your Workflow",
              description: "Our intelligent system generates the perfect workflow with connected nodes and logic.",
              icon: GitBranch,
            },
            {
              step: "03",
              title: "Automation Runs in Background",
              description: "Deploy and let it run. Your workflow executes automatically based on your triggers.",
              icon: Zap,
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection line */}
              {index < 2 && (
                <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-[#FFB700]/40 to-transparent -z-10" />
              )}
              
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FFB700] hover:shadow-lg hover:shadow-[#FFB700]/20 transition-all duration-300 h-full">
                <div className="absolute -top-4 left-6 bg-gradient-to-r from-[#FFB700] to-[#FF8C00] text-black px-4 py-1 rounded-full shadow-lg">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FFB700]/20 to-[#FF8C00]/20 flex items-center justify-center mb-6 mt-4">
                  <item.icon className="w-8 h-8 text-[#FFB700]" />
                </div>
                <h3 className="text-xl text-white mb-3">{item.title}</h3>
                <p className="text-white/60">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Powerful Features Section */}
      <section className="relative container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-white/60">Everything you need to build intelligent automation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-[#FFB700] hover:shadow-xl hover:shadow-[#FFB700]/20 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FFB700] to-[#FF8C00] flex items-center justify-center mb-4 shadow-lg shadow-[#FFB700]/30">
                    <feature.icon className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/60">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Describe with Prompts Section */}
      <section className="relative container mx-auto px-6 py-20 overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
            Describe with Prompts
          </h2>
          <p className="text-white/60">Natural language commands that become powerful workflows</p>
        </div>

        <div className="relative min-h-[400px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden shadow-xl shadow-[#FFB700]/10">
          {/* Dotted background */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,183,0,0.2) 1.5px, transparent 1.5px)',
            backgroundSize: '30px 30px'
          }} />

          {/* Floating prompt bubbles connected to mini workflows */}
          <div className="relative h-full p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promptExamples.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1
                  }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  {/* Prompt bubble */}
                  <div className="px-5 py-4 bg-black/90 backdrop-blur-md border border-[#FFB700]/40 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#FFB700]/20 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFB700] to-[#FF8C00] flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-black" />
                      </div>
                      <p className="text-sm text-white">{prompt}</p>
                    </div>
                    
                    {/* Mini workflow visualization */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#FFB700]/20 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-[#FFB700]" />
                      </div>
                      <div className="h-px flex-1 bg-[#FFB700]/40" />
                      <div className="w-6 h-6 rounded bg-[#FFB700]/20 flex items-center justify-center">
                        <GitBranch className="w-3 h-3 text-[#FFB700]" />
                      </div>
                      <div className="h-px flex-1 bg-[#FFB700]/40" />
                      <div className="w-6 h-6 rounded bg-[#FFB700]/20 flex items-center justify-center">
                        <Network className="w-3 h-3 text-[#FFB700]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Central glow effect */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFB700]/10 rounded-full blur-[120px] pointer-events-none"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </section>

      {/* Why AgenXnodes Section */}
      <section className="relative container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
            Why AgenXnodes?
          </h2>
          <p className="text-white/60">Built for the future of intelligent automation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: Zap,
              title: "Fast Setup",
              description: "Get started in minutes with intuitive design and smart defaults.",
            },
            {
              icon: Layers,
              title: "Agentic Automation",
              description: "AI-powered agents that learn and adapt to your workflows.",
            },
            {
              icon: TrendingUp,
              title: "Smart Scaling",
              description: "Automatically scales with your needs from startup to enterprise.",
            },
            {
              icon: Shield,
              title: "Reliable Infrastructure",
              description: "Built on robust, secure infrastructure with 99.9% uptime.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FFB700] hover:shadow-xl hover:shadow-[#FFB700]/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFB700] to-[#FF8C00] flex items-center justify-center mb-4 shadow-lg shadow-[#FFB700]/30">
                <item.icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button 
            onClick={() => onNavigate('signup')} 
            size="lg"
            className="bg-gradient-to-r from-[#FFB700] to-[#FF8C00] text-black hover:opacity-90 shadow-lg shadow-[#FFB700]/30 group px-8"
          >
            Start Building Now
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      {/* Integrations Section - Horizontal Scrolling Animation */}
      <section className="relative py-20 overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
            Connect Everything
          </h2>
          <p className="text-white/60">50+ integrations support</p>
        </div>

        {/* Horizontal scrolling logos */}
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="flex gap-8 animate-scroll">
            {/* First set of logos */}
            {[
              { name: "Telegram", url: "https://images.unsplash.com/photo-1637592156979-95f44c286423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWxlZ3JhbSUyMGxvZ28lMjBpY29ufGVufDF8fHx8MTc2MTQ3MzYxOXww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "OpenAI", url: "https://images.unsplash.com/photo-1637489981573-e45e9297cb21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVuYWklMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjE0NzM2MjB8MA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Gemini", url: "https://images.unsplash.com/photo-1706426629246-2a3c3e3e3ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBnZW1pbmklMjBsb2dvfGVufDF8fHx8MTc2MTQ3MzYyMHww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Slack", url: "https://images.unsplash.com/photo-1660137340590-d48549625980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbGFjayUyMGxvZ28lMjBpY29ufGVufDF8fHx8MTc2MTQ3MzYyMXww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Gmail", url: "https://images.unsplash.com/photo-1706879349268-8cb3a9ae739a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbWFpbCUyMGxvZ28lMjBpY29ufGVufDF8fHx8MTc2MTQ3MzYyMXww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Google Sheets", url: "https://images.unsplash.com/photo-1663124178632-488f399d5763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBzaGVldHMlMjBsb2dvfGVufDF8fHx8MTc2MTQwMTk3Mnww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Google Drive", url: "https://images.unsplash.com/photo-1646627928999-48734570fff3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBkcml2ZSUyMGxvZ298ZW58MXx8fHwxNzYxNDczNjIyfDA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Excel", url: "https://images.unsplash.com/photo-1658203897339-0b8c64a42fba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3NvZnQlMjBleGNlbCUyMGxvZ298ZW58MXx8fHwxNzYxNDczNjIzfDA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Notion", url: "https://images.unsplash.com/photo-1648805777291-a1c45cc26f26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3Rpb24lMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjE0NzM2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "GitHub", url: "https://images.unsplash.com/photo-1654277041218-84424c78f0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaXRodWIlMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjE0NzM2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Discord", url: "https://images.unsplash.com/photo-1683029096295-7680306aa37d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNjb3JkJTIwbG9nbyUyMGljb258ZW58MXx8fHwxNzYxNDczNjIzfDA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "HTTP Request", url: "https://images.unsplash.com/photo-1649451844931-57e22fc82de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGklMjB3ZWJob29rJTIwY29kZXxlbnwxfHx8fDE3NjE0NzM2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080" },
            ].map((integration, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 w-32 h-32 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#FFB700]/50 transition-all duration-300"
              >
                <img 
                  src={integration.url} 
                  alt={integration.name}
                  className="w-16 h-16 object-contain rounded-lg"
                />
                <span className="text-xs text-white/70 text-center">{integration.name}</span>
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {[
              { name: "Telegram", url: "https://images.unsplash.com/photo-1637592156979-95f44c286423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWxlZ3JhbSUyMGxvZ28lMjBpY29ufGVufDF8fHx8MTc2MTQ3MzYxOXww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "OpenAI", url: "https://images.unsplash.com/photo-1637489981573-e45e9297cb21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVuYWklMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjE0NzM2MjB8MA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Gemini", url: "https://images.unsplash.com/photo-1706426629246-2a3c3e3e3ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBnZW1pbmklMjBsb2dvfGVufDF8fHx8MTc2MTQ3MzYyMHww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Slack", url: "https://images.unsplash.com/photo-1660137340590-d48549625980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbGFjayUyMGxvZ28lMjBpY29ufGVufDF8fHx8MTc2MTQ3MzYyMXww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Gmail", url: "https://images.unsplash.com/photo-1706879349268-8cb3a9ae739a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbWFpbCUyMGxvZ28lMjBpY29ufGVufDF8fHx8MTc2MTQ3MzYyMXww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Google Sheets", url: "https://images.unsplash.com/photo-1663124178632-488f399d5763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBzaGVldHMlMjBsb2dvfGVufDF8fHx8MTc2MTQwMTk3Mnww&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Google Drive", url: "https://images.unsplash.com/photo-1646627928999-48734570fff3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBkcml2ZSUyMGxvZ298ZW58MXx8fHwxNzYxNDczNjIyfDA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Excel", url: "https://images.unsplash.com/photo-1658203897339-0b8c64a42fba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3NvZnQlMjBleGNlbCUyMGxvZ298ZW58MXx8fHwxNzYxNDczNjIzfDA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Notion", url: "https://images.unsplash.com/photo-1648805777291-a1c45cc26f26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3Rpb24lMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjE0NzM2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "GitHub", url: "https://images.unsplash.com/photo-1654277041218-84424c78f0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaXRodWIlMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjE0NzM2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Discord", url: "https://images.unsplash.com/photo-1683029096295-7680306aa37d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNjb3JkJTIwbG9nbyUyMGljb258ZW58MXx8fHwxNzYxNDczNjIzfDA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "HTTP Request", url: "https://images.unsplash.com/photo-1649451844931-57e22fc82de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGklMjB3ZWJob29rJTIwY29kZXxlbnwxfHx8fDE3NjE0NzM2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080" },
            ].map((integration, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 w-32 h-32 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#FFB700]/50 transition-all duration-300"
              >
                <img 
                  src={integration.url} 
                  alt={integration.name}
                  className="w-16 h-16 object-contain rounded-lg"
                />
                <span className="text-xs text-white/70 text-center">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="AgenXnodes" className="h-6" />
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm text-white/40">
              © 2025 AgenXnodes. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}