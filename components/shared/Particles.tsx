import React, { useEffect, useRef } from 'react';

// Enhanced particle background with glow, color, twinkle and mouse interaction.
// Designed to be visually striking while keeping decent performance.
import useParticles from '../../hooks/useParticles';

const Particles: React.FC = () => {
  const { enabled } = useParticles();

  // If user disabled particles or prefers reduced motion, don't render canvas
  if (!enabled) return null;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Color palette for particles and lines
    const palette = [
      'rgba(59,130,246,', // blue-ish (brand)
      'rgba(99,102,241,', // indigo
      'rgba(99,102,241,',
      'rgba(67,56,202,',
      'rgba(16,185,129,', // accent green
    ];

    // Particle structure
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      baseR: number;
      hue: string; // palette prefix
      twinklePhase: number;
    };

    const particles: Particle[] = [];

    // Density scales with area but caps for performance
    const area = width * height;
    let targetCount = Math.min(220, Math.max(40, Math.round(area / 4000)));
    // reduce on small screens
    if (width < 600) targetCount = Math.round(targetCount * 0.45);

    for (let i = 0; i < targetCount; i++) {
      const size = Math.random() * 2.8 + 0.8;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: size,
        baseR: size,
        hue: palette[Math.floor(Math.random() * palette.length)],
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    const mouse = { x: width / 2, y: height / 2, vx: 0, vy: 0, lastX: width / 2, lastY: height / 2 };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.vx = mouse.x - mouse.lastX;
      mouse.vy = mouse.y - mouse.lastY;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
    };

    const onClick = (e: MouseEvent) => {
      // small burst of nearby particles
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          r: Math.random() * 3 + 1,
          baseR: Math.random() * 3 + 1,
          hue: palette[Math.floor(Math.random() * palette.length)],
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      // cap explosion growth
      while (particles.length > targetCount * 1.6) particles.shift();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', onResize);

    let raf = 0;

    const maxLinkDist = 140;

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // additive blending for glow
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse attraction with falloff and slight parallax
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const attract = Math.max(0, 1 - dist / 260);
        p.vx += (dx / dist) * 0.12 * attract;
        p.vy += (dy / dist) * 0.12 * attract;

        // small noise and return to base radius
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.92;
        p.vy *= 0.92;

        // twinkle / pulsate radius
        p.twinklePhase += 0.02 + Math.random() * 0.02;
        const twinkle = Math.sin(p.twinklePhase) * 0.6 + 0.6;
        const drawR = Math.max(0.3, p.baseR * (0.6 + twinkle));

        // glow circle (soft)
        ctx.beginPath();
        ctx.fillStyle = `${p.hue}0.12)`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `${p.hue}0.9)`;
        ctx.arc(p.x, p.y, drawR * 3, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.shadowBlur = 6;
        ctx.shadowColor = `${p.hue}0.9)`;
        ctx.fillStyle = `${p.hue}0.98)`;
        ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw connecting lines with subtle gradients
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxLinkDist * maxLinkDist) {
            const t = 1 - d2 / (maxLinkDist * maxLinkDist);
            const alpha = Math.pow(t, 1.2) * 0.6;
            // mix hues by picking one and fading
            ctx.beginPath();
            ctx.strokeStyle = `${a.hue}${0.5 * alpha})`;
            ctx.lineWidth = 1 * Math.min(1.2, t * 1.8);
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // cleanup: keep particle list bounded
      if (particles.length > targetCount * 1.4) {
        particles.splice(0, particles.length - Math.round(targetCount * 1.2));
      }

      raf = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default Particles;
