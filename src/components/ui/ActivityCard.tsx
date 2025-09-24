import React from 'react';
import { Clock, LucideIcon } from 'lucide-react';

export interface ActivityItem {
  id: string | number;
  user: string;
  action: string;
  time: string;
  avatar?: string;
  icon?: LucideIcon;
  metadata?: Record<string, string | number | boolean>;
}

export interface ActivityCardProps {
  title: string;
  activities: ActivityItem[];
  actionLabel?: string;
  onAction?: () => void;
  onItemClick?: (item: ActivityItem) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showAvatars?: boolean;
  showIcons?: boolean;
  maxItems?: number;
  emptyMessage?: string;
}

export default function ActivityCard({
  title,
  activities,
  actionLabel = 'View all',
  onAction,
  onItemClick,
  className = '',
  variant = 'default',
  showAvatars = true,
  showIcons = false,
  maxItems,
  emptyMessage = 'No recent activity',
}: ActivityCardProps) {
  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-4';
      case 'detailed':
        return 'bg-[var(--card)] border border-[var(--border)] shadow-lg p-6';
      default:
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-6';
    }
  };

  const getItemSpacing = () => {
    switch (variant) {
      case 'compact':
        return 'space-y-2';
      case 'detailed':
        return 'space-y-4';
      default:
        return 'space-y-4';
    }
  };

  const renderAvatar = (item: ActivityItem) => {
    if (!showAvatars) return null;
    
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600 flex-shrink-0">
        {item.avatar || item.user.charAt(0).toUpperCase()}
      </div>
    );
  };

  const renderIcon = (item: ActivityItem) => {
    if (!showIcons || !item.icon) return null;
    
    const Icon = item.icon;
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
    );
  };

  return (
    <div
      className={`
        rounded-lg transition-all duration-200 hover:shadow-md
        ${getVariantStyles()}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)]">{title}</h3>
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
      </div>

      {/* Activity List */}
      {displayActivities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-[var(--muted-foreground)]">{emptyMessage}</p>
        </div>
      ) : (
        <div className={getItemSpacing()}>
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              className={`
                flex items-start gap-3 group
                ${onItemClick ? 'cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors' : ''}
              `}
              onClick={() => onItemClick?.(activity)}
            >
              {showIcons ? renderIcon(activity) : renderAvatar(activity)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--card-foreground)]">
                  <span className="font-medium">{activity.user}</span>{' '}
                  {activity.action}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-[var(--muted-foreground)]">{activity.time}</p>
                  {activity.metadata && variant === 'detailed' && (
                    <>
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {String(value)}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
              
              {onItemClick && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
