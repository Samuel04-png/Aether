export type ViewType = 'dashboard' | 'chat' | 'insights' | 'tasks' | 'projects' | 'leads' | 'settings' | 'notifications' | 'meetings' | 'integration-test';

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer';

export type InviteStatus = 'pending' | 'accepted' | 'declined';

export type NotificationCategory = 'tasks' | 'messages' | 'ai' | 'system' | 'invite' | 'mention' | 'file' | 'deadline';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
}

export interface ProjectMember extends TeamMember {
  projectRole: ProjectRole;
  joinedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: TaskStatus;
  assignee?: TeamMember;
  assignedTo?: string; // User ID
  assignedBy?: string; // User ID
  createdAt?: string;
  completedAt?: string;
  projectId?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Document';
  size: string; // e.g. '2.3 MB'
  uploadedAt: string;
  uploadedBy?: string; // User ID
  uploadedByName?: string;
}

export interface ChatMessage {
  id: string;
  sender: TeamMember;
  content: string;
  timestamp: string;
  mentions?: string[]; // Array of user IDs mentioned
  channelId?: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  members: string[]; // Array of user IDs
  createdBy: string; // User ID
  createdAt: string;
  lastMessageAt?: string;
  isArchived?: boolean;
}

export interface Project {
  id: string;
  name: string;
  status: 'On Track' | 'At Risk' | 'Off Track' | 'Not Started';
  progress: number;
  description: string;
  team: TeamMember[];
  projectMembers?: ProjectMember[]; // Enhanced member list with roles
  tasks: Task[];
  files: ProjectFile[];
  chat: ChatMessage[];
  ownerId?: string;
  teamMemberIds?: string[];
  workspaceId?: string;
  createdBy?: string; // User ID of project creator
  createdAt?: string;
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  projectName: string;
  invitedBy: string; // User ID
  invitedByName: string;
  invitedByEmail: string;
  invitedUser: string; // User ID
  invitedUserEmail: string;
  role: ProjectRole;
  status: InviteStatus;
  createdAt: string;
  respondedAt?: string;
  message?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[]; // Array of user IDs
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: string;
  phone?: string;
  value?: string;
  archived?: boolean;
  archivedAt?: string;
  createdAt?: string;
}

export interface SalesAutomationChannels {
  sms: boolean;
  voice: boolean;
  invoices: boolean;
  appointments: boolean;
}

export interface SalesAutomationSettings {
  enabled: boolean;
  businessPhone: string;
  invoiceEmail: string;
  calendarLink?: string;
  officeHours?: string;
  playbook?: string;
  channels: SalesAutomationChannels;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  category: NotificationCategory;
  read: boolean;
  userId: string;
  relatedId?: string; // ID of related entity (project, task, etc.)
  relatedType?: 'project' | 'task' | 'file' | 'invite';
  actionUrl?: string; // URL to navigate when clicked
  metadata?: {
    projectId?: string;
    taskId?: string;
    fileId?: string;
    inviteId?: string;
    mentionedBy?: string;
    [key: string]: any;
  };
}

export interface UserProfile {
  businessName: string;
  industry: string;
  goals: string[];
  completedOnboarding: boolean;
  workspaceId?: string;
  demoDataAcknowledged?: boolean;
  demoDataRemovedAt?: string;
}