import React from 'react';
import { X, LucideIcon, Bell } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: LucideIcon;
  timestamp?: string;
  isRead?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export interface NotificationsCardProps {
  title: string;
  notifications: Notification[];
  actionLabel?: string;
  onAction?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onDismissAll?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  maxItems?: number;
  showDismiss?: boolean;
  emptyMessage?: string;
}

export default function NotificationsCard({
  title,
  notifications,
  actionLabel = 'View all',
  onAction,
  onNotificationClick,
  onDismissAll,
  className = '',
  variant = 'default',
  maxItems,
  showDismiss = true,
  emptyMessage = 'No notifications',
}: NotificationsCardProps) {
  const displayNotifications = maxItems ? notifications.slice(0, maxItems) : notifications;

  const getCardStyles = () => {
    switch (variant) {
      case 'compact':
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-4';
      case 'inline':
        return 'bg-[var(--muted)] border-l-4 border-[var(--primary)] p-4';
      default:
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-6';
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-l-4 border-green-400',
          titleColor: 'text-green-800',
          textColor: 'text-green-600',
          iconColor: 'text-green-600',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-l-4 border-yellow-400',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-600',
          iconColor: 'text-yellow-600',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-l-4 border-red-400',
          titleColor: 'text-red-800',
          textColor: 'text-red-600',
          iconColor: 'text-red-600',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-l-4 border-blue-400',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-600',
          iconColor: 'text-blue-600',
        };
    }
  };

  return (
    <div
      className={`
        rounded-lg transition-all duration-200 hover:shadow-md
        ${getCardStyles()}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)]">{title}</h3>
        <div className="flex items-center gap-2">
          {onAction && (
            <button
              onClick={onAction}
              className="
                text-sm text-blue-600 hover:text-blue-800 font-medium
                transition-colors duration-200
              "
            >
              {actionLabel}
            </button>
          )}
          {onDismissAll && notifications.length > 0 && (
            <button
              onClick={onDismissAll}
              className="
                text-sm text-gray-500 hover:text-gray-700
                transition-colors duration-200
              "
            >
              Dismiss all
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {displayNotifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[var(--muted)] rounded-full mx-auto flex items-center justify-center mb-3">
            <Bell className="w-6 h-6 text-[var(--muted-foreground)]" />
          </div>
          <p className="text-[var(--muted-foreground)]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayNotifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            const Icon = notification.icon;
            
            return (
              <div
                key={notification.id}
                className={`
                  relative p-4 rounded-lg ${styles.bg} ${styles.border}
                  ${onNotificationClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''}
                  ${!notification.isRead ? 'ring-1 ring-blue-200' : ''}
                `}
                onClick={() => onNotificationClick?.(notification)}
              >
                <div className="flex items-start gap-3">
                  {Icon && (
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`font-medium ${styles.titleColor}`}>
                        {notification.title}
                        {!notification.isRead && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                        )}
                      </p>
                      
                      {showDismiss && notification.onDismiss && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.onDismiss?.();
                          }}
                          className={`
                            flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/50
                            transition-colors ${styles.textColor}
                          `}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <p className={`text-sm ${styles.textColor} mt-1`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      {notification.timestamp && (
                        <span className="text-xs text-gray-500">
                          {notification.timestamp}
                        </span>
                      )}
                      
                      {notification.onAction && notification.actionLabel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.onAction?.();
                          }}
                          className={`
                            text-sm font-medium underline hover:no-underline
                            transition-all ${styles.titleColor}
                          `}
                        >
                          {notification.actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
