import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatusItem {
  id: string;
  label: string;
  status: 'operational' | 'warning' | 'error' | 'maintenance' | 'unknown';
  description?: string;
  icon?: LucideIcon;
  lastUpdated?: string;
}

export interface StatusCardProps {
  title: string;
  description?: string;
  items: StatusItem[];
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showLastUpdated?: boolean;
  onItemClick?: (item: StatusItem) => void;
}

export default function StatusCard({
  title,
  description,
  items,
  className = '',
  variant = 'default',
  showLastUpdated = false,
  onItemClick,
}: StatusCardProps) {
  const getCardStyles = () => {
    switch (variant) {
      case 'compact':
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-4';
      case 'detailed':
        return 'bg-[var(--card)] border border-[var(--border)] shadow-lg p-6';
      default:
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-6';
    }
  };

  const getStatusStyles = (status: StatusItem['status']) => {
    switch (status) {
      case 'operational':
        return {
          dot: 'bg-green-500',
          text: 'text-green-600',
          bg: 'bg-green-50',
          label: 'Operational',
        };
      case 'warning':
        return {
          dot: 'bg-yellow-500',
          text: 'text-yellow-600',
          bg: 'bg-yellow-50',
          label: 'Warning',
        };
      case 'error':
        return {
          dot: 'bg-red-500',
          text: 'text-red-600',
          bg: 'bg-red-50',
          label: 'Error',
        };
      case 'maintenance':
        return {
          dot: 'bg-blue-500',
          text: 'text-blue-600',
          bg: 'bg-blue-50',
          label: 'Maintenance',
        };
      default:
        return {
          dot: 'bg-gray-500',
          text: 'text-gray-600',
          bg: 'bg-gray-50',
          label: 'Unknown',
        };
    }
  };

  const getOverallStatus = () => {
    if (items.some(item => item.status === 'error')) return 'error';
    if (items.some(item => item.status === 'warning')) return 'warning';
    if (items.some(item => item.status === 'maintenance')) return 'maintenance';
    if (items.every(item => item.status === 'operational')) return 'operational';
    return 'unknown';
  };

  const overallStatus = getOverallStatus();
  const overallStatusStyles = getStatusStyles(overallStatus);

  return (
    <div
      className={`
        rounded-lg transition-all duration-200 hover:shadow-md
        ${getCardStyles()}
        ${className}
      `}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--card-foreground)]">{title}</h3>
          {variant !== 'compact' && (
            <div className={`
              inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
              ${overallStatusStyles.bg} ${overallStatusStyles.text}
            `}>
              <div className={`w-2 h-2 rounded-full ${overallStatusStyles.dot}`}></div>
              {overallStatusStyles.label}
            </div>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Status Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const statusStyles = getStatusStyles(item.status);
          const Icon = item.icon;
          
          return (
            <div
              key={item.id}
              className={`
                flex items-center justify-between p-3 rounded-lg border
                ${statusStyles.bg} border-transparent
                ${onItemClick ? 'cursor-pointer hover:border-gray-200 transition-colors' : ''}
              `}
              onClick={() => onItemClick?.(item)}
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <Icon className={`w-4 h-4 ${statusStyles.text}`} />
                )}
                <div>
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  {item.description && variant === 'detailed' && (
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {showLastUpdated && item.lastUpdated && (
                  <span className="text-xs text-gray-500">{item.lastUpdated}</span>
                )}
                <div className={`inline-flex items-center gap-2 text-sm font-medium ${statusStyles.text}`}>
                  <div className={`w-2 h-2 rounded-full ${statusStyles.dot}`}></div>
                  {variant !== 'compact' && statusStyles.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">No status information available</p>
        </div>
      )}
    </div>
  );
}
