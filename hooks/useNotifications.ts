import { useCallback, useEffect, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc, writeBatch, where, deleteDoc } from 'firebase/firestore';
import { Notification, NotificationCategory } from '../types';
import { db } from '../services/firebase';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsCollection = collection(db, 'users', userId, 'notifications');
    const notificationsQuery = query(notificationsCollection, orderBy('time', 'desc'));

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        setNotifications(
          snapshot.docs.map((document) => {
            const data = document.data() as Omit<Notification, 'id'> & { id?: string };
            return {
              id: document.id,
              userId: data.userId || userId,
              ...data,
            };
          }),
        );
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;
      try {
        const notificationDoc = doc(db, 'users', userId, 'notifications', notificationId);
        await updateDoc(notificationDoc, { read: true });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [userId],
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter((n) => !n.read);
      
      unreadNotifications.forEach((notification) => {
        const notificationDoc = doc(db, 'users', userId, 'notifications', notification.id);
        batch.update(notificationDoc, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userId, notifications]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!userId) return;
      try {
        const notificationDoc = doc(db, 'users', userId, 'notifications', notificationId);
        await deleteDoc(notificationDoc);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    },
    [userId],
  );

  const clearAllNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const batch = writeBatch(db);
      
      notifications.forEach((notification) => {
        const notificationDoc = doc(db, 'users', userId, 'notifications', notification.id);
        batch.delete(notificationDoc);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }, [userId, notifications]);

  // Computed values
  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  // Filter by category
  const getNotificationsByCategory = useCallback(
    (category: NotificationCategory) => {
      return notifications.filter((n) => n.category === category);
    },
    [notifications]
  );

  // Get invite notifications
  const inviteNotifications = getNotificationsByCategory('invite');
  const taskNotifications = getNotificationsByCategory('tasks');
  const messageNotifications = getNotificationsByCategory('messages');
  const deadlineNotifications = getNotificationsByCategory('deadline');

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    inviteNotifications,
    taskNotifications,
    messageNotifications,
    deadlineNotifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByCategory,
  };
};

