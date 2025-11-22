import React, { useMemo, useState } from 'react';
import { SparklesIcon, ChevronLeftIcon, PlusIcon, FileIcon, UsersIcon, MessageIcon, TasksIcon, UploadIcon, EnvelopeIcon, TrashIcon } from './shared/Icons';
import { SearchInput } from '@/components/ui/search-input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, transitions } from '@/lib/motion';
import { Project, Task, TaskStatus, TeamMember, ProjectRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useProjectInvites } from '../hooks/useProjectInvites';
import { useUserSearch } from '../hooks/useUserSearch';
import { cn } from '@/lib/utils';
import TaskStatusDialog from './TaskStatusDialog';
import { PageContainer, PageHeader, PageSection } from './layout/Page';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { validateAndSuggestDate, formatValidationMessage } from '@/lib/dateValidation';
import { useAchievements } from './easter-eggs/Achievements';
import { celebrateProjectCompletion } from './easter-eggs/CelebrationEffects';

interface ProjectTaskColumnProps {
    status: TaskStatus;
    tasks: Task[];
    team: TeamMember[];
    onDragStart: (taskId: string) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
    onAssign: (taskId: string, memberId: string | null) => void;
    onDeleteTask: (taskId: string) => void;
    onTaskClick: (task: Task) => void;
    canManage?: boolean;
}

const ProjectTaskColumn: React.FC<ProjectTaskColumnProps> = ({
    status,
    tasks,
    team,
    onDragStart,
    onDragOver,
    onDrop,
    onAssign,
    onDeleteTask,
    onTaskClick,
    canManage = true,
}) => {
    const titleMap: Record<TaskStatus, string> = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

    return (
        <div
            className="bg-card/50 border border-border rounded-lg p-4 flex-1"
            onDragOver={canManage ? onDragOver : undefined}
            onDrop={canManage ? (event) => onDrop(event, status) : undefined}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-lg tracking-wider">
                    {titleMap[status]}
                </h3>
                <Badge variant="secondary">{tasks.length}</Badge>
            </div>
            <div className="space-y-3">
                {tasks.map((task) => (
                    <motion.div
                        key={task.id}
                        draggable={canManage}
                        onDragStart={() => {
                            if (canManage) {
                                onDragStart(task.id);
                            }
                        }}
                        onClick={() => onTaskClick(task)}
                        className={cn(
                            "p-3 bg-card border border-border rounded-md shadow-sm transition-shadow cursor-pointer hover:shadow-md",
                            canManage && "active:cursor-grabbing"
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileDrag={canManage ? { scale: 0.98, opacity: 0.8 } : undefined}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-foreground">{task.title}</p>
                            {canManage && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onDeleteTask(task.id);
                                    }}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {task.assignee ? (
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                                        <AvatarFallback className="text-xs">
                                            {task.assignee.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs bg-muted">?</AvatarFallback>
                                    </Avatar>
                                )}
                                {canManage ? (
                                    <Select
                                        value={task.assignee?.id ?? 'unassigned'}
                                        onValueChange={(value) => onAssign(task.id, value === 'unassigned' ? null : value)}
                                    >
                                        <SelectTrigger className="h-auto text-xs border-none bg-transparent p-0 w-auto min-w-[80px]">
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {team.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        {task.assignee ? `Assigned to ${task.assignee.name}` : 'Unassigned'}
                                    </span>
                                )}
                            </div>
                            {task.dueDate && (
                                <Badge variant="outline" className="text-xs">
                                    {task.dueDate}
                                </Badge>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

interface ProjectDetailProps {
    project: Project;
    onBack: () => void;
    onUpdate: (projectId: string, updates: Partial<Project>) => Promise<void>;
    allMembers: TeamMember[];
    onDeleteProject: (projectId: string) => Promise<void>;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onUpdate, allMembers, onDeleteProject }) => {
    const { user } = useAuth();
    const { sendInvite } = useProjectInvites(user?.uid);
    const { toast } = useToast();
    const { searchUsers, searchResults, isSearching, clearResults } = useUserSearch();
    
    const [activeTab, setActiveTab] = useState<'tasks' | 'files' | 'chat' | 'team'>('tasks');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [taskDateValidationError, setTaskDateValidationError] = useState<string | undefined>();
    
    // Invite modal state
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteSearchTerm, setInviteSearchTerm] = useState('');
    const [selectedUserEmail, setSelectedUserEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<ProjectRole>('member');
    const [inviteMessage, setInviteMessage] = useState('');
    const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [editedDeadline, setEditedDeadline] = useState('');
    const [deadlineEditError, setDeadlineEditError] = useState<string | undefined>();

    // Calculate dynamic progress based on task completion
    const calculatedProgress = useMemo(() => {
        const totalTasks = project.tasks.length;
        if (totalTasks === 0) return 0;
        const completedTasks = project.tasks.filter(task => task.status === 'done').length;
        return Math.round((completedTasks / totalTasks) * 100);
    }, [project.tasks]);

    const availableMembers = useMemo(
        () => allMembers.filter((member) => {
            // Only show accepted members that aren't already in the project
            const isAccepted = !member.status || member.status === 'accepted';
            const isNotInProject = !project.team.some((existing) => existing.id === member.id);
            return isAccepted && isNotInProject;
        }),
        [allMembers, project.team]
    );

    const canManageProject = user?.uid === (project.ownerId ?? user?.uid);
    const canManageTasks = canManageProject || (Array.isArray(project.team) && project.team.some((member) => member.id === user?.uid));

    const totalProjectTasks = project.tasks.length;
    const activeProjectTasks = project.tasks.filter((task) => task.status !== 'done').length;
    const completedProjectTasks = project.tasks.filter((task) => task.status === 'done').length;

    const projectStats = [
        {
            label: 'Progress',
            value: `${calculatedProgress}%`,
            trend: calculatedProgress >= 70 ? 'up' : calculatedProgress <= 20 ? 'down' : 'steady',
            helper: project.status ?? 'Status not set',
        },
        {
            label: 'Active tasks',
            value: `${activeProjectTasks}`,
            trend: activeProjectTasks === 0 ? 'steady' : 'up',
            helper: `${completedProjectTasks} completed`,
        },
        {
            label: 'Team members',
            value: `${project.team.length}`,
            trend: project.team.length > 3 ? 'up' : 'steady',
            helper: project.team.length > 0 ? 'Collaborators onboard' : 'Invite your team',
        },
    ] as const;

    const statusBadgeVariant = project.status === 'On Track' ? 'default' : project.status === 'At Risk' ? 'destructive' : 'secondary';

    const handleTaskDrop = (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
        if (!canManageTasks) return;
        event.preventDefault();
        if (draggedTaskId) {
            const updatedTasks = project.tasks.map((task) =>
                task.id === draggedTaskId ? { ...task, status } : task
            );
            
            // Calculate new progress
            const totalTasks = updatedTasks.length;
            const completedTasks = updatedTasks.filter(task => task.status === 'done').length;
            const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            onUpdate(project.id, { tasks: updatedTasks, progress: newProgress });
            setDraggedTaskId(null);
        }
    };

    const handleAssignTask = (taskId: string, memberId: string | null) => {
        if (!canManageTasks) return;
        const member = memberId ? project.team.find((teamMember) => teamMember.id === memberId) ?? null : null;
        const updatedTasks = project.tasks.map((task) => {
            if (task.id === taskId) {
                const updated: Task = { ...task };
                if (member) {
                    updated.assignee = member;
                    updated.assignedTo = member.id;
                } else {
                    delete updated.assignee;
                    delete updated.assignedTo;
                }
                return updated;
            }
            return task;
        });
        onUpdate(project.id, { tasks: updatedTasks }).then(() => {
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
        if (!canManageTasks) return;
        const currentTasks = Array.isArray(project.tasks) ? project.tasks : [];
        const taskToDelete = currentTasks.find((task) => task.id === taskId);
        const updatedTasks = currentTasks.filter((task) => task.id !== taskId);

        try {
            await onUpdate(project.id, { tasks: updatedTasks });
            toast({
                title: 'Task Deleted',
                description: taskToDelete ? `Task "${taskToDelete.title}" has been removed.` : 'Task removed from project.',
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
        if (!canManageTasks) return;
        const updatedTasks = project.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
        );
        
        // Calculate new progress
        const totalTasks = updatedTasks.length;
        const completedTasks = updatedTasks.filter(task => task.status === 'done').length;
        const inProgressTasks = updatedTasks.filter(task => task.status === 'inprogress').length;
        const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Calculate project status based on task completion
        let projectStatus: Project['status'] = 'Not Started';
        if (completedTasks === totalTasks && totalTasks > 0) {
            projectStatus = 'On Track'; // All tasks completed
        } else if (inProgressTasks > 0 || completedTasks > 0) {
            projectStatus = 'On Track'; // Some tasks in progress or completed
        } else if (totalTasks > 0) {
            projectStatus = 'Not Started'; // No tasks started yet
        }
        
        try {
            await onUpdate(project.id, { tasks: updatedTasks, progress: newProgress, status: projectStatus });
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

    const handleRemoveMember = (memberId: string) => {
        if (!canManageProject) return;
        const member = project.team.find(m => m.id === memberId);
        const updatedTeam = project.team.filter((member) => member.id !== memberId);
        const updatedTasks = project.tasks.map((task) => {
            if (task.assignee?.id === memberId) {
                const updated: Task = { ...task };
                delete updated.assignee;
                delete updated.assignedTo;
                return updated;
            }
            return task;
        });
        onUpdate(project.id, { team: updatedTeam, tasks: updatedTasks }).then(() => {
            toast({
                title: 'Member Removed',
                description: member ? `${member.name} has been removed from the project` : 'Member removed',
            });
        }).catch((error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Failed to remove member',
            });
        });
    };

    const handleConfirmDeleteProject = async () => {
        if (!canManageProject) return;
        if (!project?.id) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Project not found. Please refresh and try again.',
            });
            return;
        }

        setIsDeletingProject(true);
        try {
            await onDeleteProject(project.id);
            toast({
                title: 'Project Deleted',
                description: `"${project.name}" has been deleted successfully.`,
            });
            setIsDeleteProjectDialogOpen(false);
            onBack();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Failed to delete project.',
            });
        } finally {
            setIsDeletingProject(false);
        }
    };

    const handleAddTask = async () => {
        if (!canManageTasks) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Permissions',
                description: 'Only project managers can add tasks.',
            });
            return;
        }
        if (!newTaskTitle.trim()) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Task title is required.',
            });
            return;
        }

        if (!project?.id) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Project not found. Please refresh and try again.',
            });
            return;
        }
        
        // Validate task date against project deadline
        if (newTaskDueDate) {
            const validation = validateAndSuggestDate(newTaskDueDate, {
                context: 'task',
                projectDeadline: project.deadline,
                allowPast: false,
            });
            
            if (!validation.isValid) {
                setTaskDateValidationError(validation.reason);
                if (validation.suggestedDate) {
                    setNewTaskDueDate(validation.suggestedDate);
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
            
            if (validation.warnings && validation.warnings.length > 0) {
                toast({
                    title: 'Date Warning',
                    description: validation.warnings.join('. '),
                    variant: 'default',
                });
            }
        }
        
        const newTask: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: newTaskTitle.trim(),
            description: (newTaskDescription || newTaskTitle).trim(),
            status: 'todo',
            ...(newTaskDueDate && { dueDate: newTaskDueDate.split('T')[0] }), // Store only date part
            ...(project.id && { projectId: project.id }),
            createdAt: new Date().toISOString(),
        };
        
        // Optimistically close modal and reset form
        setIsAddTaskModalOpen(false);
        const savedTitle = newTaskTitle;
        const savedDescription = newTaskDescription;
        const savedDueDate = newTaskDueDate;
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
        setTaskDateValidationError(undefined);
        
        // Update in background with proper error handling
        try {
            const currentTasks = Array.isArray(project.tasks) ? project.tasks : [];
            await onUpdate(project.id, { tasks: [...currentTasks, newTask] });
            toast({
                title: 'Task Added',
                description: `Task "${savedTitle}" has been added successfully.`,
            });
        } catch (error: any) {
            // Restore form on error
            setNewTaskTitle(savedTitle);
            setNewTaskDescription(savedDescription);
            setNewTaskDueDate(savedDueDate);
            setIsAddTaskModalOpen(true);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Failed to add task.',
            });
        }
    };

    const handleSendInvite = async () => {
        if (!canManageProject) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Permissions',
                description: 'Only project owners can invite new members.',
            });
            return;
        }
        if (!selectedUserEmail.trim()) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please select a user to invite.',
            });
            return;
        }

        if (!project?.id) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Project not found. Please refresh and try again.',
            });
            return;
        }

        const savedEmail = selectedUserEmail.trim();
        const savedRole = inviteRole;
        const savedMessage = inviteMessage.trim();
        
        // Optimistically close modal and reset form
        setIsInviteModalOpen(false);
        setInviteSearchTerm('');
        setSelectedUserEmail('');
        setInviteRole('member');
        setInviteMessage('');
        clearResults();

        // Send invite in background with error recovery
        try {
            await sendInvite(
                project.id,
                project.name,
                savedEmail,
                savedRole,
                savedMessage || undefined
            );
            toast({
                title: 'Invitation Sent',
                description: `Invitation sent to ${savedEmail} successfully.`,
            });
        } catch (error: any) {
            // Restore form on error
            setSelectedUserEmail(savedEmail);
            setInviteRole(savedRole);
            setInviteMessage(savedMessage);
            setIsInviteModalOpen(true);
            
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message || 'Failed to send invitation. Please try again.',
            });
        }
    };
    
    // Search users when typing in invite modal
    React.useEffect(() => {
        if (isInviteModalOpen && inviteSearchTerm.trim()) {
            const debounceTimer = setTimeout(() => {
                searchUsers(inviteSearchTerm);
            }, 300);
            return () => clearTimeout(debounceTimer);
        } else {
            clearResults();
        }
    }, [inviteSearchTerm, isInviteModalOpen, searchUsers, clearResults]);

    return (
        <>
            <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
                <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Task to Project</DialogTitle>
                        <DialogDescription>
                            Create a new task for this project.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-task-title">Task Title *</Label>
                            <Input
                                id="new-task-title"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="e.g., Design homepage mockup"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-task-description">Description</Label>
                            <Textarea
                                id="new-task-description"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                placeholder="Task details..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <DateTimePicker
                                value={newTaskDueDate}
                                onChange={(value) => {
                                    setNewTaskDueDate(value);
                                    if (value && project?.deadline) {
                                        const validation = validateAndSuggestDate(value, {
                                            context: 'task',
                                            projectDeadline: project.deadline,
                                            allowPast: false,
                                        });
                                        setTaskDateValidationError(validation.isValid ? undefined : validation.reason);
                                        if (!validation.isValid && validation.suggestedDate) {
                                            setTimeout(() => {
                                                setNewTaskDueDate(validation.suggestedDate!);
                                            }, 100);
                                        }
                                    }
                                }}
                                label="Due Date (optional)"
                                placeholder="Select task due date"
                                showTime={false}
                                maxDate={project?.deadline}
                                onValidationChange={(isValid, reason) => {
                                    setTaskDateValidationError(isValid ? undefined : reason);
                                }}
                            />
                            {taskDateValidationError && (
                                <p className="text-xs text-destructive mt-1">{taskDateValidationError}</p>
                            )}
                            {project?.deadline && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Project deadline: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddTaskModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddTask}>
                            Add Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isInviteModalOpen} onOpenChange={(open) => {
                setIsInviteModalOpen(open);
                if (!open) {
                    setInviteSearchTerm('');
                    setSelectedUserEmail('');
                    clearResults();
                }
            }}>
                <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <EnvelopeIcon className="h-5 w-5" />
                            Invite to Project
                        </DialogTitle>
                        <DialogDescription>
                            Search for users by email or name to invite them to this project.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="invite-search">Search Users</Label>
                            <SearchInput
                                id="invite-search"
                                value={inviteSearchTerm}
                                onChange={(e) => setInviteSearchTerm(e.target.value)}
                                placeholder="Type email or name to search..."
                            />
                            
                            {/* Search Results with Enhanced Previews */}
                            {inviteSearchTerm.trim() && (
                                <Card className="border-border max-h-[300px] overflow-y-auto shadow-lg">
                                    <CardContent className="p-0">
                                        {isSearching ? (
                                            <div className="p-6 text-center space-y-2">
                                                <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full mx-auto" />
                                                <p className="text-sm text-muted-foreground">Searching users...</p>
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            <div className="divide-y divide-border">
                                                {searchResults.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => {
                                                            setSelectedUserEmail(user.email);
                                                            setInviteSearchTerm(user.displayName || user.email);
                                                            clearResults();
                                                        }}
                                                        className={cn(
                                                            "w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left group",
                                                            selectedUserEmail === user.email && "bg-muted border-l-4 border-l-brand"
                                                        )}
                                                    >
                                                        <Avatar className="h-10 w-10 ring-2 ring-border group-hover:ring-brand transition-colors">
                                                            {user.photoURL ? (
                                                                <AvatarImage src={user.photoURL} alt={user.displayName || user.email} />
                                                            ) : (
                                                                <AvatarFallback className="text-sm">
                                                                    {(user.displayName || user.email)[0].toUpperCase()}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-foreground truncate">
                                                                {user.displayName || 'No name'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                        {selectedUserEmail === user.email && (
                                                            <Badge variant="default" className="text-xs">Selected</Badge>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center space-y-2">
                                                <p className="text-sm font-medium text-foreground">No users found</p>
                                                <p className="text-xs text-muted-foreground">Try searching by email or name</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                            
                            {selectedUserEmail && (
                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                            {selectedUserEmail[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-foreground">{selectedUserEmail}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 ml-auto"
                                        onClick={() => {
                                            setSelectedUserEmail('');
                                            setInviteSearchTerm('');
                                        }}
                                    >
                                        ×
                                    </Button>
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="invite-role">Role</Label>
                            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as ProjectRole)}>
                                <SelectTrigger id="invite-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">Viewer - Can view project only</SelectItem>
                                    <SelectItem value="member">Member - Can view and edit</SelectItem>
                                    <SelectItem value="admin">Admin - Can manage members and settings</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="invite-message">Message (Optional)</Label>
                            <Textarea
                                id="invite-message"
                                value={inviteMessage}
                                onChange={(e) => setInviteMessage(e.target.value)}
                                placeholder="Add a personal message to your invitation..."
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSendInvite} disabled={!selectedUserEmail}>
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <TaskStatusDialog
                open={isStatusDialogOpen}
                onOpenChange={setIsStatusDialogOpen}
                task={selectedTask}
                onStatusChange={handleStatusChange}
            />

            <Dialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
                <DialogContent className="w-[95vw] max-w-[420px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Delete Project</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the project and all of its tasks.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteProjectDialogOpen(false)}
                            disabled={isDeletingProject}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDeleteProject}
                            disabled={isDeletingProject}
                        >
                            {isDeletingProject ? 'Deleting...' : 'Delete Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        
            <PageContainer className="space-y-10 pb-24">
                <div>
                    <Button variant="ghost" onClick={onBack} className="gap-2">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to projects
                    </Button>
                </div>

                <PageHeader
                    eyebrow="Project workspace"
                    title={project.name}
                    subtitle={
                        <div className="space-y-1">
                            <p>{project.description || 'No description provided yet.'}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {isEditingDeadline && canManageProject ? (
                                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                        <DateTimePicker
                                            value={editedDeadline}
                                            onChange={(value) => {
                                                setEditedDeadline(value);
                                                const validation = validateAndSuggestDate(value, {
                                                    context: 'deadline',
                                                    allowPast: false,
                                                });
                                                setDeadlineEditError(validation.isValid ? undefined : validation.reason);
                                            }}
                                            label=""
                                            placeholder="Select deadline"
                                            showTime={false}
                                            onValidationChange={(isValid, reason) => {
                                                setDeadlineEditError(isValid ? undefined : reason);
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={async () => {
                                                if (editedDeadline && !deadlineEditError) {
                                                    await onUpdate(project.id, { deadline: editedDeadline });
                                                    setIsEditingDeadline(false);
                                                    setEditedDeadline('');
                                                    toast({
                                                        title: 'Deadline Updated',
                                                        description: 'Project deadline has been updated.',
                                                    });
                                                }
                                            }}
                                            disabled={!!deadlineEditError}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditingDeadline(false);
                                                setEditedDeadline('');
                                                setDeadlineEditError(undefined);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        {project.deadline ? (
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <span>📅 Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                {new Date(project.deadline) < new Date() && (
                                                    <Badge variant="destructive" className="text-xs">Overdue</Badge>
                                                )}
                                                {canManageProject && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={() => {
                                                            setEditedDeadline(project.deadline || '');
                                                            setIsEditingDeadline(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                            </p>
                                        ) : (
                                            canManageProject && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                    onClick={() => {
                                                        setEditedDeadline('');
                                                        setIsEditingDeadline(true);
                                                    }}
                                                >
                                                    + Add Deadline
                                                </Button>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    }
                    actions={
                        <div className="flex flex-wrap items-center gap-3">
                            {canManageTasks && (
                                <Button className="gap-2" onClick={() => setIsAddTaskModalOpen(true)}>
                                    <PlusIcon className="h-4 w-4" />
                                    Add task
                                </Button>
                            )}
                            {canManageProject && (
                                <Button variant="outline" className="gap-2" onClick={() => setIsInviteModalOpen(true)}>
                                    <EnvelopeIcon className="h-4 w-4" />
                                    Invite member
                                </Button>
                            )}
                        </div>
                    }
                    stats={projectStats}
                />

                <PageSection surface="minimal" padded={false}>
                    <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-2">
                                    <CardTitle className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Delivery progress</CardTitle>
                                    <CardDescription>Visualise completion against your planned workload.</CardDescription>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant={statusBadgeVariant}>{project.status ?? 'Status pending'}</Badge>
                                    {canManageProject && (
                                        <Button variant="destructive" className="gap-2" onClick={() => setIsDeleteProjectDialogOpen(true)}>
                                            <TrashIcon className="h-4 w-4" />
                                            Delete project
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground">
                                    <span>{calculatedProgress}% complete</span>
                                    <span>{totalProjectTasks} tasks • {completedProjectTasks} done</span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                                    <motion.div
                                        className="h-full rounded-full bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${calculatedProgress}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </PageSection>

                <Card>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                        <CardHeader>
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-0">
                                <TabsTrigger value="tasks" className="gap-2">
                                    <TasksIcon className="h-4 w-4" />
                                    Tasks
                                </TabsTrigger>
                                <TabsTrigger value="files" className="gap-2">
                                    <FileIcon className="h-4 w-4" />
                                    Files
                                </TabsTrigger>
                                <TabsTrigger value="chat" className="gap-2">
                                    <MessageIcon className="h-4 w-4" />
                                    Chat
                                </TabsTrigger>
                                <TabsTrigger value="team" className="gap-2">
                                    <UsersIcon className="h-4 w-4" />
                                    Team
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        <CardContent>
                            
                            <TabsContent value="tasks" className="mt-6">
                                <div className="space-y-4">
                                    {canManageTasks && (
                                        <div className="flex justify-end">
                                            <Button className="gap-2" onClick={() => setIsAddTaskModalOpen(true)}>
                                                <PlusIcon className="h-4 w-4" />
                                                Add Task
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex gap-6">
                                        <ProjectTaskColumn
                                            status="todo"
                                            tasks={project.tasks.filter((task) => task.status === 'todo')}
                                            team={project.team}
                                            onDragStart={(taskId) => setDraggedTaskId(taskId)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={handleTaskDrop}
                                            onAssign={handleAssignTask}
                                            onDeleteTask={handleDeleteTask}
                                            onTaskClick={handleTaskClick}
                                            canManage={canManageTasks}
                                        />
                                        <ProjectTaskColumn
                                            status="inprogress"
                                            tasks={project.tasks.filter((task) => task.status === 'inprogress')}
                                            team={project.team}
                                            onDragStart={(taskId) => setDraggedTaskId(taskId)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={handleTaskDrop}
                                            onAssign={handleAssignTask}
                                            onDeleteTask={handleDeleteTask}
                                            onTaskClick={handleTaskClick}
                                            canManage={canManageTasks}
                                        />
                                        <ProjectTaskColumn
                                            status="done"
                                            tasks={project.tasks.filter((task) => task.status === 'done')}
                                            team={project.team}
                                            onDragStart={(taskId) => setDraggedTaskId(taskId)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={handleTaskDrop}
                                            onAssign={handleAssignTask}
                                            onDeleteTask={handleDeleteTask}
                                            onTaskClick={handleTaskClick}
                                            canManage={canManageTasks}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="team" className="mt-0">
                                <div className="space-y-4">
                                    {canManageProject && (
                                        <div className="flex justify-end gap-2">
                                            {availableMembers.length > 0 && (
                                                <Button
                                                    variant="outline"
                                                    className="gap-2"
                                                    onClick={() => {
                                                        const memberToAdd = availableMembers[0];
                                                        const updatedTeam = [...project.team, memberToAdd];
                                                        onUpdate(project.id, { team: updatedTeam }).then(() => {
                                                            toast({
                                                                title: 'Member Added',
                                                                description: `${memberToAdd.name} has been added to the project.`,
                                                            });
                                                        });
                                                    }}
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                    Add from team ({availableMembers.length})
                                                </Button>
                                            )}
                                            {canManageProject && (
                                                <Button className="gap-2" onClick={() => setIsInviteModalOpen(true)}>
                                                    <EnvelopeIcon className="h-4 w-4" />
                                                    Invite new member
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Available Team Members to Add */}
                                    {canManageProject && availableMembers.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Available Team Members</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                                    {availableMembers.map((member) => (
                                                        <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={member.avatar} alt={member.name} />
                                                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{member.role}</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const updatedTeam = [...project.team, member];
                                                                    onUpdate(project.id, { team: updatedTeam }).then(() => {
                                                                        toast({
                                                                            title: 'Member Added',
                                                                            description: `${member.name} has been added to the project.`,
                                                                        });
                                                                    });
                                                                }}
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    
                                    {/* Current Project Members */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold">Project Members</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                {project.team.length > 0 ? (
                                                    project.team.map((member) => (
                                                        <Card key={member.id}>
                                                            <CardContent className="p-4 flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage src={member.avatar} alt={member.name} />
                                                                        <AvatarFallback>
                                                                            {member.name[0]}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="font-semibold text-foreground">{member.name}</p>
                                                                        <p className="text-sm text-muted-foreground">{member.role}</p>
                                                                    </div>
                                                                </div>
                                                                {canManageProject && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveMember(member.id)}
                                                                        className="text-destructive hover:text-destructive"
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    ))
                                                ) : (
                                                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                                                        No team members yet. Add members from your team or invite new ones.
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="files" className="mt-0">
                                <div className="space-y-4">
                                    <Button className="gap-2">
                                        <UploadIcon className="h-4 w-4" />
                                        Upload File
                                    </Button>
                                    <div className="space-y-2">
                                        {project.files.length > 0 ? (
                                            project.files.map((file) => (
                                                <Card key={file.id}>
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium text-foreground">{file.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {file.size} — {file.type}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm">
                                                            Download
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No files uploaded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="chat" className="mt-0">
                                <div className="flex flex-col h-[50vh]">
                                    <div className="flex-1 space-y-4 overflow-y-auto p-2">
                                        {project.chat.length > 0 ? (
                                            project.chat.map((message) => (
                                                <div key={message.id} className="flex items-start gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                                                        <AvatarFallback>
                                                            {message.sender.name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-semibold text-foreground text-sm">
                                                                {message.sender.name}
                                                            </p>
                                                            <span className="text-xs text-muted-foreground">
                                                                {message.timestamp}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                                                            {message.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No messages yet. Start the conversation!
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="flex-1"
                                        />
                                        <Button>Send</Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </PageContainer>
        </>
    );
};

const Projects: React.FC = () => {
    const { user } = useAuth();
    const { projects, loading, createProject, updateProject, deleteProject } = useProjects(user?.uid);
    const { acceptedMembers } = useTeamMembers(user?.uid);
    const { unlockAchievement } = useAchievements(user?.uid);
    const { toast } = useToast();

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [newProjectDeadline, setNewProjectDeadline] = useState('');
    const [deadlineValidationError, setDeadlineValidationError] = useState<string | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [projectPendingDelete, setProjectPendingDelete] = useState<Project | null>(null);
    const [isListDeletingProject, setIsListDeletingProject] = useState(false);

    const selectedProject = useMemo(
        () => projects.find((project) => project.id === selectedProjectId) ?? null,
        [projects, selectedProjectId]
    );

    const filteredProjects = useMemo(
        () =>
            projects.filter((project) =>
                project.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [projects, searchTerm]
    );

    const totalProjects = projects.length;
    const activeProjects = projects.filter((project) => project.status !== 'Completed').length;
    const progressSnapshots = projects.map((project) => {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter((task) => task.status === 'done').length;
        if (totalTasks === 0) {
            return typeof project.progress === 'number' ? project.progress : 0;
        }
        return Math.round((completedTasks / totalTasks) * 100);
    });
    const averageProgress = progressSnapshots.length > 0 ? Math.round(progressSnapshots.reduce((sum, value) => sum + value, 0) / progressSnapshots.length) : 0;
    const collaborators = Array.from(new Set(projects.flatMap((project) => project.team.map((member) => member.id)))).length;

    const projectsStats = [
        {
            label: 'Active projects',
            value: `${activeProjects}`,
            trend: activeProjects > 0 ? 'up' : 'steady',
            helper: `${totalProjects} total`,
        },
        {
            label: 'Average progress',
            value: `${averageProgress}%`,
            trend: averageProgress >= 70 ? 'up' : averageProgress <= 30 ? 'down' : 'steady',
            helper: 'Across all initiatives',
        },
        {
            label: 'Collaborators',
            value: `${collaborators}`,
            trend: collaborators > 0 ? 'up' : 'steady',
            helper: `${acceptedMembers.length} in workspace`,
        },
    ] as const;

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Project name is required.',
            });
            return;
        }
        
        const savedName = newProjectName;
        const savedDescription = newProjectDescription;
        
        // Validate deadline if provided
        if (newProjectDeadline) {
            const validation = validateAndSuggestDate(newProjectDeadline, {
                context: 'deadline',
                allowPast: false,
            });
            
            if (!validation.isValid) {
                setDeadlineValidationError(validation.reason);
                if (validation.suggestedDate) {
                    setNewProjectDeadline(validation.suggestedDate);
                    toast({
                        title: 'Date Adjusted',
                        description: validation.explanation || validation.reason,
                    });
                    return;
                }
                toast({
                    variant: 'destructive',
                    title: 'Invalid Deadline',
                    description: validation.reason,
                });
                return;
            }
        }
        
        // Optimistically close modal and reset form
        setIsCreateModalOpen(false);
        setNewProjectName('');
        setNewProjectDescription('');
        setNewProjectDeadline('');
        setDeadlineValidationError(undefined);
        
        // Create in background
        createProject({
            name: savedName,
            description: savedDescription,
            deadline: newProjectDeadline || undefined,
            status: 'Not Started',
            progress: 0,
            team: acceptedMembers.slice(0, 1),
            tasks: [],
            files: [],
            chat: [],
        }).then(() => {
            // Unlock achievement for first project
            if (projects.length === 0) {
                unlockAchievement('project_creator');
            }
            
            toast({
                title: 'Project Created',
                description: `Project "${savedName}" has been created successfully.`,
            });
        }).catch((error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Unable to create project. Please try again.',
            });
        });
    };

    const handleDeleteProject = async (projectId: string) => {
        await deleteProject(projectId);
    };

    const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
        await updateProject(projectId, updates);
    };

    const confirmDeletePendingProject = async () => {
        if (!projectPendingDelete || projectPendingDelete.ownerId !== user?.uid) {
            if (projectPendingDelete && projectPendingDelete.ownerId !== user?.uid) {
                toast({
                    variant: 'destructive',
                    title: 'Insufficient Permissions',
                    description: 'Only project owners can delete projects.',
                });
            }
            setProjectPendingDelete(null);
            return;
        }

        setIsListDeletingProject(true);
        try {
            await handleDeleteProject(projectPendingDelete.id);
            toast({
                title: 'Project Deleted',
                description: `"${projectPendingDelete.name}" has been deleted successfully.`,
            });
            if (selectedProjectId === projectPendingDelete.id) {
                setSelectedProjectId(null);
            }
            setProjectPendingDelete(null);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Failed to delete project.',
            });
        } finally {
            setIsListDeletingProject(false);
        }
    };

    if (selectedProject) {
        return (
            <ProjectDetail
                project={selectedProject}
                allMembers={acceptedMembers}
                onBack={() => setSelectedProjectId(null)}
                onUpdate={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
            />
        );
    }

    return (
        <>
            <PageContainer className="space-y-12 pb-24">
                <PageHeader
                    eyebrow="Portfolio"
                    title="Projects"
                    subtitle="Plan, track, and collaborate on every initiative."
                    actions={
                        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                            <PlusIcon className="h-4 w-4" />
                            New project
                        </Button>
                    }
                    stats={projectsStats}
                />

                <PageSection
                    title="In-flight initiatives"
                    description="Stay on top of delivery momentum, owners, and team capacity."
                    surface="minimal"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <SearchInput
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            containerClassName="w-full sm:w-72"
                        />
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3"
                    >
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="h-full rounded-3xl border-border/50 bg-card/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="mt-2 h-4 w-full" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="mb-4 h-2 w-full" />
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => {
                                const totalTasks = project.tasks.length;
                                const completedTasks = project.tasks.filter((task) => task.status === 'done').length;
                                const projectProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                                return (
                                    <motion.div
                                        key={project.id}
                                        variants={staggerItem}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group"
                                    >
                                        <Card
                                            className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/50 bg-card/85 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
                                            onClick={() => setSelectedProjectId(project.id)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                            <CardHeader className="relative">
                                                <div className="flex items-start justify-between gap-3">
                                                    <CardTitle className="text-lg">{project.name}</CardTitle>
                                                    <div className="flex items-start gap-2">
                                                        <Badge
                                                            variant={
                                                                project.status === 'On Track'
                                                                    ? 'default'
                                                                    : project.status === 'At Risk'
                                                                    ? 'destructive'
                                                                    : 'secondary'
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {project.status}
                                                        </Badge>
                                                        {project.ownerId === user?.uid && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setProjectPendingDelete(project);
                                                                }}
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <CardDescription className="mt-2 min-h-[40px]">
                                                    {project.description || 'No description provided yet.'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="relative">
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                                                            <span>Progress</span>
                                                            <span className="font-semibold text-foreground">{projectProgress}%</span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                            <motion.div
                                                                className="h-full rounded-full bg-primary"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${projectProgress}%` }}
                                                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                                                        <span>
                                                            {project.team.length} team {project.team.length === 1 ? 'member' : 'members'}
                                                        </span>
                                                        <div className="flex -space-x-2">
                                                            {project.team.slice(0, 4).map((member) => (
                                                                <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                                                                    <AvatarImage src={member.avatar} alt={member.name} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {member.name[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ))}
                                                            {project.team.length > 4 && (
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold">
                                                                    +{project.team.length - 4}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <Card className="md:col-span-2 xl:col-span-3">
                                <CardContent className="pt-6 text-center text-muted-foreground">
                                    No projects found. Create your first project to get started.
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </PageSection>
            </PageContainer>

            <Dialog
                open={Boolean(projectPendingDelete)}
                onOpenChange={(open) => {
                    if (!open) {
                        setProjectPendingDelete(null);
                        setIsListDeletingProject(false);
                    }
                }}
            >
                <DialogContent className="w-[95vw] max-w-[420px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Delete Project</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the project and all related tasks.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setProjectPendingDelete(null)}
                            disabled={isListDeletingProject}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeletePendingProject}
                            disabled={isListDeletingProject}
                        >
                            {isListDeletingProject ? 'Deleting...' : 'Delete Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-primary" />
                            Create New Project
                        </DialogTitle>
                        <DialogDescription>
                            Start a new project to organize your work and collaborate with your team.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name *</Label>
                            <Input
                                id="project-name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="e.g., Q1 Product Launch"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-description">Project Description</Label>
                            <Textarea
                                id="project-description"
                                value={newProjectDescription}
                                onChange={(e) => setNewProjectDescription(e.target.value)}
                                placeholder="A brief summary of the project's goals."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <DateTimePicker
                                value={newProjectDeadline}
                                onChange={(value) => {
                                    setNewProjectDeadline(value);
                                    const validation = validateAndSuggestDate(value, {
                                        context: 'deadline',
                                        allowPast: false,
                                    });
                                    setDeadlineValidationError(validation.isValid ? undefined : validation.reason);
                                    if (!validation.isValid && validation.suggestedDate) {
                                        // Auto-suggest if date is invalid
                                        setTimeout(() => {
                                            setNewProjectDeadline(validation.suggestedDate!);
                                        }, 100);
                                    }
                                }}
                                label="Project Deadline (optional)"
                                placeholder="Select project deadline"
                                showTime={false}
                                onValidationChange={(isValid, reason) => {
                                    setDeadlineValidationError(isValid ? undefined : reason);
                                }}
                            />
                            {deadlineValidationError && (
                                <p className="text-xs text-destructive mt-1">{deadlineValidationError}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                            Create Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Projects;