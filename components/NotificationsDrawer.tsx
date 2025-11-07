import React, { useEffect, useMemo, useState } from 'react';
import Card from './shared/Card';
import { CloseIcon, SparklesIcon, MessageIcon, TasksIcon, BellIcon } from './shared/Icons';
import { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationCategory = 'all' | 'tasks' | 'messages' | 'ai';

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const { user } = useAuth();
  const { notifications, loading, markAsRead } = useNotifications(user?.uid);

  const filteredNotifications = useMemo(() => notifications.filter(n => 
    activeTab === 'all' ? true : n.category === activeTab
  ), [notifications, activeTab]);

  useEffect(() => {
    if (!isOpen) return;
    filteredNotifications
      .filter((notification) => !notification.read)
      .forEach((notification) => markAsRead(notification.id));
  }, [isOpen, filteredNotifications, markAsRead]);
  
  const getIconForCategory = (category: Notification['category']) => {
    switch(category) {
        case 'tasks': return <TasksIcon />;
        case 'messages': return <MessageIcon />;
        case 'ai': return <SparklesIcon className="w-6 h-6" />;
        default: return <BellIcon />;
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-secondary/90 backdrop-blur-lg shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <CloseIcon />
          </button>
        </div>
        
        <div className="border-b border-accent/50 mb-4">
            <nav className="flex space-x-2 -mb-px">
                 <button onClick={() => setActiveTab('all')} className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>All</button>
                 <button onClick={() => setActiveTab('tasks')} className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'tasks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Tasks</button>
                 <button onClick={() => setActiveTab('messages')} className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'messages' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Messages</button>
                 <button onClick={() => setActiveTab('ai')} className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'ai' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>AI</button>
            </nav>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loading ? (
                <Card className="p-4 text-muted-foreground">Loading notifications...</Card>
            ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map(notif => (
                    <div key={notif.id} className="flex items-start gap-4 p-3 bg-primary/50 rounded-lg animate-fade-in">
                        <div className="text-primary flex-shrink-0 mt-1">
                            {getIconForCategory(notif.category)}
                        </div>
                        <div>
                            <p className="text-foreground">{notif.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground text-sm">No notifications yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsDrawer;