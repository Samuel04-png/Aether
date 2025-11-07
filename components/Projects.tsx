import React, { useMemo, useState } from 'react';
import { SparklesIcon, ChevronLeftIcon, PlusIcon, FileIcon, UsersIcon, MessageIcon, TasksIcon, UploadIcon, EnvelopeIcon } from './shared/Icons';
import { SearchInput } from '@/components/ui/search-input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface ProjectTaskColumnProps {
    status: TaskStatus;
    tasks: Task[];
    team: TeamMember[];
    onDragStart: (taskId: string) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
    onAssign: (taskId: string, memberId: string | null) => void;
}

const ProjectTaskColumn: React.FC<ProjectTaskColumnProps> = ({ status, tasks, team, onDragStart, onDragOver, onDrop, onAssign }) => {
    const titleMap: Record<TaskStatus, string> = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

    return (
        <div
            className="bg-card/50 border border-border rounded-lg p-4 flex-1"
            onDragOver={onDragOver}
            onDrop={(event) => onDrop(event, status)}
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
                        draggable
                        onDragStart={() => onDragStart(task.id)}
                        className="p-3 bg-card border border-border rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.01 }}
                        whileDrag={{ scale: 0.98, opacity: 0.8 }}
                    >
                        <p className="font-semibold text-foreground">{task.title}</p>
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
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onUpdate, allMembers }) => {
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
    
    // Invite modal state
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteSearchTerm, setInviteSearchTerm] = useState('');
    const [selectedUserEmail, setSelectedUserEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<ProjectRole>('member');
    const [inviteMessage, setInviteMessage] = useState('');

    const availableMembers = useMemo(
        () => allMembers.filter((member) => {
            // Only show accepted members that aren't already in the project
            const isAccepted = !member.status || member.status === 'accepted';
            const isNotInProject = !project.team.some((existing) => existing.id === member.id);
            return isAccepted && isNotInProject;
        }),
        [allMembers, project.team]
    );

    const handleTaskDrop = (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
        event.preventDefault();
        if (draggedTaskId) {
            const updatedTasks = project.tasks.map((task) =>
                task.id === draggedTaskId ? { ...task, status } : task
            );
            onUpdate(project.id, { tasks: updatedTasks });
            setDraggedTaskId(null);
        }
    };

    const handleAssignTask = (taskId: string, memberId: string | null) => {
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

    const handleRemoveMember = (memberId: string) => {
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


    const handleAddTask = async () => {
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
        
        const newTask: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: newTaskTitle.trim(),
            description: (newTaskDescription || newTaskTitle).trim(),
            status: 'todo',
            ...(newTaskDueDate && { dueDate: newTaskDueDate }),
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
                <DialogContent className="sm:max-w-[500px]">
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
                            <Label htmlFor="new-task-due-date">Due Date (optional)</Label>
                            <Input
                                id="new-task-due-date"
                                type="date"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                            />
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
                <DialogContent className="sm:max-w-[500px]">
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
        
            <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                exit={fadeInUp.exit}
                transition={transitions.quick}
                className="space-y-6"
            >
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ChevronLeftIcon className="h-4 w-4" />
                    Back to All Projects
                </Button>
                
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl">{project.name}</CardTitle>
                                <CardDescription className="mt-2 max-w-2xl">
                                    {project.description}
                                </CardDescription>
                            </div>
                            <Badge
                                variant={
                                    project.status === 'On Track'
                                        ? 'default'
                                        : project.status === 'At Risk'
                                        ? 'destructive'
                                        : 'secondary'
                                }
                            >
                                {project.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Overall Progress</span>
                                <span className="font-semibold text-foreground">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <motion.div
                                    className="bg-primary h-2.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                        <CardHeader>
                            <TabsList className="grid w-full grid-cols-4">
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
                                    <div className="flex justify-end">
                                        <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="gap-2">
                                                    <PlusIcon className="h-4 w-4" />
                                                    Add Task
                                                </Button>
                                            </DialogTrigger>
                                        </Dialog>
                                    </div>
                                    <div className="flex gap-6">
                                        <ProjectTaskColumn
                                            status="todo"
                                            tasks={project.tasks.filter((task) => task.status === 'todo')}
                                            team={project.team}
                                            onDragStart={(taskId) => setDraggedTaskId(taskId)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={handleTaskDrop}
                                            onAssign={handleAssignTask}
                                        />
                                        <ProjectTaskColumn
                                            status="inprogress"
                                            tasks={project.tasks.filter((task) => task.status === 'inprogress')}
                                            team={project.team}
                                            onDragStart={(taskId) => setDraggedTaskId(taskId)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={handleTaskDrop}
                                            onAssign={handleAssignTask}
                                        />
                                        <ProjectTaskColumn
                                            status="done"
                                            tasks={project.tasks.filter((task) => task.status === 'done')}
                                            team={project.team}
                                            onDragStart={(taskId) => setDraggedTaskId(taskId)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={handleTaskDrop}
                                            onAssign={handleAssignTask}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="team" className="mt-0">
                                <div className="space-y-4">
                                    <div className="flex justify-end gap-2">
                                        {availableMembers.length > 0 && (
                                            <Button
                                                variant="outline"
                                                className="gap-2"
                                                onClick={() => {
                                                    // Add first available member to project
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
                                                Add from Team ({availableMembers.length})
                                            </Button>
                                        )}
                                        <Dialog open={isInviteModalOpen} onOpenChange={(open) => {
                                            setIsInviteModalOpen(open);
                                            if (!open) {
                                                setInviteSearchTerm('');
                                                setSelectedUserEmail('');
                                                clearResults();
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button className="gap-2">
                                                    <EnvelopeIcon className="h-4 w-4" />
                                                    Invite New Member
                                                </Button>
                                            </DialogTrigger>
                                        </Dialog>
                                    </div>
                                    
                                    {/* Available Team Members to Add */}
                                    {availableMembers.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Available Team Members</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveMember(member.id)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    Remove
                                                                </Button>
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
            </motion.div>
        </>
    );
};

const Projects: React.FC = () => {
    const { user } = useAuth();
    const { projects, loading, createProject, updateProject } = useProjects(user?.uid);
    const { acceptedMembers } = useTeamMembers(user?.uid);
    const { toast } = useToast();

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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
        
        // Optimistically close modal and reset form
        setIsCreateModalOpen(false);
        setNewProjectName('');
        setNewProjectDescription('');
        
        // Create in background
        createProject({
            name: savedName,
            description: savedDescription,
            status: 'Not Started',
            progress: 0,
            team: acceptedMembers.slice(0, 1),
            tasks: [],
            files: [],
            chat: [],
        }).then(() => {
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

    const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
        await updateProject(projectId, updates);
    };

    if (selectedProject) {
        return (
            <ProjectDetail
                project={selectedProject}
                allMembers={acceptedMembers}
                onBack={() => setSelectedProjectId(null)}
                onUpdate={handleUpdateProject}
            />
        );
    }

    return (
        <>
            <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                exit={fadeInUp.exit}
                transition={transitions.quick}
                className="space-y-6"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <motion.h1
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={transitions.quick}
                            className="text-2xl sm:text-3xl font-bold text-foreground"
                        >
                            Projects
                        </motion.h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage all your initiatives from one central hub.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <SearchInput
                            placeholder="Filter projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            containerClassName="w-full sm:w-64"
                        />
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 w-full sm:w-auto" size="lg">
                                    <PlusIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Create Project</span>
                                    <span className="sm:hidden">Create</span>
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-2 w-full mb-4" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                variants={staggerItem}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    className="cursor-pointer h-full flex flex-col justify-between hover:shadow-lg transition-shadow"
                                    onClick={() => setSelectedProjectId(project.id)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{project.name}</CardTitle>
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
                                        </div>
                                        <CardDescription className="mt-2 min-h-[40px]">
                                            {project.description || 'No description'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                    <span>Progress</span>
                                                    <span className="font-semibold text-foreground">{project.progress}%</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2">
                                                    <motion.div
                                                        className="bg-primary h-2 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${project.progress}%` }}
                                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-muted-foreground border-t border-border pt-4">
                                                <span>{project.team.length} Team {project.team.length === 1 ? 'Member' : 'Members'}</span>
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
                                                        <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold">
                                                            +{project.team.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                No projects found. Create your first project to get started.
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </motion.div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
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