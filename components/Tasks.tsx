import React, { useMemo, useState } from 'react';
import { SparklesIcon, PlusIcon, TrashIcon } from './shared/Icons';
import { Task, TaskStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, transitions } from '@/lib/motion';
import { cn } from '@/lib/utils';
import TaskStatusDialog from './TaskStatusDialog';
import { PageContainer, PageHeader, PageSection } from './layout/Page';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { validateAndSuggestDate } from '@/lib/dateValidation';
import { useProjects } from '../hooks/useProjects';
import { useAchievements } from './easter-eggs/Achievements';
import { celebrateTaskCompletion } from './easter-eggs/CelebrationEffects';

type Column = { id: TaskStatus; title: string; tasks: Task[] };

const TaskCard: React.FC<{ 
  task: Task; 
  onDragStart: (taskId: string) => void; 
  onDelete: (taskId: string) => void;
  onClick: (task: Task) => void;
}> = ({ task, onDragStart, onDelete, onClick }) => (
  <motion.div
    draggable
    onDragStart={() => onDragStart(task.id)}
    onClick={() => onClick(task)}
    className="p-2.5 sm:p-3 bg-card border border-border rounded-md shadow-sm mb-2 sm:mb-3 cursor-pointer hover:shadow-md transition-shadow break-words"
    whileHover={{ scale: 1.01 }}
    whileDrag={{ scale: 0.98, opacity: 0.8 }}
  >
    <div className="flex items-start justify-between gap-2">
      <h4 className="font-semibold text-sm sm:text-base text-foreground break-words">{task.title}</h4>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(task.id);
        }}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
    {task.description && <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{task.description}</p>}
    {task.dueDate && (
      <Badge variant="outline" className="mt-2 text-xs">
        Due: {task.dueDate}
      </Badge>
    )}
  </motion.div>
);

const Tasks: React.FC = () => {
    const { user } = useAuth();
    const { tasks, tasksByStatus, loading, addTask, updateTaskStatus, assignTask, deleteTask } = useTasks(user?.uid);
    const { members } = useTeamMembers(user?.uid);
    const { toast } = useToast();
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualTitle, setManualTitle] = useState('');
    const [manualDescription, setManualDescription] = useState('');
    const [manualDueDate, setManualDueDate] = useState('');
    const [manualProjectId, setManualProjectId] = useState<string | undefined>();
    const [taskDateValidationError, setTaskDateValidationError] = useState<string | undefined>();
    const { projects } = useProjects(user?.uid);
    const { unlockAchievement } = useAchievements(user?.uid);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

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

    const handleDeleteTask = async (taskId: string) => {
        const taskToDelete = tasks.find((task) => task.id === taskId);
        try {
            await deleteTask(taskId);
            toast({
                title: 'Task Deleted',
                description: taskToDelete ? `Task "${taskToDelete.title}" has been deleted.` : 'Task deleted.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Failed to delete task.',
            });
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsStatusDialogOpen(true);
    };

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
            toast({
                title: 'Status Updated',
                description: `Task status changed to ${newStatus === 'todo' ? 'To Do' : newStatus === 'inprogress' ? 'In Progress' : 'Done'}`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Failed to update task status.',
            });
        }
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
        
        // Validate task date against project deadline if project is selected
        const selectedProject = manualProjectId ? projects.find(p => p.id === manualProjectId) : null;
        if (manualDueDate && selectedProject?.deadline) {
            const validation = validateAndSuggestDate(manualDueDate, {
                context: 'task',
                projectDeadline: selectedProject.deadline,
                allowPast: false,
            });
            
            if (!validation.isValid) {
                setTaskDateValidationError(validation.reason);
                if (validation.suggestedDate) {
                    setManualDueDate(validation.suggestedDate);
                    toast({
                        title: 'Date Adjusted',
                        description: validation.explanation || validation.reason,
                    });
                    return;
                }
                toast({
                    variant: 'destructive',
                    title: 'Invalid Task Date',
                    description: validation.reason,
                });
                return;
            }
        } else if (manualDueDate) {
            // Validate even without project deadline
            const validation = validateAndSuggestDate(manualDueDate, {
                context: 'task',
                allowPast: false,
            });
            
            if (!validation.isValid) {
                setTaskDateValidationError(validation.reason);
                if (validation.suggestedDate) {
                    setManualDueDate(validation.suggestedDate);
                    toast({
                        title: 'Date Adjusted',
                        description: validation.explanation || validation.reason,
                    });
                    return;
                }
                toast({
                    variant: 'destructive',
                    title: 'Invalid Task Date',
                    description: validation.reason,
                });
                return;
            }
        }
        
        const savedTitle = manualTitle;
        const savedDescription = manualDescription || manualTitle;
        const savedDueDate = manualDueDate ? manualDueDate.split('T')[0] : undefined;
        
        // Optimistically close modal and reset form
        setIsManualModalOpen(false);
        setManualTitle('');
        setManualDescription('');
        setManualDueDate('');
        setManualProjectId(undefined);
        setTaskDateValidationError(undefined);
        setIsCreating(true);
        
        addTask({
            title: savedTitle,
            description: savedDescription,
            status: 'todo',
            dueDate: savedDueDate,
            projectId: manualProjectId,
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

  const taskStats = [
    {
      label: 'Completion rate',
      value: `${overallProgress}%`,
      trend: overallProgress >= 70 ? 'up' : overallProgress <= 30 ? 'down' : 'steady',
      helper: `${completedTasks} of ${totalTasks} tasks done`,
    },
    {
      label: 'In progress',
      value: `${inProgressTasks}`,
      trend: inProgressTasks > 0 ? 'steady' : 'up',
      helper: `${todoTasks} queued`,
    },
    {
      label: 'Team coverage',
      value: `${members.length}`,
      trend: members.length > 0 ? 'up' : 'steady',
      helper: 'Collaborators assignable',
    },
  ] as const;

  return (
    <>
      <TaskStatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        task={selectedTask}
        onStatusChange={handleStatusChange}
      />
      
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="task-project">Project (optional)</Label>
              <Select value={manualProjectId || ''} onValueChange={(value) => setManualProjectId(value || undefined)}>
                <SelectTrigger id="task-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <DateTimePicker
                value={manualDueDate}
                onChange={(value) => {
                  setManualDueDate(value);
                  const selectedProject = manualProjectId ? projects.find(p => p.id === manualProjectId) : null;
                  if (value && selectedProject?.deadline) {
                    const validation = validateAndSuggestDate(value, {
                      context: 'task',
                      projectDeadline: selectedProject.deadline,
                      allowPast: false,
                    });
                    setTaskDateValidationError(validation.isValid ? undefined : validation.reason);
                    if (!validation.isValid && validation.suggestedDate) {
                      setTimeout(() => {
                        setManualDueDate(validation.suggestedDate!);
                      }, 100);
                    }
                  } else if (value) {
                    const validation = validateAndSuggestDate(value, {
                      context: 'task',
                      allowPast: false,
                    });
                    setTaskDateValidationError(validation.isValid ? undefined : validation.reason);
                  }
                }}
                label="Due Date (optional)"
                placeholder="Select task due date"
                showTime={false}
                maxDate={manualProjectId ? projects.find(p => p.id === manualProjectId)?.deadline : undefined}
                onValidationChange={(isValid, reason) => {
                  setTaskDateValidationError(isValid ? undefined : reason);
                }}
              />
              {taskDateValidationError && (
                <p className="text-xs text-destructive mt-1">{taskDateValidationError}</p>
              )}
              {manualProjectId && projects.find(p => p.id === manualProjectId)?.deadline && (
                <p className="text-xs text-muted-foreground mt-1">
                  Project deadline: {new Date(projects.find(p => p.id === manualProjectId)!.deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
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
      
      <PageContainer className="space-y-6 sm:space-y-8 md:space-y-12 pb-24">
        <PageHeader
          eyebrow="Operations"
          title="Tasks"
          subtitle="Organise and track your team's work across stages."
          actions={
            <Button className="gap-2" onClick={() => setIsManualModalOpen(true)}>
              <PlusIcon className="h-4 w-4" />
              New task
            </Button>
          }
          stats={taskStats}
        />

        <PageSection
          title="Intelligent task creation"
          description="Generate tasks with AI or capture quick notes manually."
        >
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <SparklesIcon className="h-5 w-5 text-primary" />
                <CardTitle>Create task with AI</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        </PageSection>

        {totalTasks > 0 && (
          <PageSection
            title="Team velocity"
            description="Monitor throughput across each status lane."
          >
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Overall progress</CardTitle>
                  <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-cyan-500"
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

                <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">To do</span>
                      <span className="text-sm font-bold text-foreground">{todoPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${todoPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{todoTasks} tasks</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-400">In progress</span>
                      <span className="text-sm font-bold text-yellow-300">{inProgressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-yellow-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${inProgressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{inProgressTasks} tasks</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-400">Done</span>
                      <span className="text-sm font-bold text-green-300">{overallProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-green-400"
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
          </PageSection>
        )}

        <PageSection
          title="Workspace board"
          description="Drag to reprioritise tasks or click a card to update status."
          surface="minimal"
        >
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 overflow-x-auto"
          >
            {columns.map((column) => {
              const tasksForColumn = columnTasks[column.id];
              return (
                <motion.div
                  key={column.id}
                  variants={staggerItem}
                  className="flex flex-col rounded-3xl border border-border/50 bg-card/85 p-4 backdrop-blur-sm"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold tracking-wider text-foreground">{column.title}</h3>
                    <Badge variant="secondary">{tasksForColumn.length}</Badge>
                  </div>
                  <div className="flex-1 space-y-3">
                    {loading ? (
                      <p className="text-center text-sm text-muted-foreground">Loading tasks...</p>
                    ) : tasksForColumn.length > 0 ? (
                      tasksForColumn.map((task) => (
                        <div key={task.id}>
                          <TaskCard
                            task={task}
                            onDragStart={handleDragStart}
                            onDelete={handleDeleteTask}
                            onClick={handleTaskClick}
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <Select
                              value={task.assignee?.id ?? 'unassigned'}
                              onValueChange={(value) => handleAssignTask(task.id, value === 'unassigned' ? null : value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Assign..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {members.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-sm text-muted-foreground">No tasks here yet.</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </PageSection>
      </PageContainer>
    </>
  );
};

export default Tasks;