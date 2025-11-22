import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Star, Zap, Target, Rocket, CheckCircle2, Flame, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// @ts-ignore - canvas-confetti doesn't have types
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  unlockedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    title: 'Getting Started',
    description: 'Created your first task',
    icon: CheckCircle2,
    color: 'text-blue-500',
  },
  {
    id: 'task_master',
    title: 'Task Master',
    description: 'Completed 10 tasks',
    icon: Target,
    color: 'text-emerald-500',
  },
  {
    id: 'project_creator',
    title: 'Project Creator',
    description: 'Created your first project',
    icon: Rocket,
    color: 'text-purple-500',
  },
  {
    id: 'team_player',
    title: 'Team Player',
    description: 'Invited 3 team members',
    icon: Star,
    color: 'text-amber-500',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Completed 5 tasks in one day',
    icon: Zap,
    color: 'text-orange-500',
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Completed 50 tasks with 100% completion rate',
    icon: Trophy,
    color: 'text-yellow-500',
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Logged in before 8 AM for 7 days',
    icon: Flame,
    color: 'text-red-500',
  },
  {
    id: 'power_user',
    title: 'Power User',
    description: 'Used keyboard shortcuts 50 times',
    icon: Crown,
    color: 'text-indigo-500',
  },
];

export const useAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const loadAchievements = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId, 'achievements', 'unlocked'));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUnlockedAchievements(new Set(data.achievementIds || []));
        }
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };

    loadAchievements();
  }, [userId]);

  const unlockAchievement = useCallback(async (achievementId: string) => {
    if (!userId || unlockedAchievements.has(achievementId)) return;

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    try {
      const newUnlocked = new Set(unlockedAchievements);
      newUnlocked.add(achievementId);
      setUnlockedAchievements(newUnlocked);

      await setDoc(
        doc(db, 'users', userId, 'achievements', 'unlocked'),
        { achievementIds: Array.from(newUnlocked), updatedAt: new Date().toISOString() },
        { merge: true }
      );

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1A73E8', '#7CE03A', '#FFB703', '#FF7A00'],
      });

      toast({
        title: `🏆 Achievement Unlocked: ${achievement.title}`,
        description: achievement.description,
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
    }
  }, [userId, unlockedAchievements, toast]);

  return { achievements: ACHIEVEMENTS, unlockedAchievements, unlockAchievement };
};

export const AchievementsDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unlockedAchievements: Set<string>;
}> = ({ open, onOpenChange, unlockedAchievements }) => {
  const unlocked = ACHIEVEMENTS.filter(a => unlockedAchievements.has(a.id));
  const locked = ACHIEVEMENTS.filter(a => !unlockedAchievements.has(a.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements
          </DialogTitle>
          <DialogDescription>
            Track your progress and unlock new achievements as you use Aether
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {unlocked.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Unlocked ({unlocked.length}/{ACHIEVEMENTS.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlocked.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-primary/10 ${achievement.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                            </div>
                            <Badge variant="default" className="bg-primary">Unlocked</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Locked ({locked.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {locked.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <Card key={achievement.id} className="opacity-60 border-border/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-muted-foreground">???</h4>
                            <p className="text-xs text-muted-foreground mt-1">Keep exploring to unlock</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

