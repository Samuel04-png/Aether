import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

type LogoVariant = 'default' | 'compact' | 'loader';

interface LogoProps {
  className?: string;
  variant?: LogoVariant;
  animated?: boolean;
  size?: number;
}

const LOGO_PRIMARY = '/aether-logo/Logo.png';
const LOGO_LIGHTMODE = '/aether-logo/Logo_lightmode.png';

export const Logo: React.FC<LogoProps> = ({
  className,
  variant = 'default',
  animated = false,
  size,
}) => {
  const { theme } = useTheme();
  const src = theme === 'dark' ? LOGO_LIGHTMODE : LOGO_PRIMARY;
  const dimension = size ?? (variant === 'compact' ? 28 : 40);

  const image = (
    <img
      src={src}
      alt="Aether Logo"
      width={dimension}
      height={dimension}
      className={cn('object-contain', variant === 'compact' ? 'h-7 w-auto' : 'h-10 w-auto', className)}
      draggable={false}
    />
  );

  if (!animated) {
    return image;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative inline-flex items-center justify-center"
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 via-purple-500/30 to-pink-500/30 blur-3xl"
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {image}
    </motion.div>
  );
};

export const LogoSpinner: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useTheme();
  const src = theme === 'dark' ? LOGO_LIGHTMODE : LOGO_PRIMARY;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <motion.div
        className="absolute h-24 w-24 rounded-full border border-primary/40"
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute h-16 w-16 rounded-full border border-primary/60 border-t-transparent"
        animate={{ rotate: -360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      <motion.img
        src={src}
        alt="Aether Logo"
        className="relative h-14 w-auto drop-shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
};

export default Logo;

