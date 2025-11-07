import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
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

    const fetchAssignedTasks = async () => {
      try {
        setLoading(true);
        const tasksWithProjects: TaskWithProject[] = [];

        // Get all users collection to find projects where user is a member
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        // For each user, check their projects
        for (const userDoc of usersSnapshot.docs) {
          const projectsCollection = collection(db, 'users', userDoc.id, 'projects');
          const projectsSnapshot = await getDocs(projectsCollection);

          for (const projectDoc of projectsSnapshot.docs) {
            const projectData = projectDoc.data() as Project;
            
            // Check if current user is a team member
            const isTeamMember = projectData.team?.some(member => member.id === userId);
            
            if (isTeamMember && projectData.tasks) {
              // Find tasks assigned to current user
              const userTasks = projectData.tasks.filter(task => {
                return task.assignee?.id === userId || task.assignedTo === userId;
              });

              // Add project context to each task
              userTasks.forEach(task => {
                tasksWithProjects.push({
                  ...task,
                  projectName: projectData.name,
                  projectId: projectDoc.id,
                });
              });
            }
          }
        }

        setAssignedTasks(tasksWithProjects);

        // Filter upcoming deadlines (next 7 days)
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const deadlines = tasksWithProjects.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= now && dueDate <= sevenDaysFromNow && task.status !== 'done';
        }).sort((a, b) => {
          const dateA = new Date(a.dueDate!).getTime();
          const dateB = new Date(b.dueDate!).getTime();
          return dateA - dateB;
        });

        setUpcomingDeadlines(deadlines);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assigned tasks:', error);
        setLoading(false);
      }
    };

    fetchAssignedTasks();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAssignedTasks, 30000);
    return () => clearInterval(interval);
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

