import { useEffect, useRef, useState } from 'react';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Task, Project } from '../types';
import { db } from '../services/firebase';

interface TaskWithProject extends Task {
  projectName?: string;
}

export const useAssignedTasks = (userId?: string) => {
  const [assignedTasks, setAssignedTasks] = useState<TaskWithProject[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const projectNameCacheRef = useRef<Map<string, string>>(new Map());

  const normalizeTimestamp = (value: any): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    if (value?.toDate) {
      return value.toDate().toISOString();
    }
    return undefined;
  };

  const normalizeDateString = (value: any): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    if (value?.toDate) {
      return value.toDate().toISOString();
    }
    return undefined;
  };

  useEffect(() => {
    if (!userId) {
      setAssignedTasks([]);
      setUpcomingDeadlines([]);
      setLoading(false);
      projectNameCacheRef.current = new Map();
      return;
    }

    setLoading(true);
    projectNameCacheRef.current = new Map();

    const tasksCollection = collection(db, 'users', userId, 'tasks');
    const tasksQuery = query(tasksCollection, orderBy('createdAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      tasksQuery,
      async (snapshot) => {
        const allTasks = snapshot.docs.map((taskDoc) => {
          const raw = taskDoc.data() as Omit<Task, 'id'> & { id?: string };
          const createdAt = normalizeTimestamp((raw as any).createdAt);
          const dueDate = normalizeDateString((raw as any).dueDate);
          return {
            id: taskDoc.id,
            ...raw,
            createdAt,
            dueDate,
          } as Task;
        });

        const relevantTasks = allTasks.filter(
          (task) => task.assignedTo === userId || task.assignee?.id === userId,
        );

        const projectIdsToFetch = Array.from(
          new Set(
            relevantTasks
              .map((task) => task.projectId)
              .filter((projectId): projectId is string => Boolean(projectId)),
          ),
        ).filter((projectId) => !projectNameCacheRef.current.has(projectId));

        if (projectIdsToFetch.length > 0) {
          await Promise.all(
            projectIdsToFetch.map(async (projectId) => {
              try {
                const projectDoc = await getDoc(doc(db, 'users', userId, 'projects', projectId));
                if (projectDoc.exists()) {
                  const projectData = projectDoc.data() as Project;
                  projectNameCacheRef.current.set(projectId, projectData.name);
                } else {
                  projectNameCacheRef.current.set(projectId, 'Project');
                }
              } catch (error) {
                console.warn('Failed to resolve project name', projectId, error);
              }
            }),
          );
        }

        const tasksWithProjects: TaskWithProject[] = relevantTasks.map((task) => ({
          ...task,
          projectName: task.projectId
            ? projectNameCacheRef.current.get(task.projectId) ?? 'Project'
            : 'General',
        }));

        setAssignedTasks(tasksWithProjects);

        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const deadlines = tasksWithProjects
          .filter((task) => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate >= now && dueDate <= sevenDaysFromNow && task.status !== 'done';
          })
          .sort((a, b) => {
            const dateA = new Date(a.dueDate!).getTime();
            const dateB = new Date(b.dueDate!).getTime();
            return dateA - dateB;
          });

        setUpcomingDeadlines(deadlines);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching assigned tasks:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const incompleteTasks = assignedTasks.filter(task => task.status !== 'done');
  const completedTasks = assignedTasks.filter(task => task.status === 'done');

  return {
    assignedTasks,
    incompleteTasks,
    completedTasks,
    upcomingDeadlines,
    loading,
  };
};

