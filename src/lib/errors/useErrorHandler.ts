import { useCallback } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { mapApiError, isAuthError, type MappedError } from './errorMapper';
import { useRouter } from 'next/navigation';

/**
 * Error handler options
 */
interface HandleErrorOptions {
  /**
   * Default title to use if error doesn't provide one
   */
  defaultTitle?: string;

  /**
   * Callback to set field errors (for forms)
   */
  onFieldErrors?: (errors: Record<string, string>) => void;

  /**
   * Callback for retry action
   */
  onRetry?: () => void;

  /**
   * Whether to redirect to login on auth errors
   */
  redirectOnAuthError?: boolean;

  /**
   * Custom error handler (runs before default handling)
   */
  onError?: (error: unknown, mapped: MappedError) => void | boolean;
}

/**
 * Hook for unified error handling
 *
 * Provides a single function to handle errors consistently:
 * - Shows toast notifications
 * - Extracts and applies field errors
 * - Handles auth errors (optional redirect)
 * - Provides retry actions for transient errors
 *
 * @example
 * ```tsx
 * const handleError = useErrorHandler({
 *   onFieldErrors: setFieldErrors,
 *   onRetry: () => submitForm(),
 *   redirectOnAuthError: true,
 * });
 *
 * try {
 *   await createJob(data);
 * } catch (error) {
 *   handleError(error, 'Failed to create job');
 * }
 * ```
 */
export function useErrorHandler(options: HandleErrorOptions = {}) {
  const { addToast } = useToast();
  const router = useRouter();

  const handleError = useCallback(
    (error: unknown, defaultTitle?: string) => {
      console.error('Error occurred:', error);

      // Map error to UI format
      const mapped = mapApiError(error, defaultTitle || options.defaultTitle);

      // Call custom error handler if provided
      if (options.onError) {
        const shouldContinue = options.onError(error, mapped);
        if (shouldContinue === false) {
          return mapped; // Allow custom handler to prevent default handling
        }
      }

      // Handle field errors
      if (mapped.fieldErrors && options.onFieldErrors) {
        options.onFieldErrors(mapped.fieldErrors);
      }

      // Handle auth errors
      if (options.redirectOnAuthError && isAuthError(error)) {
        // Show error toast
        addToast({
          type: 'error',
          title: mapped.title,
          description: mapped.description || 'Please sign in to continue',
        });

        // Redirect to login
        router.push('/login');
        return mapped;
      }

      // Build toast action for retryable errors
      // Don't show retry button for rate limits (they have cooldown)
      const toastAction =
        mapped.retryable && options.onRetry && !mapped.rateLimit
          ? {
              label: 'Retry',
              onClick: options.onRetry,
            }
          : undefined;

      // Show toast notification
      addToast({
        type: mapped.variant,
        title: mapped.title,
        description: mapped.description,
        action: toastAction,
        duration: mapped.rateLimit ? 0 : undefined, // Don't auto-dismiss rate limit toasts
      });

      return mapped;
    },
    [addToast, router, options]
  );

  return handleError;
}

/**
 * Utility to create a retry action with toast
 */
export function useRetryableAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options: {
    successMessage?: { title: string; description?: string };
    errorMessage?: string;
    onFieldErrors?: (errors: Record<string, string>) => void;
  } = {}
) {
  const handleError = useErrorHandler({
    defaultTitle: options.errorMessage,
    onFieldErrors: options.onFieldErrors,
  });
  const { addToast } = useToast();

  const executeAction = useCallback(
    async (...args: Parameters<T>) => {
      try {
        const result = await action(...args);

        // Show success message if provided
        if (options.successMessage) {
          addToast({
            type: 'success',
            title: options.successMessage.title,
            description: options.successMessage.description,
          });
        }

        return result;
      } catch (error) {
        handleError(error, options.errorMessage);
        throw error; // Re-throw so caller can handle if needed
      }
    },
    [action, handleError, addToast, options]
  );

  return executeAction;
}
