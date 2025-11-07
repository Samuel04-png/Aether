import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile } from '../types';

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const profileDoc = doc(db, 'users', userId, 'profile', 'workspace');
    
    let unsubscribe: (() => void) | null = null;
    
    // Quick initial check for faster loading, then set up real-time listener
    import('firebase/firestore').then(({ getDoc }) => {
      getDoc(profileDoc).then((snapshot) => {
        const data = snapshot.data() as UserProfile | undefined;
        setProfile(data ?? null);
        setLoading(false);
        setError(null);
        
        // Then set up real-time listener for updates
        unsubscribe = onSnapshot(
          profileDoc,
          (snapshot) => {
            const data = snapshot.data() as UserProfile | undefined;
            setProfile(data ?? null);
          },
          (err) => {
            setError(err.message);
          },
        );
      }).catch(() => {
        // Fallback to listener if getDoc fails
        unsubscribe = onSnapshot(
          profileDoc,
          (snapshot) => {
            const data = snapshot.data() as UserProfile | undefined;
            setProfile(data ?? null);
            setLoading(false);
            setError(null);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          },
        );
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const saveProfile = useCallback(
    async (nextProfile: UserProfile) => {
      if (!userId) {
        throw new Error('Cannot save profile without a user id');
      }
      const profileDoc = doc(db, 'users', userId, 'profile', 'workspace');
      await setDoc(profileDoc, { ...nextProfile }, { merge: true });
    },
    [userId],
  );

  const markOnboardingComplete = useCallback(async () => {
    if (!userId) {
      throw new Error('Cannot update onboarding state without a user id');
    }
    const profileDoc = doc(db, 'users', userId, 'profile', 'workspace');
    await setDoc(profileDoc, { completedOnboarding: true }, { merge: true });
  }, [userId]);

  return {
    profile,
    loading,
    error,
    saveProfile,
    markOnboardingComplete,
  };
};

