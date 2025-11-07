import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aether.particlesEnabled';

export default function useParticles() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) return raw === '1';
    } catch (e) {
      // ignore
    }

    // default: disabled if user prefers reduced motion
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch (e) {
      // ignore
    }
  }, [enabled]);

  return { enabled, setEnabled } as const;
}
