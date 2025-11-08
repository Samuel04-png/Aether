import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../shared/Card';
import { SparklesIcon } from '../shared/Icons';
import { UserProfile } from '../../types';
import { useTheme } from '@/contexts/ThemeContext';

interface OnboardingProps {
    onComplete: (profile: { businessName: string; industry: string; goals: string[] }) => Promise<void> | void;
    initialProfile?: Partial<UserProfile>;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialProfile }) => {
    const [step, setStep] = useState(1);
    const [businessName, setBusinessName] = useState(initialProfile?.businessName ?? '');
    const [industry, setIndustry] = useState(initialProfile?.industry ?? '');
    const [goals, setGoals] = useState<string[]>(initialProfile?.goals ?? []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { theme } = useTheme();
    const logoSrc = theme === 'dark' ? '/aether-logo/Logo.png' : '/aether-logo/Logo_lightmode.png';
    
    const totalSteps = 3;

    useEffect(() => {
        if (initialProfile) {
            setBusinessName(initialProfile.businessName ?? '');
            setIndustry(initialProfile.industry ?? '');
            setGoals(initialProfile.goals ?? []);
        }
    }, [initialProfile]);

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
    
    const toggleGoal = (goal: string) => {
        setGoals(prev => {
            if (prev.includes(goal)) {
                // Remove if already selected
                return prev.filter(g => g !== goal);
            } else {
                // Add if not at max (3)
                if (prev.length >= 3) {
                    return prev; // Don't add if already at max
                }
                return [...prev, goal];
            }
        });
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            await onComplete({ businessName, industry, goals });
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const goalOptions = [
        "Increase Sales", "Improve Marketing", "Streamline Operations", 
        "Manage Team", "Understand Finances", "Grow Online Presence"
    ];

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background font-sans animate-fade-in relative overflow-hidden">
            {/* Animated gradient background - Premium */}
            <div className="absolute inset-0 bg-gradient-hero opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent-start/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(var(--primary)/0.2),transparent)]" />
            
            <div className="w-full max-w-2xl px-6 relative z-10">
                 <Card className="animate-slide-in-up shadow-2xl bg-card/98 backdrop-blur-xl border-2" style={{ borderColor: 'oklch(var(--primary) / 0.2)' }}>
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-2xl rounded-full"></div>
                                <img 
                                    src={logoSrc}
                                    alt="Aether Logo" 
                                    className="h-20 w-auto drop-shadow-2xl relative z-10"
                                />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-3">
                            Welcome to Aether
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">Let's personalize your workspace to fit your business needs.</p>
                    </div>

                    {/* Progress Bar - Premium */}
                    <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden shadow-inner" style={{ border: '1px solid', borderColor: 'oklch(var(--border) / 0.5)' }}>
                      <motion.div 
                        className="bg-gradient-hero h-3 rounded-full transition-all duration-500 shadow-lg shadow-primary/50"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex justify-center mb-6">
                        <span className="text-sm font-medium text-primary">
                            Step {step} of {totalSteps}
                        </span>
                    </div>
                    
                    <div className="min-h-[300px] py-4">
                        {step === 1 && (
                             <div className="animate-fade-in text-center space-y-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero mb-4 shadow-lg shadow-primary/30">
                                    <SparklesIcon className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-foreground">Let's get started!</h2>
                                <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-base leading-relaxed">
                                    This quick setup will help Aether's AI understand your business, providing you with tailored insights, recommendations, and news.
                                </p>
                            </div>
                        )}
                        {step === 2 && (
                             <div className="animate-fade-in space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-foreground mb-2">Tell us about your business</h2>
                                    <p className="text-muted-foreground">Help us understand your company better</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-2">Business Name</label>
                                        <input 
                                            type="text" 
                                            value={businessName} 
                                            onChange={e => setBusinessName(e.target.value)} 
                                            placeholder="e.g., Stellar Innovations Inc." 
                                            required 
                                            className="w-full bg-input text-foreground rounded-lg py-3 px-4 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm text-base"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-2">Industry</label>
                                        <input 
                                            type="text" 
                                            value={industry} 
                                            onChange={e => setIndustry(e.target.value)} 
                                            placeholder="e.g., E-commerce, SaaS, Marketing Agency" 
                                            required 
                                            className="w-full bg-input text-foreground rounded-lg py-3 px-4 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm text-base"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                             <div className="animate-fade-in">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-foreground mb-2">What are your primary goals?</h2>
                                    <p className="text-muted-foreground text-base">Select up to 3 goals that matter most to you</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {goalOptions.map(goal => (
                                        <motion.button 
                                            key={goal}
                                            onClick={() => toggleGoal(goal)}
                                            whileHover={{ scale: 1.05, y: -4 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-5 rounded-xl text-center font-semibold transition-all duration-300 border-2 text-sm ${
                                                goals.includes(goal) 
                                                ? 'bg-gradient-hero border-primary text-white shadow-xl shadow-primary/40 scale-105' 
                                                : 'bg-card border-border hover:border-primary/60 text-foreground hover:shadow-lg hover:bg-accent/30'
                                            }`}
                                        >
                                            {goal}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-10 flex justify-between items-center gap-4">
                        {step > 1 ? (
                            <motion.button 
                                onClick={handleBack}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-muted text-muted-foreground font-semibold py-3 px-8 rounded-lg hover:bg-muted/80 transition-all shadow-sm border border-border"
                            >
                                ← Back
                            </motion.button>
                        ) : <div></div>}
                        
                        {step < totalSteps ? (
                            <motion.button 
                                onClick={handleNext}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-hero text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-xl shadow-primary/40 hover:shadow-2xl"
                            >
                                Next →
                            </motion.button>
                        ) : (
                            <motion.button 
                                onClick={handleFinish} 
                                disabled={isSubmitting || !businessName || !industry}
                                whileHover={!isSubmitting && (businessName && industry) ? { scale: 1.05 } : {}}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-hero text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-xl shadow-primary/40 hover:shadow-2xl disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : '✨ Finish Setup'}
                            </motion.button>
                        )}
                    </div>
                    {errorMessage && (
                        <p className="text-center text-sm mt-4" style={{ color: 'var(--destructive)' }}>{errorMessage}</p>
                    )}
                 </Card>
            </div>
        </div>
    );
};

export default Onboarding;
