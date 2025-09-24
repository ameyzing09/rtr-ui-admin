import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  description?: string;
}

export interface QuickActionsCardProps {
  title: string;
  description?: string;
  actions: QuickAction[];
  className?: string;
  variant?: 'default' | 'compact' | 'grid';
  columns?: number;
}

export default function QuickActionsCard({
  title,
  description,
  actions,
  className = '',
  variant = 'default',
  columns = 1,
}: QuickActionsCardProps) {
  const getCardStyles = () => {
    switch (variant) {
      case 'compact':
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-4';
      case 'grid':
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-6';
      default:
        return 'bg-[var(--card)] border border-[var(--border)] shadow-sm p-6';
    }
  };

  const getButtonStyles = (action: QuickAction) => {
    const baseStyles = `
      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
      transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    `;

    switch (action.variant) {
      case 'primary':
        return `${baseStyles} bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2`;
      case 'secondary':
        return `${baseStyles} bg-[var(--card)] text-[var(--app-fg)] border border-[var(--border)] hover:opacity-95 focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2`;
      case 'danger':
        return `${baseStyles} bg-[var(--danger)]/10 text-[var(--danger)] hover:opacity-95 focus:ring-2 focus:ring-[var(--danger)] focus:ring-offset-2`;
      default:
        return `${baseStyles} text-[var(--app-fg)] hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2`;
    }
  };

  const getContainerStyles = () => {
    if (variant === 'grid') {
      return `grid gap-3 grid-cols-${Math.min(columns, actions.length)}`;
    }
    return 'space-y-2';
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
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Actions */}
      <div className={getContainerStyles()}>
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={getButtonStyles(action)}
              title={action.description}
            >
              {Icon && (
                <Icon className={`
                  w-5 h-5 flex-shrink-0
                  ${action.variant === 'primary' ? 'text-white' : 
                    action.variant === 'danger' ? 'text-red-600' : 'text-gray-500'}
                `} />
              )}
              <span className="text-left flex-1">{action.label}</span>
              {action.description && variant !== 'compact' && (
                <span className="text-xs text-gray-500 hidden sm:block">
                  {action.description}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {actions.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">No actions available</p>
        </div>
      )}
    </div>
  );
}
