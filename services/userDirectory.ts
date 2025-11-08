import { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { buildSearchKeywords } from '@/lib/keywords';

interface DirectoryPayload {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerIds: string[];
}

const createPayload = (user: User): DirectoryPayload => ({
  displayName: user.displayName ?? null,
  email: user.email ?? null,
  photoURL: user.photoURL ?? null,
  providerIds: user.providerData
    .map((provider) => provider.providerId)
    .filter((id): id is string => Boolean(id)),
});

export const syncUserDirectoryEntry = async (user: User): Promise<void> => {
  const docRef = doc(db, 'userDirectory', user.uid);
  const payload = createPayload(user);

  const keywords = buildSearchKeywords(payload.displayName ?? undefined, payload.email ?? undefined);
  const emailLowercase = payload.email ? payload.email.toLowerCase() : null;

  const data = {
    displayName: payload.displayName,
    email: payload.email,
    emailLowercase,
    photoURL: payload.photoURL,
    providerIds: payload.providerIds,
    keywords,
    updatedAt: serverTimestamp(),
  };

  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(docRef, data, { merge: true });
};

export const ensureUserDirectoryEntry = async (user: User): Promise<void> => {
  try {
    await syncUserDirectoryEntry(user);
  } catch (error) {
    console.error('Failed to sync user directory entry', error);
  }
};

