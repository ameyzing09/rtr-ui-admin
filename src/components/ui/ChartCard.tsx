import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ChartCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
  height?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export default function ChartCard({
  title,
  description,
  children,
  actionLabel = 'View all',
  onAction,
  icon: Icon,
  className = '',
  height = 'h-64',
  variant = 'default',
}: ChartCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-4';
      case 'featured':
        return 'bg-[var(--card)] border border-[var(--border)] shadow-lg p-6';
      default:
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-6';
    }
  };

  const getContentHeight = () => {
    switch (variant) {
      case 'compact':
        return 'h-48';
      case 'featured':
        return 'h-80';
      default:
        return height;
    }
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
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-[var(--card-foreground)]">{title}</h3>
            {description && (
              <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
            )}
          </div>
        </div>
        
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

      {/* Content Area */}
      <div className={`${getContentHeight()} ${children ? '' : 'bg-gray-50'} rounded-lg flex items-center justify-center`}>
        {children || (
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              {Icon ? (
                <Icon className="w-6 h-6 text-gray-400" />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              )}
            </div>
            <p className="text-gray-500 font-medium">Chart component goes here</p>
            <p className="text-sm text-gray-400">
              Integrate with your preferred charting library
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
