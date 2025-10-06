'use client';

import React from 'react';
import { AlertCircle, Wifi, Server, ShieldAlert, FileX, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import Button from '@/components/atoms/Button';

interface UserError {
  title: string;
  message: string;
  action?: string;
  type: 'network' | 'server' | 'validation' | 'auth' | 'notfound' | 'unknown';
}

interface ErrorDisplayProps {
  error: UserError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

function getErrorIcon(type: UserError['type']) {
  switch (type) {
    case 'network':
      return <Wifi className="w-8 h-8 text-orange-500" />;
    case 'server':
      return <Server className="w-8 h-8 text-red-500" />;
    case 'auth':
      return <ShieldAlert className="w-8 h-8 text-yellow-500" />;
    case 'notfound':
      return <FileX className="w-8 h-8 text-gray-500" />;
    case 'validation':
      return <AlertCircle className="w-8 h-8 text-blue-500" />;
    default:
      return <HelpCircle className="w-8 h-8 text-gray-500" />;
  }
}

function getErrorColors(type: UserError['type']) {
  switch (type) {
    case 'network':
      return {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-800 dark:text-orange-200'
      };
    case 'server':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200'
      };
    case 'auth':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-200'
      };
    case 'notfound':
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-800 dark:text-gray-200'
      };
    case 'validation':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-800 dark:text-gray-200'
      };
  }
}

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '' 
}: ErrorDisplayProps) {
  const colors = getErrorColors(error.type);
  const icon = getErrorIcon(error.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        rounded-lg border p-6 ${colors.bg} ${colors.border} ${className}
      `}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg mb-2 ${colors.text}`}>
            {error.title}
          </h3>
          
          <p className={`text-sm leading-relaxed ${colors.text} mb-4`}>
            {error.message}
          </p>
          
          {error.action && (
            <p className={`text-xs font-medium ${colors.text} mb-4`}>
              Suggested action: {error.action}
            </p>
          )}
          
          <div className="flex items-center gap-3">
            {onRetry && (error.type === 'network' || error.type === 'server') && (
              <Button
                size="sm"
                onClick={onRetry}
                className="text-sm"
              >
                Try Again
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-sm"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Hook to manage error display state
 */
export function useErrorDisplay() {
  const [error, setError] = React.useState<UserError | null>(null);

  const showError = React.useCallback((userError: UserError) => {
    setError(userError);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    showError,
    clearError
  };
}