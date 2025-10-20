'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastDeduplicator } from '@/lib/errors/toastDeduplicator';
import { generateUUID } from '@/lib/utils/uuid';
import type { AppError } from '@/lib/errors/types';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    // De-duplication: Only show if not a duplicate (for error/info/warning)
    if (toast.type === 'error' || toast.type === 'info' || toast.type === 'warning') {
      // Create a proper AppError object for deduplication
      const errorLike: AppError = {
        code: toast.type === 'error' ? 'UNKNOWN' : toast.type === 'warning' ? 'VALIDATION' : 'UNKNOWN',
        userMessage: { 
          title: toast.title, 
          message: toast.description || '' 
        },
        retryable: false,
        details: { 
          message: toast.description || toast.title 
        }
      };
      if (!ToastDeduplicator.shouldShowToast(errorLike)) {
        return;
      }
    }

    const id = generateUUID();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts(current => {
      const updated = [newToast, ...current].slice(0, maxToasts);
      return updated;
    });

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [maxToasts, removeToast]);

  // Register global toast function
  React.useEffect(() => {
    registerGlobalToast(addToast);
    return () => {
      registerGlobalToast(() => {});
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 left-4 right-4 lg:left-auto lg:right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className={`
        pointer-events-auto w-full sm:w-96 border rounded-lg shadow-lg p-4
        ${colors[toast.type]}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          {toast.description && (
            <p className="mt-1 text-sm opacity-90">{toast.description}</p>
          )}
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Utility hook for common toast messages
export function useToastMessages() {
  const { addToast } = useToast();

  return {
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: 'warning', title, description }),
  };
}

// Singleton toast manager for imperative API
let globalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function registerGlobalToast(addToast: (toast: Omit<Toast, 'id'>) => void) {
  globalAddToast = addToast;
}

/**
 * Standalone toast function for use outside of React components
 * or when hooks are not available
 *
 * @example
 * ```ts
 * import { toast } from '@/components/ui/ToastProvider';
 *
 * toast({
 *   title: 'Success!',
 *   description: 'Job created successfully',
 *   variant: 'success',
 * });
 * ```
 */
export function toast(options: {
  title: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  if (!globalAddToast) {
    console.warn('Toast system not initialized. Make sure ToastProvider is mounted.');
    return;
  }

  const { variant = 'info', ...rest } = options;
  globalAddToast({
    type: variant,
    ...rest,
  });
}