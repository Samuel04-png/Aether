import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface SocialStat {
  id: string;
  platform: string;
  metric: string;
  value: string;
  change: string;
}

interface SocialAnalyticsDoc {
  stats: SocialStat[];
  updatedAt?: unknown;
}

export const useSocialStats = (userId?: string) => {
  const [stats, setStats] = useState<SocialStat[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setStats([]);
      setLoading(false);
      return;
    }

    const socialDoc = doc(db, 'users', userId, 'analytics', 'social');
    const unsubscribe = onSnapshot(
      socialDoc,
      (snapshot) => {
        const payload = snapshot.data() as SocialAnalyticsDoc | undefined;
        setStats(payload?.stats ?? []);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    stats,
    loading,
    error,
  };
};

