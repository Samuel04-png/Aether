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

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30 font-sans relative overflow-hidden">
            {/* Animated background gradients */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99, 102, 241, 0.4), transparent)' }} />
                <div className="absolute inset-0 opacity-25" style={{ background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3), transparent)' }} />
                <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.3), transparent)' }} />
            </div>
            <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={transitions.quick}
                className="w-full max-w-md px-4"
            >
                {onBackToLanding && (
                        <Button
                            variant="ghost"
                            onClick={onBackToLanding}
                            className="mb-4 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 flex items-center gap-2"
                        >
                            ← Back to Home
                        </Button>
                )}
                <div className="flex items-center justify-center p-2 mb-8">
                    <img 
                        src="/aether-logo/Logo_with_text.png" 
                        alt="Aether Logo" 
                        className="h-12 w-auto drop-shadow-lg"
                    />
                </div>
                <Card className="border-indigo-200/60 bg-white/95 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-3">
                        <CardTitle className="text-3xl font-bold text-center tracking-tight">
                            {isLoginView ? 'Welcome Back' : 'Create an Account'}
                        </CardTitle>
                        <p className="text-center text-muted-foreground mt-2 text-base">
                            {isLoginView ? 'Sign in to your Aether workspace.' : 'Start your journey with Aether.'}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLoginView && (
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="h-11"
                                        required
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11"
                                    required
                                />
                                {isLoginView && (
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                                        onClick={() => setShowForgotPassword(true)}
                                    >
                                        Forgot password?
                                    </Button>
                                )}
                            </div>
                            
                            <Button type="submit" disabled={isSubmitting} className="w-full gap-2 h-11 text-base font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-indigo-500/50">
                                <SparklesIcon className="w-5 h-5" />
                                {isSubmitting ? 'Please wait...' : (isLoginView ? 'Sign In' : 'Sign Up')}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border/60"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-card px-3 text-muted-foreground font-medium">OR</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleGoogleLogin}
                            disabled={isSubmitting}
                            variant="outline"
                            className="w-full gap-3 h-11 text-base font-semibold border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                        >
                            <GoogleIcon />
                            {isSubmitting ? 'Loading...' : 'Continue with Google'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            {isLoginView ? "Don't have an account?" : "Already have an account?"}
                            <Button
                                type="button"
                                variant="link"
                                className="p-0 h-auto ml-1"
                                onClick={() => setIsLoginView(!isLoginView)}
                            >
                                {isLoginView ? 'Sign Up' : 'Sign In'}
                            </Button>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Auth;
