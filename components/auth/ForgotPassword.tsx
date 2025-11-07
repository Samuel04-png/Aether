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

  return (
    <div className="flex h-screen w-full items-center justify-center bg-primary bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] font-sans">
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={transitions.quick}
        className="w-full max-w-md px-4"
      >
        <Button
          variant="ghost"
          onClick={onBackToLogin}
          className="mb-4 text-primary hover:text-primary-foreground flex items-center gap-2"
        >
          ← Back to Sign In
        </Button>

        <div className="flex items-center justify-center p-2 mb-8">
          <img 
            src="/aether-logo/Logo_with_text.png" 
            alt="Aether Logo" 
            className="h-12 w-auto drop-shadow-lg"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Forgot Password?</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                <SparklesIcon className="w-5 h-5" />
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

