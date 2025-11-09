import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
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
import { Task, TaskStatus, TeamMember } from '../types';
import { db } from '../services/firebase';

const TASKS_PAGE_SIZE = 20;

const normalizeTimestamp = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if ((value as Timestamp)?.toDate) {
    return (value as Timestamp).toDate().toISOString();
  }
  return undefined;
};

export interface NewTaskInput {
  title: string;
  description: string;
  status?: TaskStatus;
  dueDate?: string;
  assignee?: TeamMember;
}

// Helper to remove undefined fields
const cleanTaskData = (data: any): any => {
  const cleaned: any = {};
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      if (typeof data[key] === 'object' && !Array.isArray(data[key]) && !(data[key] instanceof Date)) {
        const cleanedObj = cleanTaskData(data[key]);
        if (Object.keys(cleanedObj).length > 0) {
          cleaned[key] = cleanedObj;
        }
      } else {
        cleaned[key] = data[key];
      }
    }
  }
  return cleaned;
};

export const useTasks = (userId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastDocState = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [, setLastDocInternal] = lastDocState;
  const lastDoc = lastDocState[0];

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      setHasMore(false);
      setLastDocInternal(null);
      return;
    }

    const tasksCollection = collection(db, 'users', userId, 'tasks');
    const baseQuery = query(
      tasksCollection,
      orderBy('createdAt', 'desc'),
      limit(TASKS_PAGE_SIZE),
    );

    const unsubscribe = onSnapshot(
      baseQuery,
      (snapshot) => {
        const nextTasks: Task[] = snapshot.docs.map((document) => {
          const data = document.data() as Omit<Task, 'id'> & { id?: string };
          return {
            id: document.id,
            ...data,
            createdAt: normalizeTimestamp((data as any).createdAt) ?? undefined,
            completedAt: normalizeTimestamp((data as any).completedAt) ?? undefined,
          } as Task;
        });
        setLastDocInternal(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
        setHasMore(snapshot.size === TASKS_PAGE_SIZE);
        setTasks(nextTasks);
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

  const loadMoreTasks = useCallback(async () => {
    if (!userId || !lastDoc || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const tasksCollection = collection(db, 'users', userId, 'tasks');
      const nextQuery = query(
        tasksCollection,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(TASKS_PAGE_SIZE),
      );
      const snapshot = await getDocs(nextQuery);
      setLastDocInternal(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
      setHasMore(snapshot.size === TASKS_PAGE_SIZE);
      if (!snapshot.empty) {
        setTasks((prev) => {
          const map = new Map(prev.map((task) => [task.id, task]));
          snapshot.docs.forEach((document) => {
            const data = document.data() as Omit<Task, 'id'> & { id?: string };
            map.set(document.id, {
              id: document.id,
              ...data,
              createdAt: normalizeTimestamp((data as any).createdAt) ?? undefined,
              completedAt: normalizeTimestamp((data as any).completedAt) ?? undefined,
            } as Task);
          });
          const merged = Array.from(map.values());
          merged.sort((a: any, b: any) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
          });
          return merged;
        });
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load more tasks.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, lastDoc, isLoadingMore]);

  const addTask = useCallback(
    async (input: NewTaskInput) => {
      if (!userId) throw new Error('You must be signed in to create tasks.');
      const tasksCollection = collection(db, 'users', userId, 'tasks');
      const taskData: any = {
        title: input.title,
        description: input.description,
        status: input.status ?? 'todo',
        createdAt: serverTimestamp(),
      };
      if (input.dueDate) {
        taskData.dueDate = input.dueDate;
      }
      if (input.assignee) {
        taskData.assignee = input.assignee;
      }

      const cleanedData = cleanTaskData(taskData);
      const docRef = await addDoc(tasksCollection, cleanedData);
      await updateDoc(docRef, { id: docRef.id });
    },
    [userId],
  );

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      if (!userId) throw new Error('You must be signed in to update tasks.');
      const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
      if (status === 'done') {
        await updateDoc(taskDoc, { status, completedAt: serverTimestamp() });
      } else {
        await updateDoc(taskDoc, { status, completedAt: deleteField() });
      }
    },
    [userId],
  );

  const assignTask = useCallback(
    async (taskId: string, assignee: TeamMember | null) => {
      if (!userId) throw new Error('You must be signed in to assign tasks.');
      const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
      const updateData: any = {};
      if (assignee) {
        updateData.assignee = assignee;
        updateData.assignedTo = assignee.id;
      } else {
        updateData.assignee = null;
        updateData.assignedTo = null;
      }
      await updateDoc(taskDoc, cleanTaskData(updateData));
    },
    [userId],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!userId) throw new Error('You must be signed in to delete tasks.');
      const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
      await deleteDoc(taskDoc);
    },
    [userId],
  );

  const tasksByStatus = useMemo(() => ({
    todo: tasks.filter((task) => task.status === 'todo'),
    inprogress: tasks.filter((task) => task.status === 'inprogress'),
    done: tasks.filter((task) => task.status === 'done'),
  }), [tasks]);

  return {
    tasks,
    tasksByStatus,
    loading,
    error,
    isLoadingMore,
    hasMore,
    loadMoreTasks,
    addTask,
    updateTaskStatus,
    assignTask,
    deleteTask,
  };
};

