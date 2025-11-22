// @ts-ignore - canvas-confetti doesn't have types
import confetti from 'canvas-confetti';

export const celebrateTaskCompletion = () => {
  const duration = 2000;
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#7CE03A', '#1A73E8'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#7CE03A', '#1A73E8'],
    });
  }, 25);
};

export const celebrateProjectCompletion = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#1A73E8', '#7CE03A', '#FFB703', '#FF7A00'],
  });
};

export const celebrateMilestone = (milestone: string) => {
  const colors = ['#1A73E8', '#7CE03A', '#FFB703', '#FF7A00', '#9B59B6'];
  
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.5 },
    colors,
  });

  // Burst effect
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
  }, 250);
};

export const celebrateStreak = (days: number) => {
  const burst = (x: number, y: number) => {
    confetti({
      particleCount: 50,
      startVelocity: { x: 0, y: 0 },
      gravity: 0.3,
      spread: 360,
      origin: { x, y },
      colors: ['#FFB703', '#FF7A00', '#1A73E8'],
    });
  };

  // Multiple bursts
  burst(0.2, 0.3);
  setTimeout(() => burst(0.5, 0.4), 100);
  setTimeout(() => burst(0.8, 0.3), 200);
};

