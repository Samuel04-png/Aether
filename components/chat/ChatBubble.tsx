import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMood } from '../../hooks/useMood';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick, isOpen }) => {
  const { mood, color, emoji, pulseVariant, message } = useMood();

  const pulseAnimation = {
    gentle: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    moderate: {
      scale: [1, 1.08, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    intense: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    calm: {
      scale: [1, 1.03, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <motion.button
        onClick={onClick}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed z-50 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300',
          'bottom-24 right-6 md:bottom-8 md:right-8',
          'h-16 w-16 md:h-18 md:w-18',
          'group overflow-hidden',
          isOpen && 'scale-90 opacity-70'
        )}
        style={{
          backgroundColor: color,
        }}
        aria-label="Open Copilot Chat"
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40"
          style={{
            backgroundColor: color,
          }}
        />

        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: color,
          }}
          animate={pulseAnimation[pulseVariant]}
        />

        {/* Emoji */}
        <span className="relative z-10 text-3xl md:text-4xl filter drop-shadow-lg">
          {emoji}
        </span>

        {/* Tooltip on hover */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileHover={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-full mr-4 px-4 py-2 bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-lg text-sm font-medium text-foreground whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <span>{message}</span>
            </div>
            {/* Arrow */}
            <div
              className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-2 rotate-45 bg-card border-r border-b border-border/60"
            />
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default ChatBubble;

