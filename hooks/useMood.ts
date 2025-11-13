import { useMemo } from 'react';
import { useTasks } from './useTasks';
import { useProjects } from './useProjects';
import { useNotifications } from './useNotifications';
import { useAuth } from '../contexts/AuthContext';

export type MoodType = 'cheerful' | 'focused' | 'stressed' | 'idle';

export interface MoodResult {
  mood: MoodType;
  color: string;
  emoji: string;
  pulseVariant: 'gentle' | 'moderate' | 'intense' | 'calm';
  message: string;
}

export const useMood = (): MoodResult => {
  const { user } = useAuth();
  const { tasks } = useTasks(user?.uid);
  const { projects } = useProjects(user?.uid);
  const { notifications } = useNotifications(user?.uid);

  return useMemo(() => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'inprogress').length;
    const overdueTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < now && t.status !== 'done';
    }).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Check for recent destructive notifications
    const recentDestructiveNotifs = notifications.filter((n) => {
      if (!n.time) return false;
      const notifTime = new Date(n.time);
      return notifTime >= twoDaysAgo && n.variant === 'destructive';
    }).length;

    // Check for recent activity (tasks created or completed in last 48 hours)
    const recentActivity = tasks.filter((t) => {
      if (!t.createdAt) return false;
      const createdAt = new Date(t.createdAt);
      return createdAt >= twoDaysAgo;
    }).length;

    // Mood logic
    // Stressed: High overdue tasks OR recent destructive notifications
    if (overdueTasks > 3 || recentDestructiveNotifs > 2) {
      return {
        mood: 'stressed',
        color: 'hsl(var(--destructive))',
        emoji: '😰',
        pulseVariant: 'intense',
        message: "You seem overwhelmed. Let's prioritize!",
      };
    }

    // Cheerful: High completion rate AND no overdue tasks
    if (completionRate > 70 && overdueTasks === 0 && totalTasks > 0) {
      return {
        mood: 'cheerful',
        color: 'hsl(142 76% 36%)', // emerald
        emoji: '🎉',
        pulseVariant: 'gentle',
        message: "You're crushing it! Keep up the great work!",
      };
    }

    // Focused: Active tasks in progress AND recent activity
    if (inProgressTasks > 0 && recentActivity > 0) {
      return {
        mood: 'focused',
        color: 'hsl(var(--primary))',
        emoji: '🚀',
        pulseVariant: 'moderate',
        message: "You're in the zone! Stay focused!",
      };
    }

    // Idle: Little to no activity in last 48 hours
    if (recentActivity === 0 && inProgressTasks === 0) {
      return {
        mood: 'idle',
        color: 'hsl(var(--muted-foreground))',
        emoji: '😌',
        pulseVariant: 'calm',
        message: "Things are quiet. Ready for a new challenge?",
      };
    }

    // Default to focused if none of the above
    return {
      mood: 'focused',
      color: 'hsl(var(--primary))',
      emoji: '💼',
      pulseVariant: 'moderate',
      message: "Let's make today productive!",
    };
  }, [tasks, projects, notifications]);
};

export default useMood;

