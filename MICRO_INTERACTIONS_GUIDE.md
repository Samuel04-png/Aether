# Aether Micro-Interactions Guide 🎨

This document explains all the smooth, lightweight micro-interactions added to enhance the Aether application's user experience.

## Overview

Micro-interactions have been implemented throughout the Aether UI to create a more engaging, intuitive, and modern experience. These interactions are designed to provide visual feedback, guide user attention, and make the interface feel alive and responsive.

## Core Library

### Location
`lib/microInteractions.ts`

### Spring Configurations

Four spring configurations for different interaction types:

- **Snappy** (`stiffness: 400, damping: 30`) - For buttons and quick interactions
- **Smooth** (`stiffness: 300, damping: 35`) - For cards and larger elements
- **Gentle** (`stiffness: 200, damping: 25`) - For subtle movements
- **Bouncy** (`stiffness: 500, damping: 20`) - For playful interactions

### Available Animations

#### Button Interactions
- **buttonVariants** - Scale on hover/tap
- **buttonRipple** - Material Design-like ripple effect

#### Card Interactions
- **cardVariants** - Fade in, lift on hover
- **cardShine** - Shine effect on hover

#### Input Interactions
- **inputVariants** - Scale on focus, shake on error
- **labelFloat** - Floating label animation

#### List Animations
- **listItemVariants** - Staggered fade-in with slide effect

#### Modal/Dialog
- **modalVariants** - Scale and fade for modal entrance
- **overlayVariants** - Backdrop fade animation

#### Notifications
- **notificationVariants** - Slide in from right with hover scale
- **badgeVariants** - Pop in with bounce, pulse animation

#### Icons
- **iconVariants** - Scale and rotate on interactions

## Enhanced Components

### 1. Enhanced Button (`components/ui/enhanced-button.tsx`)

Features:
- **Ripple Effect** - Material Design ripple on click
- **Shine Effect** - Subtle shine animation on hover
- **Glow Effect** - Glowing shadow on hover
- **Loading State** - Animated spinner
- **Icon Support** - Icons with micro-animations

Usage:
```tsx
import { EnhancedButton } from '@/components/ui/enhanced-button';

<EnhancedButton
  ripple={true}
  shine={true}
  glow={true}
  loading={isSubmitting}
  icon={<CheckIcon />}
  iconPosition="left"
>
  Submit
</EnhancedButton>
```

### 2. Enhanced Input (`components/ui/enhanced-input.tsx`)

Features:
- **Floating Label** - Label animates up when focused/filled
- **Focus Animation** - Smooth scale and border highlight
- **Error Shake** - Shake animation on validation errors
- **Success Indicator** - Checkmark animation on success
- **Icon Support** - Left or right positioned icons

Usage:
```tsx
import { EnhancedInput } from '@/components/ui/enhanced-input';

<EnhancedInput
  label="Email"
  floatingLabel={true}
  error={errors.email}
  success={isValid}
  icon={<MailIcon />}
  helperText="Enter your email address"
/>
```

### 3. Enhanced Toast Notifications (`components/ui/toast.tsx`)

Features:
- **Smooth Slide In** - Slides in from right with spring animation
- **Hover Scale** - Subtle scale up on hover
- **Backdrop Blur** - Glassmorphism effect
- **Color-coded Border** - Left border indicates type
- **Interactive Close** - Close button with hover/active states

The toast component is already integrated with the existing toast system - no changes needed to use it.

### 4. Enhanced Sidebar (`components/Sidebar.tsx`)

Features:
- **Staggered Item Animation** - Navigation items fade in with delay
- **Active State Transition** - Smooth slide for active indicator
- **Icon Animations** - Icons rotate/scale on hover
- **Shine Effect** - Workspace card has shine on hover
- **Collapse Animation** - Smooth width transition

## CSS Animations

### Location
`index.css`

### New Animations Added

1. **bounce-subtle** - Gentle bounce for attention
2. **wiggle** - Playful rotation wiggle
3. **pulse-glow** - Pulsing glow effect
4. **slide-up/down/left/right** - Directional slide animations
5. **rotate-in** - Rotate while scaling in

### Usage Classes
```css
.animate-bounce-subtle
.animate-wiggle
.animate-pulse-glow
.animate-slide-up
.animate-slide-down
.animate-slide-left
.animate-slide-right
.animate-rotate-in
```

### Enhanced Card Styles

Cards now include:
- **Hover lift** - Translates up and scales slightly
- **Gradient overlay** - Subtle gradient appears on hover
- **Border glow** - Border color transitions to primary
- **Shadow expansion** - Shadow grows on hover

### Enhanced Button Styles

All button variants now include:
- **Lift on hover** - Y-axis translation
- **Scale effect** - Subtle scale increase
- **Active state** - Scale down on click
- **Shine animation** - Sliding shine effect
- **Shadow transitions** - Growing shadows

## Dashboard Enhancements

The Team Momentum section features:
- **Progress bars** - Animated fill with smooth easing
- **Card gradients** - Color-coded background gradients
- **Hover animations** - Cards scale and lift
- **Icon rotations** - 360° rotation on hover
- **Staggered reveals** - Items appear sequentially
- **Deadline urgency** - Color-coded by time remaining
- **Interactive items** - All clickable with hover feedback

## Best Practices

### 1. Performance
- All animations use CSS transforms (translateX/Y, scale, rotate) for GPU acceleration
- `will-change` is used sparingly on frequently animated elements
- Animations are kept under 500ms for snappiness

### 2. Accessibility
- Animations respect `prefers-reduced-motion` media query
- Focus states are clearly visible
- Interactive elements have minimum 44x44px touch targets

### 3. Consistency
- Use the predefined spring configurations
- Stick to the established animation durations
- Follow the color-coding system (primary for actions, destructive for warnings)

## Customization

### Creating Custom Springs

```typescript
import { createSpring } from '@/lib/microInteractions';

const myCustomSpring = createSpring(250, 28);
```

### Combining Variants

```tsx
<motion.div
  variants={cardVariants}
  whileHover={{ ...hoverLift.hover, scale: 1.02 }}
  initial="initial"
  animate="animate"
>
  {/* content */}
</motion.div>
```

### Custom Animations

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  {/* content */}
</motion.div>
```

## Examples

### Interactive Card
```tsx
<motion.div
  className="card"
  variants={cardVariants}
  initial="initial"
  whileHover="hover"
  whileTap={{ scale: 0.98 }}
>
  <h3>Interactive Card</h3>
  <p>Hover over me!</p>
</motion.div>
```

### Staggered List
```tsx
<motion.ul variants={staggerChildren(0.1)}>
  {items.map((item, index) => (
    <motion.li
      key={item.id}
      custom={index}
      variants={listItemVariants}
      whileHover="hover"
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Loading Button
```tsx
<EnhancedButton
  loading={isLoading}
  disabled={isLoading}
  onClick={handleSubmit}
>
  {isLoading ? 'Submitting...' : 'Submit'}
</EnhancedButton>
```

## Testing

All micro-interactions have been tested for:
- ✅ Visual smoothness
- ✅ Performance (60fps)
- ✅ Browser compatibility
- ✅ Touch device support
- ✅ Reduced motion preferences
- ✅ Build compilation

## Future Enhancements

Potential additions:
- Particle effects for celebrations
- Skeleton loader animations
- Page transition animations
- Drag and drop micro-interactions
- Voice interaction feedback
- Haptic feedback for mobile devices

## Support

For questions or issues with micro-interactions:
1. Check this guide for usage examples
2. Review the `microInteractions.ts` library
3. Test in development mode for better debugging
4. Check browser console for animation warnings

---

**Made with ❤️ for a delightful user experience**

