import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../services/firebase';

export interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  date: string;
}

export interface NewScheduledPostInput {
  content: string;
  platform: string;
  date: string;
}

export const useScheduledPosts = (userId?: string) => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const postsCollection = collection(db, 'users', userId, 'scheduledPosts');
    const postsQuery = query(postsCollection, orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        setPosts(
          snapshot.docs.map((document) => {
            const data = document.data() as Omit<ScheduledPost, 'id'> & { id?: string };
            return {
              id: document.id,
              ...data,
            };
          }),
        );
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

  const schedulePost = useCallback(
    async (input: NewScheduledPostInput) => {
      if (!userId) throw new Error('You must be signed in to schedule posts.');
      const postsCollection = collection(db, 'users', userId, 'scheduledPosts');
      const docRef = await addDoc(postsCollection, {
        content: input.content,
        platform: input.platform,
        date: input.date,
        createdAt: serverTimestamp(),
      });
      await updateDoc(docRef, { id: docRef.id });
    },
    [userId],
  );

  const cancelPost = useCallback(
    async (postId: string) => {
      if (!userId) return;
      const postDoc = doc(db, 'users', userId, 'scheduledPosts', postId);
      await deleteDoc(postDoc);
    },
    [userId],
  );

  return {
    posts,
    loading,
    error,
    schedulePost,
    cancelPost,
  };
};

