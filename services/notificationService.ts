import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { NotificationCategory } from '../types';

export interface CreateNotificationParams {
  userId: string;
  text: string;
  category: NotificationCategory;
  relatedId?: string;
  relatedType?: 'project' | 'task' | 'file' | 'invite';
  actionUrl?: string;
  metadata?: {
    projectId?: string;
    taskId?: string;
    fileId?: string;
    inviteId?: string;
    mentionedBy?: string;
    [key: string]: any;
  };
}

/**
 * Creates a notification for a user
 */
export const createNotification = async (params: CreateNotificationParams): Promise<void> => {
  try {
    const notificationsCollection = collection(db, 'users', params.userId, 'notifications');
    await addDoc(notificationsCollection, {
      text: params.text,
      time: new Date().toISOString(),
      category: params.category,
      read: false,
      userId: params.userId,
      relatedId: params.relatedId,
      relatedType: params.relatedType,
      actionUrl: params.actionUrl,
      metadata: params.metadata,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Sends a project invitation notification
 */
export const notifyProjectInvite = async (
  invitedUserId: string,
  inviterName: string,
  projectName: string,
  projectId: string,
  inviteId: string
): Promise<void> => {
  await createNotification({
    userId: invitedUserId,
    text: `${inviterName} invited you to join project: ${projectName}`,
    category: 'invite',
    relatedId: inviteId,
    relatedType: 'invite',
    actionUrl: `/projects/${projectId}`,
    metadata: {
      projectId,
      inviteId,
    },
  });
};

/**
 * Sends a task assignment notification
 */
export const notifyTaskAssignment = async (
  assignedUserId: string,
  assignerName: string,
  taskTitle: string,
  projectName: string,
  projectId: string,
  taskId: string
): Promise<void> => {
  await createNotification({
    userId: assignedUserId,
    text: `You were assigned a task in ${projectName}: ${taskTitle}`,
    category: 'tasks',
    relatedId: taskId,
    relatedType: 'task',
    actionUrl: `/projects/${projectId}`,
    metadata: {
      projectId,
      taskId,
      assignedBy: assignerName,
    },
  });
};

/**
 * Sends a mention notification
 */
export const notifyMention = async (
  mentionedUserId: string,
  mentionerName: string,
  messageContent: string,
  projectName: string,
  projectId: string
): Promise<void> => {
  const truncatedMessage = messageContent.length > 50 
    ? messageContent.substring(0, 50) + '...' 
    : messageContent;
  
  await createNotification({
    userId: mentionedUserId,
    text: `${mentionerName} mentioned you in ${projectName}: "${truncatedMessage}"`,
    category: 'mention',
    relatedId: projectId,
    relatedType: 'project',
    actionUrl: `/projects/${projectId}`,
    metadata: {
      projectId,
      mentionedBy: mentionerName,
    },
  });
};

/**
 * Sends a file upload notification
 */
export const notifyFileUpload = async (
  userIds: string[],
  uploaderName: string,
  fileName: string,
  projectName: string,
  projectId: string,
  fileId: string
): Promise<void> => {
  const promises = userIds.map((userId) =>
    createNotification({
      userId,
      text: `${uploaderName} uploaded a file in ${projectName}: ${fileName}`,
      category: 'file',
      relatedId: fileId,
      relatedType: 'file',
      actionUrl: `/projects/${projectId}`,
      metadata: {
        projectId,
        fileId,
        uploadedBy: uploaderName,
      },
    })
  );

  await Promise.all(promises);
};

/**
 * Sends a deadline reminder notification
 */
export const notifyDeadlineReminder = async (
  userId: string,
  taskTitle: string,
  dueDate: string,
  projectName: string,
  projectId: string,
  taskId: string
): Promise<void> => {
  await createNotification({
    userId,
    text: `Task deadline approaching: ${taskTitle} (Due: ${dueDate})`,
    category: 'deadline',
    relatedId: taskId,
    relatedType: 'task',
    actionUrl: `/projects/${projectId}`,
    metadata: {
      projectId,
      taskId,
      dueDate,
    },
  });
};

/**
 * Sends a new message notification to project members
 */
export const notifyNewMessage = async (
  recipientUserIds: string[],
  senderName: string,
  messageContent: string,
  projectName: string,
  projectId: string
): Promise<void> => {
  const truncatedMessage = messageContent.length > 50 
    ? messageContent.substring(0, 50) + '...' 
    : messageContent;

  const promises = recipientUserIds.map((userId) =>
    createNotification({
      userId,
      text: `${senderName} sent a message in ${projectName}: "${truncatedMessage}"`,
      category: 'messages',
      relatedId: projectId,
      relatedType: 'project',
      actionUrl: `/projects/${projectId}`,
      metadata: {
        projectId,
        sender: senderName,
      },
    })
  );

  await Promise.all(promises);
};

/**
 * Sends an invite accepted notification to project owner
 */
export const notifyInviteAccepted = async (
  ownerId: string,
  acceptedUserName: string,
  projectName: string,
  projectId: string
): Promise<void> => {
  await createNotification({
    userId: ownerId,
    text: `${acceptedUserName} accepted your invitation to ${projectName}`,
    category: 'invite',
    relatedId: projectId,
    relatedType: 'project',
    actionUrl: `/projects/${projectId}`,
    metadata: {
      projectId,
      acceptedBy: acceptedUserName,
    },
  });
};

/**
 * Sends a team member invitation notification
 */
export const notifyTeamMemberInvite = async (
  invitedUserId: string,
  inviterName: string,
  inviterEmail: string
): Promise<void> => {
  await createNotification({
    userId: invitedUserId,
    text: `${inviterName} (${inviterEmail}) invited you to join their team`,
    category: 'invite',
    relatedType: 'invite',
    metadata: {
      inviterName,
      inviterEmail,
    },
  });
};

