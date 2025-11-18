/**
 * Enhanced Button with Micro-interactions
 * Includes ripple effect, hover animations, and feedback
 */

import React, { useState, useRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { buttonVariants, buttonRipple, iconVariants } from '@/lib/microInteractions';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RippleProps {
  x: number;
  y: number;
  size: number;
}

interface EnhancedButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
  shine?: boolean;
  glow?: boolean;
  loading?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    children, 
    icon, 
    iconPosition = 'left', 
    ripple = true, 
    shine = false,
    glow = false,
    loading = false,
    className, 
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = useState<RippleProps[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const newRipple = { x, y, size };
        setRipples((prev) => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.slice(1));
        }, 600);
      }
      
      onClick?.(e);
    };

    return (
      <Button
        ref={ref || buttonRef}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          glow && 'hover:shadow-lg hover:shadow-primary/20',
          className
        )}
        {...props}
      >
        {/* Ripple effect */}
        {ripples.map((ripple, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            variants={buttonRipple}
            initial="initial"
            animate="animate"
          />
        ))}

        {/* Shine effect */}
        {shine && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
        )}

        {/* Content */}
        <motion.span 
          className="relative flex items-center justify-center gap-2"
          variants={buttonVariants}
          initial="initial"
          whileHover={!disabled && !loading ? "hover" : undefined}
          whileTap={!disabled && !loading ? "tap" : undefined}
        >
          {loading && (
            <motion.svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="32"
                strokeDashoffset="32"
                opacity="0.25"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="32"
                strokeDashoffset="0"
                className="origin-center"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </motion.svg>
          )}
          {icon && iconPosition === 'left' && (
            <motion.span variants={iconVariants} whileHover="hover" whileTap="tap">
              {icon}
            </motion.span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <motion.span variants={iconVariants} whileHover="hover" whileTap="tap">
              {icon}
            </motion.span>
          )}
        </motion.span>
      </Button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton };

