import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { motion } from "motion/react";
import { Mail, Lock, User, GitBranch, ChevronLeft } from "lucide-react";
import { AnimatedWorkflowBackground } from "./workflow/AnimatedWorkflowBackground";

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('builder');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated workflow background */}
      <AnimatedWorkflowBackground />

      {/* Orange glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFB700]/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-[#FFB700]/15 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => onNavigate('landing')}
        className="absolute top-6 left-6 text-white/70 hover:text-white hover:bg-white/10 z-30"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Signup Card with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFB700] to-[#FF8C00] flex items-center justify-center shadow-lg shadow-[#FFB700]/50">
                <GitBranch className="w-8 h-8 text-black" />
              </div>
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-white/60">
              Start building intelligent workflows today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#FFB700] focus:ring-[#FFB700]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#FFB700] focus:ring-[#FFB700]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#FFB700] focus:ring-[#FFB700]/20"
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-white/50 bg-white/5 p-3 rounded-lg border border-white/10">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FFB700] to-[#FF8C00] text-black hover:opacity-90 shadow-lg shadow-[#FFB700]/30"
              >
                Create Account
              </Button>

              <div className="text-center text-sm text-white/60">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-[#FFB700] hover:text-[#FF8C00] transition-colors"
                >
                  Sign in
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}