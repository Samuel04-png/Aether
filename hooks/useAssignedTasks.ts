import { useEffect, useState } from 'react';
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore';
import { Task, Project } from '../types';
import { db } from '../services/firebase';

interface TaskWithProject extends Task {
  projectName: string;
  projectId: string;
}

export const useAssignedTasks = (userId?: string) => {
  const [assignedTasks, setAssignedTasks] = useState<TaskWithProject[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setAssignedTasks([]);
      setUpcomingDeadlines([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const projectsQuery = query(
      collectionGroup(db, 'projects'),
      where('teamMemberIds', 'array-contains', userId),
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      (projectsSnapshot) => {
        const tasksWithProjects: TaskWithProject[] = [];

        projectsSnapshot.docs.forEach((projectDoc) => {
          const projectData = projectDoc.data() as Project;
          const projectTasks = Array.isArray(projectData.tasks) ? projectData.tasks : [];

          projectTasks
            .filter((task) => task?.assignee?.id === userId || task?.assignedTo === userId)
            .forEach((task) => {
              tasksWithProjects.push({
                ...task,
                projectName: projectData.name,
                projectId: projectDoc.id,
              });
            });
        });

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
      }
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

