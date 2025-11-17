/**
 * Micro-interactions and Achievement System
 * Adds delightful animations, feedback, and gamification
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trophy, Zap, Target, TrendingUp, Award, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

// Achievement definitions
export const achievements = [
  {
    id: 'first_task',
    title: 'Getting Started',
    description: 'Create your first task',
    icon: CheckCircle2,
    points: 10,
  },
  {
    id: 'task_streak_7',
    title: 'Week Warrior',
    description: 'Complete tasks 7 days in a row',
    icon: Zap,
    points: 50,
  },
  {
    id: 'first_project',
    title: 'Project Pioneer',
    description: 'Create your first project',
    icon: Target,
    points: 25,
  },
  {
    id: 'tasks_10',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    icon: TrendingUp,
    points: 30,
  },
  {
    id: 'leads_25',
    title: 'Lead Generator',
    description: 'Add 25 leads to your pipeline',
    icon: Award,
    points: 50,
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all weekly tasks',
    icon: Star,
    points: 100,
  },
];

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  unlockedAt?: string;
}

/**
 * Achievement Toast
 */
export const AchievementToast: React.FC<{ achievement: Achievement; onClose: () => void }> = ({
  achievement,
  onClose,
}) => {
  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
    });

    // Auto-close after 5 seconds
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = achievement.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.5 }}
      className="fixed bottom-8 right-8 z-[9999] pointer-events-auto"
    >
      <div className="bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-1 rounded-2xl shadow-2xl">
        <div className="bg-card rounded-xl p-6 max-w-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Achievement Unlocked!
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">+{achievement.points}</span>
                <span className="text-sm text-muted-foreground">points</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Button Click Ripple Effect
 */
export const RippleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
};

/**
 * Success Checkmark Animation
 */
export const SuccessCheckmark: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="inline-block"
    >
      <motion.div
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      </motion.div>
    </motion.div>
  );
};

/**
 * Loading Pulse Animation
 */
export const PulseLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-3 w-3 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

/**
 * Slide-in Notification
 */
export const SlideNotification: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'from-emerald-500 to-teal-500',
    error: 'from-red-500 to-rose-500',
    info: 'from-blue-500 to-cyan-500',
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className={`fixed top-20 right-8 z-50 bg-gradient-to-r ${colors[type]} p-4 rounded-lg shadow-lg text-white max-w-sm`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="hover:opacity-75">
          ✕
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Shake Animation (for errors)
 */
export const shakeAnimation = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.4 },
};

/**
 * Scale Animation (for hover effects)
 */
export const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

/**
 * Glow Effect on Focus
 */
export const glowEffect = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0)',
      '0 0 0 10px rgba(59, 130, 246, 0.1)',
      '0 0 0 0 rgba(59, 130, 246, 0)',
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
  },
};

/**
 * Fireworks Celebration
 */
export const triggerFireworks = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

/**
 * Progress Bar with Animation
 */
export const AnimatedProgressBar: React.FC<{ progress: number; color?: string }> = ({
  progress,
  color = 'bg-primary',
}) => {
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};

/**
 * Counter Animation
 */
export const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({
  value,
  duration = 1,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    const increment = (end - start) / (duration * 60);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

/**
 * Skeleton Loading with Shimmer
 */
export const ShimmerSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`}>
      <div className="shimmer" />
    </div>
  );
};

