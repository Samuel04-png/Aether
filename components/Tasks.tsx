import React, { useMemo, useState } from 'react';
import { SparklesIcon, PlusIcon } from './shared/Icons';
import { Task, TaskStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, transitions } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Column = { id: TaskStatus; title: string; tasks: Task[] };

const TaskCard: React.FC<{ task: Task; onDragStart: (taskId: string) => void }> = ({ task, onDragStart }) => (
  <motion.div
    draggable
    onDragStart={() => onDragStart(task.id)}
    className="p-3 bg-card border border-border rounded-md shadow-sm mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    whileHover={{ scale: 1.01 }}
    whileDrag={{ scale: 0.98, opacity: 0.8 }}
  >
    <h4 className="font-semibold text-foreground">{task.title}</h4>
    {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
    {task.dueDate && (
      <Badge variant="outline" className="mt-2 text-xs">
        Due: {task.dueDate}
      </Badge>
    )}
  </motion.div>
);

const Tasks: React.FC = () => {
    const { user } = useAuth();
    const { tasks, tasksByStatus, loading, addTask, updateTaskStatus, assignTask } = useTasks(user?.uid);
    const { members } = useTeamMembers(user?.uid);
    const { toast } = useToast();
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualTitle, setManualTitle] = useState('');
    const [manualDescription, setManualDescription] = useState('');
    const [manualDueDate, setManualDueDate] = useState('');

    const columns: Omit<Column, 'tasks'>[] = [
        { id: 'todo', title: 'To Do' },
        { id: 'inprogress', title: 'In Progress' },
        { id: 'done', title: 'Done' },
    ];

    const handleDragStart = (taskId: string) => {
        setDraggedTaskId(taskId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
        e.preventDefault();
        if (draggedTaskId) {
            updateTaskStatus(draggedTaskId, status);
            setDraggedTaskId(null);
        }
    };

    const columnTasks = useMemo(() => tasksByStatus, [tasksByStatus]);

    const handleAssignTask = async (taskId: string, memberId: string | null) => {
        const member = memberId ? members.find((m) => m.id === memberId) || null : null;
        assignTask(taskId, member).then(() => {
            toast({
                title: 'Task Assigned',
                description: member ? `Task assigned to ${member.name}` : 'Task unassigned',
            });
        }).catch((error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Failed to assign task',
            });
        });
    };

    const handleCreateTask = async () => {
        if (!aiPrompt.trim()) return;
        
        const savedPrompt = aiPrompt;
        setIsCreating(true);
        
        try {
            await addTask({
                title: savedPrompt.slice(0, 60),
                description: savedPrompt,
                status: 'todo',
            });
            
            // Clear prompt only after successful creation
            setAiPrompt('');
            toast({
                title: 'Task Created',
                description: 'Your task has been created successfully.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Unable to create task. Please try again.',
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleManualCreate = async () => {
        if (!manualTitle.trim()) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Task title is required.',
            });
            return;
        }
        
        const savedTitle = manualTitle;
        const savedDescription = manualDescription || manualTitle;
        const savedDueDate = manualDueDate || undefined;
        
        // Optimistically close modal and reset form
        setIsManualModalOpen(false);
        setManualTitle('');
        setManualDescription('');
        setManualDueDate('');
        setIsCreating(true);
        
        addTask({
            title: savedTitle,
            description: savedDescription,
            status: 'todo',
            dueDate: savedDueDate,
        }).then(() => {
            toast({
                title: 'Task Created',
                description: 'Your task has been created successfully.',
            });
        }).catch((error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Unable to create task.',
            });
        }).finally(() => {
            setIsCreating(false);
        });
    };

  // Calculate progress statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const todoPercent = totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0;

  return (
    <>
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g., Review Q4 budget report"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Additional details about this task..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date (optional)</Label>
              <Input
                id="task-due-date"
                type="date"
                value={manualDueDate}
                onChange={(e) => setManualDueDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        exit={fadeInUp.exit}
        transition={transitions.quick}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transitions.quick}
              className="text-3xl font-bold text-foreground"
            >
              Tasks
            </motion.h1>
            <p className="text-muted-foreground mt-1">Organize and track your team's work.</p>
          </div>
          <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusIcon className="h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              <CardTitle>Create Task with AI</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="e.g., 'Email the team about the all-hands meeting tomorrow at 10am'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isCreating && aiPrompt.trim()) {
                    handleCreateTask();
                  }
                }}
              />
              <Button onClick={handleCreateTask} disabled={isCreating || !aiPrompt.trim()}>
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {totalTasks > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Overall Progress</CardTitle>
                <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-brand to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{completedTasks} of {totalTasks} tasks completed</span>
                  <span>{totalTasks - completedTasks} remaining</span>
                </div>
              </div>

              {/* Breakdown by Status */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                {/* To Do */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">To Do</span>
                    <span className="text-sm font-bold text-foreground">{todoPercent}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${todoPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{todoTasks} tasks</p>
                </div>

                {/* In Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-400">In Progress</span>
                    <span className="text-sm font-bold text-yellow-300">{inProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div 
                      className="h-full bg-yellow-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${inProgressPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{inProgressTasks} tasks</p>
                </div>

                {/* Done */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-400">Done</span>
                    <span className="text-sm font-bold text-green-300">{overallProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div 
                      className="h-full bg-green-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{completedTasks} tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full"
        >
          {columns.map((column, index) => {
            const tasksForColumn = columnTasks[column.id];
            return (
              <motion.div
                key={column.id}
                variants={staggerItem}
                className="bg-card border border-border rounded-lg p-4 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground text-lg tracking-wider">{column.title}</h3>
                  <Badge variant="secondary">{tasksForColumn.length}</Badge>
                </div>
                <div className="flex-1 space-y-3">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading tasks...</p>
                  ) : tasksForColumn.length > 0 ? tasksForColumn.map(task => (
                    <div key={task.id}>
                        <TaskCard task={task} onDragStart={handleDragStart} />
                        <div className="flex items-center gap-2 mt-2">
                            <Select
                              value={task.assignee?.id ?? 'unassigned'}
                              onValueChange={(value) => handleAssignTask(task.id, value === 'unassigned' ? null : value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Assign..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {members.map(member => (
                                    <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No tasks here yet.</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </>
  );
};

export default Tasks;