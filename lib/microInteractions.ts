/**
 * Micro-interactions Library for Aether
 * Smooth, lightweight animations and interactions
 */

import { Variants } from 'framer-motion';

// Spring configurations for different use cases
export const springs = {
  // Snappy for buttons and quick interactions
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  // Smooth for cards and larger elements
  smooth: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 35,
  },
  // Gentle for subtle movements
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
  // Bouncy for playful interactions
  bouncy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 20,
  },
};

// Button micro-interactions
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: springs.snappy,
  },
  tap: {
    scale: 0.98,
    transition: springs.snappy,
  },
};

export const buttonRipple: Variants = {
  initial: { scale: 0, opacity: 0.5 },
  animate: {
    scale: 2,
    opacity: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Card micro-interactions
export const cardVariants: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: springs.smooth,
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: springs.gentle,
  },
};

export const cardShine: Variants = {
  initial: { x: '-100%', opacity: 0 },
  hover: {
    x: '100%',
    opacity: 0.2,
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
};

// Input micro-interactions
export const inputVariants: Variants = {
  initial: { scale: 1 },
  focus: {
    scale: 1.01,
    transition: springs.snappy,
  },
  error: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

export const labelFloat: Variants = {
  initial: { y: 0, scale: 1, opacity: 0.7 },
  float: {
    y: -24,
    scale: 0.85,
    opacity: 1,
    transition: springs.gentle,
  },
};

// List item animations
export const listItemVariants: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: (index: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      ...springs.smooth,
      delay: index * 0.05,
    },
  }),
  exit: {
    x: 20,
    opacity: 0,
    transition: springs.snappy,
  },
  hover: {
    x: 8,
    transition: springs.snappy,
  },
};

// Modal/Dialog animations
export const modalVariants: Variants = {
  initial: { scale: 0.9, opacity: 0, y: 20 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: 20,
    transition: springs.snappy,
  },
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Badge animations
export const badgeVariants: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: springs.bouncy,
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Icon animations
export const iconVariants: Variants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    transition: springs.snappy,
  },
  tap: {
    scale: 0.9,
    transition: springs.snappy,
  },
  spin: {
    rotate: 360,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

// Notification/Toast animations
export const notificationVariants: Variants = {
  initial: { x: 400, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: springs.smooth,
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: springs.snappy,
  },
  hover: {
    scale: 1.02,
    transition: springs.gentle,
  },
};

// Progress bar animations
export const progressVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  }),
};

// Skeleton loading animations
export const skeletonVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Dropdown menu animations
export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// Sidebar navigation animations
export const sidebarItemVariants: Variants = {
  initial: { x: -10, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: springs.gentle,
  },
  hover: {
    x: 4,
    transition: springs.snappy,
  },
  active: {
    x: 8,
    transition: springs.smooth,
  },
};

// Tooltip animations
export const tooltipVariants: Variants = {
  initial: { opacity: 0, y: 5, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    y: 5,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

// Checkbox animations
export const checkmarkVariants: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Success/Error feedback animations
export const successVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: springs.bouncy,
  },
};

export const errorShake: Variants = {
  animate: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

// Tab switching animations
export const tabVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

// Loading spinner animations
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Number counter animation utility
export const counterAnimation = (target: number, duration: number = 1) => ({
  from: 0,
  to: target,
  duration,
  ease: 'easeOut',
});

// Stagger children utility
export const staggerChildren = (staggerTime: number = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: staggerTime,
    },
  },
});

// Hover lift effect
export const hoverLift = {
  hover: {
    y: -2,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: springs.gentle,
  },
};

// Pulse effect for notifications
export const pulseEffect: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Glow effect on hover
export const glowEffect: Variants = {
  hover: {
    boxShadow: '0 0 20px rgba(26, 115, 232, 0.4)',
    transition: { duration: 0.3 },
  },
};

// Slide in from direction utilities
export const slideInFromLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: springs.smooth,
  },
};

export const slideInFromRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: springs.smooth,
  },
};

export const slideInFromTop: Variants = {
  initial: { y: -100, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: springs.smooth,
  },
};

export const slideInFromBottom: Variants = {
  initial: { y: 100, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: springs.smooth,
  },
};

// Fade and scale in
export const fadeScaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springs.smooth,
  },
};

// Utility function for creating custom spring configs
export const createSpring = (
  stiffness: number = 300,
  damping: number = 30
) => ({
  type: 'spring' as const,
  stiffness,
  damping,
});

