import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AppError } from '@/lib/errors/types';

interface ErrorBannerProps {
  error: AppError;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ error, onRetry, className }: ErrorBannerProps) {
  return (
    <div className={`bg-red-50 border border-red-200 text-red-900 rounded-lg p-4 flex items-start gap-3 ${className || ''}`.trim()} role="alert">
      <AlertTriangle className="w-5 h-5 mt-1 text-red-500 shrink-0" />
      <div className="flex-1">
        <div className="font-semibold text-base">{error.userMessage.title}</div>
        <div className="text-sm mb-1">{error.userMessage.message}</div>
        {error.correlationId && (
          <div className="text-xs text-gray-500 mt-1">Ref: {error.correlationId}</div>
        )}
        {onRetry && error.retryable && (
          <button
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-medium"
            onClick={onRetry}
          >
            {error.userMessage.action || 'Retry'}
          </button>
        )}
      </div>
    </div>
  );
}
