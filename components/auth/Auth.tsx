import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GoogleIcon, SparklesIcon } from '../shared/Icons';
import { useAuth } from '../../contexts/AuthContext';
import ForgotPassword from './ForgotPassword';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, transitions } from '@/lib/motion';
import Logo from '@/components/shared/Logo';

interface AuthProps {
    initialMode?: 'signin' | 'signup';
    onBackToLanding?: () => void;
}

const Auth: React.FC<AuthProps> = ({ initialMode = 'signup', onBackToLanding }) => {
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const { toast } = useToast();
    const [isLoginView, setIsLoginView] = useState(initialMode === 'signin');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsLoginView(initialMode === 'signin');
    }, [initialMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isLoginView) {
                await signIn(email, password);
            } else {
                await signUp(email, password, fullName || undefined);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: error?.message ?? 'Authentication failed. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        try {
            await signInWithGoogle();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Google Sign-In Failed',
                description: error?.message ?? 'Google sign-in failed. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showForgotPassword) {
        return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
    }

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
                <FloatingOrb delay={6} duration={28} size={350} color="rgba(6, 182, 212, 0.3)" startX="75%" startY="15%" />
                
                {/* Animated mesh gradient overlay */}
                <motion.div
                    className="absolute inset-0 opacity-15"
                    animate={{
                        background: [
                            'radial-gradient(ellipse 80% 50% at 50% -20%, #6366f1, transparent 70%)',
                            'radial-gradient(ellipse 80% 50% at 50% -20%, #8b5cf6, transparent 70%)',
                            'radial-gradient(ellipse 80% 50% at 50% -20%, #ec4899, transparent 70%)',
                            'radial-gradient(ellipse 80% 50% at 50% -20%, #6366f1, transparent 70%)',
                        ],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent animate-shimmer bg-[length:200%_100%]" />
            </div>
            
            <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={transitions.quick}
                className="w-full max-w-md px-4 relative z-10"
            >
                {onBackToLanding && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...transitions.quick, delay: 0.1 }}
                    >
                        <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="ghost"
                                onClick={onBackToLanding}
                                className="mb-8 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm flex items-center gap-2 font-semibold transition-all rounded-xl px-4 py-2"
                            >
                                ← Back to Home
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ ...transitions.gentle, delay: 0.2 }}
                    className="flex items-center justify-center p-2 mb-10"
                    whileHover={{ scale: 1.05 }}
                >
                    <Logo animated />
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...transitions.quick, delay: 0.3 }}
                >
                    <Card className="border-white/20 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden relative">
                        {/* Animated gradient border on hover */}
                        <motion.div
                            className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"
                            style={{
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(139, 92, 246, 0.5), rgba(236, 72, 153, 0.5))',
                                padding: '2px',
                            }}
                        >
                            <div className="w-full h-full bg-gradient-to-br bg-white/5 backdrop-blur-2xl rounded-3xl" />
                        </motion.div>
                        
                        <div className="relative z-10">
                            <CardHeader className="space-y-4 pb-6 pt-8 px-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <CardTitle className="text-4xl font-black text-center tracking-tight text-white mb-2">
                                        {isLoginView ? 'Welcome Back' : 'Create an Account'}
                                    </CardTitle>
                                    <p className="text-center text-white/70 text-lg font-medium">
                                        {isLoginView ? 'Sign in to your Aether workspace.' : 'Start your journey with Aether.'}
                                    </p>
                                </motion.div>
                            </CardHeader>
                            <CardContent className="space-y-6 px-8 pb-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {!isLoginView && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ ...transitions.quick, delay: 0.4 }}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor="fullName" className="text-sm font-bold text-white/90">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Jane Doe"
                                                className="h-14 border-2 border-white/20 bg-white/10 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all rounded-xl text-white placeholder:text-white/40 hover:border-white/30"
                                                required
                                            />
                                        </motion.div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ ...transitions.quick, delay: !isLoginView ? 0.5 : 0.4 }}
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
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ ...transitions.quick, delay: !isLoginView ? 0.6 : 0.5 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="password" className="text-sm font-bold text-white/90">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-14 border-2 border-white/20 bg-white/10 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all rounded-xl text-white placeholder:text-white/40 hover:border-white/30"
                                            required
                                        />
                                        {isLoginView && (
                                            <div className="flex justify-end pt-1">
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className="p-0 h-auto text-sm text-purple-300 hover:text-purple-200 font-semibold"
                                                    onClick={() => setShowForgotPassword(true)}
                                                >
                                                    Forgot password?
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ ...transitions.quick, delay: !isLoginView ? 0.7 : 0.6 }}
                                    >
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button 
                                                type="submit" 
                                                disabled={isSubmitting} 
                                                className="w-full gap-3 h-14 text-base font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/60 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                                            >
                                                <SparklesIcon className="w-5 h-5" />
                                                <span className="relative z-10">{isSubmitting ? 'Please wait...' : (isLoginView ? 'Sign In' : 'Sign Up')}</span>
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

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ ...transitions.quick, delay: 0.8 }}
                                    className="relative my-8"
                                >
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-white/5 backdrop-blur-xl px-4 text-white/60 font-bold">OR</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...transitions.quick, delay: 0.9 }}
                                >
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            onClick={handleGoogleLogin}
                                            disabled={isSubmitting}
                                            variant="outline"
                                            className="w-full gap-3 h-14 text-base font-bold border-2 border-white/20 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/30 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <GoogleIcon />
                                            {isSubmitting ? 'Loading...' : 'Continue with Google'}
                                        </Button>
                                    </motion.div>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ ...transitions.quick, delay: 1.0 }}
                                    className="text-center text-sm text-white/70 mt-6"
                                >
                                    {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto ml-1 text-purple-300 hover:text-purple-200 font-bold underline-offset-4 hover:underline"
                                        onClick={() => setIsLoginView(!isLoginView)}
                                    >
                                        {isLoginView ? 'Sign Up' : 'Sign In'}
                                    </Button>
                                </motion.p>
                            </CardContent>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Auth;
