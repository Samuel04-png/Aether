import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Zap, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

export const useKonamiCode = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Reset sequence if too much time passes
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setSequence([]), 2000);

      const newSequence = [...sequence, e.code];
      setSequence(newSequence);

      // Check if sequence matches Konami code
      if (newSequence.length === KONAMI_CODE.length) {
        const matches = newSequence.every((key, index) => key === KONAMI_CODE[index]);
        if (matches && !isActivated) {
          setIsActivated(true);
          triggerKonamiEffect();
          toast({
            title: '🎮 Konami Code Activated!',
            description: 'You found the secret! Enjoy the special effects.',
            duration: 5000,
          });
        } else if (matches && isActivated) {
          // Reset after 30 seconds
          setTimeout(() => setIsActivated(false), 30000);
        } else {
          // Reset if sequence doesn't match
          setSequence([]);
        }
      } else if (newSequence.length > KONAMI_CODE.length) {
        setSequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, [sequence, isActivated, toast]);

  const triggerKonamiEffect = () => {
    // Confetti burst
    const duration = 3000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#1A73E8', '#7CE03A', '#FFB703', '#FF7A00'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1A73E8', '#7CE03A', '#FFB703', '#FF7A00'],
      });
    }, 25);
  };

  return { isActivated, sequence };
};

export const KonamiCodeIndicator: React.FC<{ isActivated: boolean }> = ({ isActivated }) => {
  return (
    <AnimatePresence>
      {isActivated && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed bottom-20 right-4 z-50 pointer-events-none"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            <div className="p-4 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 shadow-2xl">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="absolute inset-0 rounded-full bg-primary blur-xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

