import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { fadeInUp, transitions } from '@/lib/motion';
import { SparklesIcon } from '../shared/Icons';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      toast({
        title: 'Check Your Email',
        description: 'Password reset instructions have been sent to your email address.',
      });
      // Redirect to login after a short delay
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message ?? 'Failed to send password reset email. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Floating orbs for background
  const FloatingOrb = ({ delay = 0, duration = 20, size = 400, color, startX = 0, startY = 0 }: { delay?: number; duration?: number; size?: number; color: string; startX?: number | string; startY?: number | string }) => (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-20"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent)`,
        left: typeof startX === 'string' ? startX : `${startX}%`,
        top: typeof startY === 'string' ? startY : `${startY}%`,
      }}
      animate={{
        x: [0, 80, -40, 0],
        y: [0, -60, 40, 0],
        scale: [1, 1.3, 0.9, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 via-purple-950 to-pink-950 font-sans relative overflow-hidden py-8">
      {/* Ultra-enhanced animated background with floating orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Animated gradient base */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.3), transparent 60%)',
              'radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.3), transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 60%)',
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.3), transparent 60%)',
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating animated orbs */}
        <FloatingOrb delay={0} duration={20} size={500} color="rgba(99, 102, 241, 0.5)" startX="15%" startY="25%" />
        <FloatingOrb delay={4} duration={25} size={450} color="rgba(139, 92, 246, 0.4)" startX="85%" startY="65%" />
        <FloatingOrb delay={8} duration={18} size={400} color="rgba(236, 72, 153, 0.4)" startX="55%" startY="75%" />
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent animate-shimmer bg-[length:200%_100%]" />
      </div>
      
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={transitions.quick}
        className="w-full max-w-md px-4 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...transitions.quick, delay: 0.1 }}
        >
          <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              onClick={onBackToLogin}
              className="mb-8 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm flex items-center gap-2 font-semibold transition-all rounded-xl px-4 py-2"
            >
              ← Back to Sign In
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...transitions.gentle, delay: 0.2 }}
          className="flex items-center justify-center p-2 mb-10"
          whileHover={{ scale: 1.05 }}
        >
          <img 
            src="/aether-logo/Logo_with_text.png" 
            alt="Aether Logo" 
            className="h-16 w-auto drop-shadow-2xl brightness-110"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.quick, delay: 0.3 }}
        >
          <Card className="border-white/20 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden relative">
            <div className="relative z-10">
              <CardHeader className="space-y-4 pb-6 pt-8 px-8">
                <CardTitle className="text-4xl font-black text-center tracking-tight text-white mb-2">
                  Forgot Password?
                </CardTitle>
                <CardDescription className="text-center text-white/70 text-lg font-medium">
                  Enter your email address and we'll send you instructions to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...transitions.quick, delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="text-sm font-bold text-white/90">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-14 border-2 border-white/20 bg-white/10 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all rounded-xl text-white placeholder:text-white/40 hover:border-white/30"
                      required
                      autoFocus
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...transitions.quick, delay: 0.5 }}
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full gap-3 h-14 text-base font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/60 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      >
                        <SparklesIcon className="w-5 h-5" />
                        <span className="relative z-10">{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

