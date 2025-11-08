import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { ensureUserDirectoryEntry } from '../services/userDirectory';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const lastDirectorySignature = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      lastDirectorySignature.current = null;
      return;
    }

    const signature = JSON.stringify({
      uid: user.uid,
      displayName: user.displayName ?? null,
      email: user.email ?? null,
      photoURL: user.photoURL ?? null,
      providers: user.providerData.map((provider) => provider.providerId).filter(Boolean),
    });

    if (lastDirectorySignature.current === signature) {
      return;
    }

    lastDirectorySignature.current = signature;

    ensureUserDirectoryEntry(user).catch((error) => {
      console.error('Failed to ensure user directory entry', error);
      lastDirectorySignature.current = null;
    });
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    initializing,
    async signIn(email: string, password: string) {
      await signInWithEmailAndPassword(auth, email, password);
    },
    async signUp(email: string, password: string, displayName?: string) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }
    },
    async signInWithGoogle() {
      await signInWithPopup(auth, googleProvider);
    },
    async signOutUser() {
      await signOut(auth);
    },
    async resetPassword(email: string) {
      await sendPasswordResetEmail(auth, email);
    },
  }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

