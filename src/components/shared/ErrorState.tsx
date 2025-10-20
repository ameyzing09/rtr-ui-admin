/**
 * Error State Components (F2)
 *
 * Reusable error state components with retry functionality
 * - Generic error state
 * - Network error state
 * - Not found error state
 * - Permission denied state
 */

import { AlertCircle, RefreshCw, Wifi, Lock, FileQuestion } from 'lucide-react';
import Card from '@/components/ui/Card';

export interface ErrorStateProps {
  /**
   * Error title
   */
  title: string;

  /**
   * Error description/message
   */
  description?: string;

  /**
   * Retry callback
   */
  onRetry?: () => void;

  /**
   * Custom action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Icon to display
   */
  icon?: 'error' | 'network' | 'notfound' | 'permission';

  /**
   * Whether to show the error in a card or inline
   */
  variant?: 'card' | 'inline' | 'fullpage';

  /**
   * Custom CSS classes
   */
  className?: string;
}

/**
 * Generic error state component with retry functionality
 */
export function ErrorState({
  title,
  description,
  onRetry,
  action,
  icon = 'error',
  variant = 'card',
  className = '',
}: ErrorStateProps) {
  const icons = {
    error: AlertCircle,
    network: Wifi,
    notfound: FileQuestion,
    permission: Lock,
  };

  const iconColors = {
    error: 'text-red-500',
    network: 'text-orange-500',
    notfound: 'text-gray-500',
    permission: 'text-yellow-600',
  };

  const Icon = icons[icon];
  const iconColor = iconColors[icon];

  const content = (
    <div className={`text-center ${className}`}>
      {/* Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>

      {/* Title */}
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>

      {/* Description */}
      {description && <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">{description}</p>}

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}

        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className="p-12">
        {content}
      </Card>
    );
  }

  if (variant === 'fullpage') {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-12">
        {content}
      </div>
    );
  }

  // inline variant
  return <div className="p-6">{content}</div>;
}

/**
 * Network error state (for transient failures)
 */
export function NetworkErrorState({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorState
      icon="network"
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      variant="card"
      className={className}
    />
  );
}

/**
 * Not found error state
 */
export function NotFoundState({
  resourceName = 'Resource',
  onGoBack,
  className,
}: {
  resourceName?: string;
  onGoBack?: () => void;
  className?: string;
}) {
  return (
    <ErrorState
      icon="notfound"
      title={`${resourceName} Not Found`}
      description={`The ${resourceName.toLowerCase()} you're looking for doesn't exist or has been removed.`}
      action={
        onGoBack
          ? {
              label: 'Go Back',
              onClick: onGoBack,
            }
          : undefined
      }
      variant="fullpage"
      className={className}
    />
  );
}

/**
 * Permission denied error state
 */
export function PermissionDeniedState({
  action,
  className,
}: {
  action?: string;
  className?: string;
}) {
  return (
    <ErrorState
      icon="permission"
      title="Permission Denied"
      description={
        action
          ? `You don't have permission to ${action}. Please contact your administrator if you believe this is an error.`
          : "You don't have permission to access this resource. Please contact your administrator if you believe this is an error."
      }
      variant="fullpage"
      className={className}
    />
  );
}

/**
 * Empty state component (for lists with no data)
 */
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'card' | 'inline' | 'fullpage';
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: CustomIcon,
  action,
  variant = 'card',
  className = '',
}: EmptyStateProps) {
  const content = (
    <div className={`text-center ${className}`}>
      {/* Icon */}
      {CustomIcon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <CustomIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* Title */}
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>

      {/* Description */}
      {description && <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">{description}</p>}

      {/* Action */}
      {action && (
        <div className="mt-6">
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className="p-12">
        {content}
      </Card>
    );
  }

  if (variant === 'fullpage') {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-12">
        {content}
      </div>
    );
  }

  // inline variant
  return <div className="p-6">{content}</div>;
}
