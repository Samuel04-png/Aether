import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { Project, Task, TeamMember } from '../types';
import { db } from '../services/firebase';

const PROJECTS_PAGE_SIZE = 20;

const normalizeTimestamp = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if ((value as Timestamp)?.toDate) {
    return (value as Timestamp).toDate().toISOString();
  }
  return undefined;
};

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
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastDocState = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [, setLastDocInternal] = lastDocState;
  const lastDoc = lastDocState[0];

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      setHasMore(false);
      setLastDocInternal(null);
      return;
    }

    const projectsCollection = collection(db, 'users', userId, 'projects');
    const projectsQuery = query(
      projectsCollection,
      orderBy('createdAt', 'desc'),
      limit(PROJECTS_PAGE_SIZE),
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const docsNeedingMigration = snapshot.docs.filter((document) => {
          const data = document.data() as Partial<Project>;
          const teamIds = data.teamMemberIds;
          return !data.ownerId || !Array.isArray(teamIds) || teamIds.length === 0;
        });

        docsNeedingMigration.forEach((document) => {
          const data = document.data() as Partial<Project>;
          const ownerId = data.ownerId ?? userId;
          const team = Array.isArray(data.team) ? data.team : [];
          const teamMemberIds = Array.from(
            new Set<string>([
              ownerId,
              ...team
                .map((member) => member?.id)
                .filter((memberId): memberId is string => Boolean(memberId)),
            ]),
          );

          const docRef = doc(db, 'users', userId, 'projects', document.id);
          updateDoc(docRef, {
            ownerId,
            teamMemberIds,
          }).catch((error) => {
            console.warn('Failed to migrate project metadata', document.id, error);
          });
        });

        setLastDocInternal(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
        setHasMore(snapshot.size === PROJECTS_PAGE_SIZE);

        setProjects(
          snapshot.docs.map((document) => {
            const data = document.data() as Omit<Project, 'id'> & { id?: string };
            return {
              ...data,
              id: document.id,
              team: data.team ?? [],
              tasks: data.tasks ?? [],
              files: data.files ?? [],
              chat: data.chat ?? [],
              teamMemberIds: data.teamMemberIds ?? [],
              ownerId: data.ownerId ?? userId,
              createdAt: normalizeTimestamp((data as any).createdAt) ?? undefined,
            } as Project;
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
      const team = input.team ?? [];
      const teamMemberIds = Array.from(
        new Set<string>([
          userId,
          ...team
            .map((member) => member?.id)
            .filter((memberId): memberId is string => Boolean(memberId)),
        ]),
      );

      const docRef = await addDoc(projectsCollection, {
        name: input.name,
        description: input.description,
        status: input.status ?? 'Not Started',
        progress: input.progress ?? 0,
        team: input.team ?? [],
        tasks: input.tasks ?? [],
        files: input.files ?? [],
        chat: input.chat ?? [],
        ownerId: userId,
        createdBy: userId,
        teamMemberIds,
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
      const snapshot = await getDoc(projectDoc);
      if (!snapshot.exists()) {
        throw new Error('Project not found.');
      }
      const existingData = snapshot.data() as Project;

      // Remove undefined fields before saving
      const cleanedUpdates = removeUndefinedFields(updates);
      const ownerId = (existingData.ownerId as string | undefined) ?? userId;
      const effectiveTeam = Array.isArray(cleanedUpdates?.team)
        ? (cleanedUpdates.team as TeamMember[])
        : (existingData.team ?? []);
      const updatedTeamMemberIds = Array.from(
        new Set<string>([
          ownerId,
          ...effectiveTeam
            .map((member) => member?.id)
            .filter((memberId): memberId is string => Boolean(memberId)),
        ]),
      );

      cleanedUpdates.ownerId = ownerId;
      cleanedUpdates.teamMemberIds = updatedTeamMemberIds;

      await updateDoc(projectDoc, cleanedUpdates);
    },
    [userId],
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!userId) throw new Error('You must be signed in to delete projects.');
      const projectDoc = doc(db, 'users', userId, 'projects', projectId);
      await deleteDoc(projectDoc);
    },
    [userId],
  );

  const loadMoreProjects = useCallback(async () => {
    if (!userId || !lastDoc) return;
    setIsLoadingMore(true);
    try {
      const projectsCollection = collection(db, 'users', userId, 'projects');
      const nextQuery = query(
        projectsCollection,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PROJECTS_PAGE_SIZE),
      );
      const snapshot = await getDocs(nextQuery);
      setLastDocInternal(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
      setHasMore(snapshot.size === PROJECTS_PAGE_SIZE);
      if (!snapshot.empty) {
        setProjects((prev) => {
          const map = new Map<string, Project>(prev.map((project) => [project.id, project]));
          snapshot.docs.forEach((document) => {
            const data = document.data() as Omit<Project, 'id'> & { id?: string };
            const normalizedTeam = data.team ?? [];
            const teamMemberIds = data.teamMemberIds ?? [];
            map.set(document.id, {
              ...data,
              id: document.id,
              team: normalizedTeam,
              tasks: data.tasks ?? [],
              files: data.files ?? [],
              chat: data.chat ?? [],
              teamMemberIds,
              ownerId: data.ownerId ?? userId,
              createdAt: normalizeTimestamp((data as any).createdAt) ?? undefined,
            } as Project);
          });
          const merged: Project[] = Array.from(map.values());
          merged.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });
          return merged;
        });
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load more projects.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, lastDoc]);

  return {
    projects,
    loading,
    isLoadingMore,
    hasMore,
    loadMoreProjects,
    error,
    createProject,
    updateProject,
    deleteProject,
  };
};

