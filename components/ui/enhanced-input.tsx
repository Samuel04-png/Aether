/**
 * Enhanced Input with Micro-interactions
 * Includes floating label, focus animations, and error feedback
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { inputVariants, labelFloat, errorShake } from '@/lib/microInteractions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  floatingLabel?: boolean;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    label,
    error,
    success,
    helperText,
    icon,
    iconPosition = 'left',
    floatingLabel = false,
    className,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const shouldFloatLabel = floatingLabel && (isFocused || hasValue);

    return (
      <div className="relative w-full">
        {label && !floatingLabel && (
          <Label className="mb-2 block text-sm font-medium text-foreground">
            {label}
          </Label>
        )}

        <motion.div
          className="relative"
          variants={error ? errorShake : inputVariants}
          initial="initial"
          animate={isFocused ? "focus" : error ? "error" : "initial"}
        >
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          {floatingLabel && label && (
            <motion.label
              variants={labelFloat}
              initial="initial"
              animate={shouldFloatLabel ? "float" : "initial"}
              className={cn(
                "absolute left-3 pointer-events-none transition-all duration-200",
                shouldFloatLabel ? "top-0 text-xs text-primary" : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              )}
            >
              {label}
            </motion.label>
          )}

          <Input
            ref={ref || inputRef}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'transition-all duration-300 focus:ring-2 focus:ring-primary/50',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              floatingLabel && 'pt-6',
              error && 'border-destructive focus:ring-destructive/50',
              success && 'border-chart-2 focus:ring-chart-2/50',
              className
            )}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          {/* Animated focus border */}
          <motion.div
            className={cn(
              "absolute bottom-0 left-0 h-0.5 bg-primary",
              error && "bg-destructive",
              success && "bg-chart-2"
            )}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ originX: 0.5 }}
          />
        </motion.div>

        {/* Helper text or error message */}
        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'mt-1.5 text-xs',
                error ? 'text-destructive font-medium' : 'text-muted-foreground'
              )}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success indicator */}
        <AnimatePresence>
          {success && !error && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <svg
                className="w-5 h-5 text-chart-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput };

