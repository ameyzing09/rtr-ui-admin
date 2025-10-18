/**
 * Rate Limit Notice Component (H2)
 *
 * Displays rate limit information with countdown timer
 * Shows when user hits API rate limits (429 errors)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export interface RateLimitInfo {
  retryAfter: number; // Seconds until retry is allowed
  limit?: number; // Rate limit threshold
  remaining?: number; // Remaining requests
  resetAt?: Date; // When the limit resets
}

export interface RateLimitNoticeProps {
  /**
   * Rate limit information
   */
  rateLimit: RateLimitInfo;

  /**
   * Callback when cooldown expires
   */
  onCooldownExpired?: () => void;

  /**
   * Retry action
   */
  onRetry?: () => void;

  /**
   * Custom message (optional)
   */
  message?: string;

  /**
   * Variant
   */
  variant?: 'card' | 'inline' | 'banner';

  /**
   * Custom CSS classes
   */
  className?: string;
}

/**
 * Format seconds into human-readable time
 */
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Rate limit notice with countdown timer
 */
export function RateLimitNotice({
  rateLimit,
  onCooldownExpired,
  onRetry,
  message,
  variant = 'card',
  className = '',
}: RateLimitNoticeProps) {
  const [timeRemaining, setTimeRemaining] = useState(rateLimit.retryAfter);
  const [canRetry, setCanRetry] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      setCanRetry(true);
      onCooldownExpired?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setCanRetry(true);
          onCooldownExpired?.();
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onCooldownExpired]);

  const handleRetry = useCallback(() => {
    if (canRetry && onRetry) {
      onRetry();
    }
  }, [canRetry, onRetry]);

  const content = (
    <div className={`${className}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            {canRetry ? (
              <Clock className="h-6 w-6 text-yellow-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {canRetry ? 'Ready to Continue' : 'Rate Limit Reached'}
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            {canRetry
              ? 'The cooldown period has expired. You can now retry your request.'
              : message ||
                'You have made too many requests in a short period. Please wait before trying again.'}
          </p>

          {/* Countdown */}
          {!canRetry && (
            <div className="mt-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Time remaining: <span className="text-yellow-700">{formatTime(timeRemaining)}</span>
              </span>
            </div>
          )}

          {/* Rate limit details */}
          {rateLimit.limit && (
            <div className="mt-3 text-xs text-gray-500">
              Rate limit: {rateLimit.limit} requests
              {rateLimit.resetAt && (
                <> (resets at {new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(rateLimit.resetAt)})</>
              )}
            </div>
          )}

          {/* Progress bar */}
          {!canRetry && (
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-yellow-500 transition-all duration-1000 ease-linear"
                  style={{
                    width: `${((rateLimit.retryAfter - timeRemaining) / rateLimit.retryAfter) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Retry button */}
          {canRetry && onRetry && (
            <div className="mt-4">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (variant === 'card') {
    return <Card className="p-6">{content}</Card>;
  }

  if (variant === 'banner') {
    return (
      <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-6">
        {content}
      </div>
    );
  }

  // inline variant
  return <div className="p-6">{content}</div>;
}

/**
 * Compact rate limit notice (for toasts/inline use)
 */
export function CompactRateLimitNotice({
  rateLimit,
  onRetry,
}: {
  rateLimit: RateLimitInfo;
  onRetry?: () => void;
}) {
  const [timeRemaining, setTimeRemaining] = useState(rateLimit.retryAfter);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4 text-yellow-600" />
      <span>
        Retry in <strong className="font-semibold">{formatTime(timeRemaining)}</strong>
      </span>
    </div>
  );
}
