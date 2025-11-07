import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Task, TaskStatus, TeamMember } from '../types';
import { db } from '../services/firebase';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const tasksCollection = collection(db, 'users', userId, 'tasks');
    // Use onSnapshot without orderBy to avoid errors if createdAt doesn't exist
    const unsubscribe = onSnapshot(
      tasksCollection,
      (snapshot) => {
        const tasksData = snapshot.docs.map((document) => {
          const data = document.data() as Omit<Task, 'id'> & { id?: string };
          return {
            id: document.id,
            ...data,
          };
        });
        // Sort by createdAt if available, otherwise by id
        tasksData.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        });
        setTasks(tasksData);
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
      await updateDoc(taskDoc, { status });
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
        // Use FieldValue.delete() equivalent - set to null and filter in query
        updateData.assignee = null;
        updateData.assignedTo = null;
      }
      await updateDoc(taskDoc, cleanTaskData(updateData));
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
    addTask,
    updateTaskStatus,
    assignTask,
  };
};

