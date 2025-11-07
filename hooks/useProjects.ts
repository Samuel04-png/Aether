import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Project, Task, TeamMember } from '../types';
import { db } from '../services/firebase';

export interface NewProjectInput {
  name: string;
  description: string;
  status?: Project['status'];
  progress?: number;
  team?: TeamMember[];
  tasks?: Task[];
  files?: Project['files'];
  chat?: Project['chat'];
}

export const useProjects = (userId?: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const projectsCollection = collection(db, 'users', userId, 'projects');
    const projectsQuery = query(projectsCollection, orderBy('name'));

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        setProjects(
          snapshot.docs.map((document) => {
            const data = document.data() as Omit<Project, 'id'> & { id?: string };
            return {
              id: document.id,
              team: data.team ?? [],
              tasks: data.tasks ?? [],
              files: data.files ?? [],
              chat: data.chat ?? [],
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

  const createProject = useCallback(
    async (input: NewProjectInput) => {
      if (!userId) throw new Error('You must be signed in to create projects.');
      const projectsCollection = collection(db, 'users', userId, 'projects');
      const docRef = await addDoc(projectsCollection, {
        name: input.name,
        description: input.description,
        status: input.status ?? 'Not Started',
        progress: input.progress ?? 0,
        team: input.team ?? [],
        tasks: input.tasks ?? [],
        files: input.files ?? [],
        chat: input.chat ?? [],
        createdAt: serverTimestamp(),
      });
      await updateDoc(docRef, { id: docRef.id });
    },
    [userId],
  );

  // Helper function to remove undefined fields from objects
  const removeUndefinedFields = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj.map(item => removeUndefinedFields(item));
    }
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj[key] !== undefined) {
          cleaned[key] = removeUndefinedFields(obj[key]);
        }
      }
      return cleaned;
    }
    return obj;
  };

  const updateProject = useCallback(
    async (projectId: string, updates: Partial<Project>) => {
      if (!userId) throw new Error('You must be signed in to update projects.');
      const projectDoc = doc(db, 'users', userId, 'projects', projectId);
      // Remove undefined fields before saving
      const cleanedUpdates = removeUndefinedFields(updates);
      await updateDoc(projectDoc, cleanedUpdates);
    },
    [userId],
  );

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
  };
};

