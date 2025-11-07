import React, { useState } from 'react';
import Card from './shared/Card';
import { BellIcon, CheckIcon, TrashIcon, FilterIcon } from './shared/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { useProjectInvites } from '../hooks/useProjectInvites';
import { NotificationCategory } from '../types';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications(user?.uid);
  
  const { acceptInvite, declineInvite } = useProjectInvites(user?.uid);

  const [filterCategory, setFilterCategory] = useState<NotificationCategory | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = notifications.filter((notification) => {
    const categoryMatch = filterCategory === 'all' || notification.category === filterCategory;
    const readMatch = !showUnreadOnly || !notification.read;
    return categoryMatch && readMatch;
  });

  const handleAcceptInvite = async (inviteId: string, notificationId: string) => {
    try {
      await acceptInvite(inviteId);
      await markAsRead(notificationId);
    } catch (error: any) {
      alert(error.message || 'Failed to accept invite');
    }
  };

  const handleDeclineInvite = async (inviteId: string, notificationId: string) => {
    try {
      await declineInvite(inviteId);
      await markAsRead(notificationId);
    } catch (error: any) {
      alert(error.message || 'Failed to decline invite');
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    const iconClass = "w-5 h-5";
    switch (category) {
      case 'invite':
        return <span className={`${iconClass}`} style={{ color: 'var(--chart-4)' }}>👥</span>;
      case 'tasks':
        return <span className={`${iconClass}`} style={{ color: 'var(--primary)' }}>✓</span>;
      case 'messages':
        return <span className={`${iconClass}`} style={{ color: 'var(--chart-2)' }}>💬</span>;
      case 'mention':
        return <span className={`${iconClass}`} style={{ color: 'var(--chart-3)' }}>@</span>;
      case 'file':
        return <span className={`${iconClass}`} style={{ color: 'var(--chart-4)' }}>📎</span>;
      case 'deadline':
        return <span className={`${iconClass}`} style={{ color: 'var(--destructive)' }}>⏰</span>;
      case 'ai':
        return <span className={`${iconClass}`} style={{ color: 'var(--primary)' }}>✨</span>;
      default:
        return <span className={`${iconClass} text-muted-foreground`}>🔔</span>;
    }
  };

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'invite': return 'bg-[var(--chart-4)]/10 border-[var(--chart-4)]/20';
      case 'tasks': return 'bg-[var(--primary)]/10 border-[var(--primary)]/20';
      case 'messages': return 'bg-[var(--chart-2)]/10 border-[var(--chart-2)]/20';
      case 'mention': return 'bg-[var(--chart-3)]/10 border-[var(--chart-3)]/20';
      case 'file': return 'bg-[var(--chart-4)]/10 border-[var(--chart-4)]/20';
      case 'deadline': return 'bg-[var(--destructive)]/10 border-[var(--destructive)]/20';
      case 'ai': return 'bg-[var(--primary)]/10 border-[var(--primary)]/20';
      default: return 'bg-secondary/50 border-accent/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BellIcon className="w-8 h-8" /> Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-accent text-accent-foreground font-semibold py-2 px-4 rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <CheckIcon /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="bg-[var(--destructive)]/20 font-semibold py-2 px-4 rounded-lg hover:bg-[var(--destructive)]/30 transition-colors flex items-center gap-2"
              style={{ color: 'var(--destructive)' }}
            >
              <TrashIcon /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            <div className="flex flex-wrap gap-2">
              {(['all', 'invite', 'tasks', 'messages', 'mention', 'file', 'deadline'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    filterCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 rounded border-accent text-primary focus:ring-ring focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-muted-foreground">Unread only</span>
          </label>
        </div>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <Card>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-primary/40 rounded-lg"></div>
            ))}
          </div>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BellIcon className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-lg">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications to display'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:scale-[1.01] ${
                !notification.read ? getCategoryColor(notification.category) : 'opacity-70'
              } border`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getCategoryIcon(notification.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {notification.text}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>

                  {/* Invite Actions */}
                  {notification.category === 'invite' && notification.metadata?.inviteId && !notification.read && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAcceptInvite(notification.metadata!.inviteId!, notification.id)}
                        className="text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--chart-2)', color: 'var(--primary-foreground)' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(notification.metadata!.inviteId!, notification.id)}
                        className="bg-[var(--destructive)]/20 text-sm font-semibold py-1.5 px-4 rounded-lg hover:bg-[var(--destructive)]/30 transition-colors"
                        style={{ color: 'var(--destructive)' }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-start gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-primary hover:text-primary/80 transition-colors p-1"
                      title="Mark as read"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="transition-colors p-1"
                    style={{ color: 'var(--destructive)' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

