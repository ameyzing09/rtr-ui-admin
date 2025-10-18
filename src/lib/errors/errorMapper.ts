import type { ApiException } from '@/lib/api/fetcher';
import type { ZodError } from 'zod';

/**
 * Standard error response format from backend
 * Backend returns: { statusCode, message, error }
 */
export interface BackendErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Field error type for forms
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Mapped error result for UI consumption
 */
export interface MappedError {
  title: string;
  description?: string;
  variant: 'error' | 'warning' | 'info';
  fieldErrors?: Record<string, string>;
  retryable: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
  /**
   * Rate limit information (for 429 errors)
   */
  rateLimit?: {
    retryAfter: number; // Seconds until retry is allowed
    limit?: number; // Rate limit threshold
    remaining?: number; // Remaining requests
    resetAt?: Date; // When the limit resets
  };
}

/**
 * Map HTTP status codes to user-friendly error titles
 */
function getErrorTitleFromStatus(status: number): string {
  const statusTitles: Record<number, string> = {
    400: 'Invalid Request',
    401: 'Authentication Required',
    403: 'Access Denied',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Validation Error',
    429: 'Too Many Requests',
    500: 'Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return statusTitles[status] || `Error (${status})`;
}

/**
 * Determine if an error is retryable based on status code
 */
function isRetryable(status?: number): boolean {
  if (!status) return false;

  // Retryable: Timeout, rate limit, server errors, network errors
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(status);
}

/**
 * Extract rate limit information from error details
 * Looks for Retry-After header or rate limit metadata
 */
function extractRateLimitInfo(
  status?: number,
  details?: Record<string, unknown>
): MappedError['rateLimit'] | undefined {
  if (status !== 429) return undefined;

  let retryAfter = 60; // Default to 60 seconds

  // Check for Retry-After in various formats
  if (details) {
    // Retry-After header (seconds)
    if (details.retryAfter && typeof details.retryAfter === 'number') {
      retryAfter = details.retryAfter;
    }
    // Retry-After header (date string)
    else if (details.retryAfter && typeof details.retryAfter === 'string') {
      const retryDate = new Date(details.retryAfter);
      if (!isNaN(retryDate.getTime())) {
        retryAfter = Math.max(0, Math.floor((retryDate.getTime() - Date.now()) / 1000));
      }
    }
    // X-RateLimit-Reset header (Unix timestamp)
    else if (details['x-ratelimit-reset']) {
      const resetTime = Number(details['x-ratelimit-reset']);
      if (!isNaN(resetTime)) {
        retryAfter = Math.max(0, Math.floor(resetTime - Date.now() / 1000));
      }
    }
  }

  return {
    retryAfter,
    limit: details?.['x-ratelimit-limit'] ? Number(details['x-ratelimit-limit']) : undefined,
    remaining: details?.['x-ratelimit-remaining']
      ? Number(details['x-ratelimit-remaining'])
      : undefined,
    resetAt: details?.['x-ratelimit-reset']
      ? new Date(Number(details['x-ratelimit-reset']) * 1000)
      : undefined,
  };
}

/**
 * Extract field errors from backend validation errors
 * Handles different backend error formats:
 * - { message: ["field1: error1", "field2: error2"] }
 * - { message: { field1: "error1", field2: "error2" } }
 * - { details: { fieldErrors: { field1: ["error1"], field2: ["error2"] } } }
 */
function extractFieldErrors(details?: Record<string, unknown>): Record<string, string> | undefined {
  if (!details) return undefined;

  const fieldErrors: Record<string, string> = {};

  // Format 1: details.fieldErrors = { field1: ["error1", "error2"], field2: ["error3"] }
  if (details.fieldErrors && typeof details.fieldErrors === 'object') {
    const errors = details.fieldErrors as Record<string, string | string[]>;
    Object.entries(errors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        fieldErrors[field] = messages.join(', ');
      } else if (typeof messages === 'string') {
        fieldErrors[field] = messages;
      }
    });
  }

  // Format 2: details.message is an array like ["title: Title is required", "email: Invalid email"]
  if (details.message && Array.isArray(details.message)) {
    details.message.forEach((msg: string) => {
      // Try to extract field name from message like "fieldName: error message"
      const match = msg.match(/^([a-zA-Z0-9_]+):\s*(.+)$/);
      if (match) {
        const [, field, error] = match;
        fieldErrors[field] = error;
      }
    });
  }

  // Format 3: details itself contains field: message pairs
  Object.entries(details).forEach(([key, value]) => {
    if (key !== 'fieldErrors' && key !== 'message' && typeof value === 'string') {
      fieldErrors[key] = value;
    }
  });

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

/**
 * Map API errors to UI-consumable format
 * Handles:
 * - ApiException from fetcher
 * - ZodError from validation
 * - Generic errors
 *
 * Returns object with toast configuration and field errors
 */
export function mapApiError(error: unknown, defaultTitle = 'Operation Failed'): MappedError {
  // Handle ApiException (from fetcher.ts)
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ApiException') {
    const apiError = error as ApiException;
    const status = apiError.status;
    const code = apiError.code;

    // Get user-friendly title
    const title = status ? getErrorTitleFromStatus(status) : defaultTitle;

    // Extract description from message
    let description = apiError.message || 'An unexpected error occurred';

    // Special handling for array messages from backend
    if (apiError.details?.message && Array.isArray(apiError.details.message)) {
      const messages = apiError.details.message as string[];
      description = messages.join('. ');
    }

    // Extract field errors for forms
    const fieldErrors = extractFieldErrors(apiError.details);

    // Determine if retryable
    const retryable = isRetryable(status);

    // Extract rate limit information (for 429 errors)
    const rateLimit = extractRateLimitInfo(status, apiError.details);

    // Build error variant
    let variant: 'error' | 'warning' | 'info' = 'error';
    if (status === 429) variant = 'warning'; // Rate limit
    if (status === 401 || status === 403) variant = 'warning'; // Auth issues

    // Special description for rate limits
    if (status === 429 && rateLimit) {
      const minutes = Math.ceil(rateLimit.retryAfter / 60);
      description = `Too many requests. Please wait ${
        rateLimit.retryAfter < 60
          ? `${rateLimit.retryAfter} seconds`
          : minutes === 1
          ? '1 minute'
          : `${minutes} minutes`
      } before trying again.`;
    }

    return {
      title,
      description,
      variant,
      fieldErrors,
      retryable,
      rateLimit,
    };
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    const zodError = error as ZodError;
    const fieldErrors: Record<string, string> = {};

    zodError.errors.forEach((err) => {
      const field = err.path.join('.');
      fieldErrors[field] = err.message;
    });

    return {
      title: 'Validation Error',
      description: 'Please check the form for errors',
      variant: 'error',
      fieldErrors,
      retryable: false,
    };
  }

  // Handle network/timeout errors
  if (error && typeof error === 'object' && 'code' in error) {
    const err = error as { code: string; message?: string };

    if (err.code === 'TIMEOUT') {
      return {
        title: 'Request Timeout',
        description: 'The request took too long to complete. Please try again.',
        variant: 'warning',
        retryable: true,
      };
    }

    if (err.code === 'NETWORK_ERROR') {
      return {
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        variant: 'error',
        retryable: true,
      };
    }
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return {
      title: defaultTitle,
      description: error.message || 'An unexpected error occurred',
      variant: 'error',
      retryable: false,
    };
  }

  // Fallback for unknown errors
  return {
    title: defaultTitle,
    description: 'An unexpected error occurred. Please try again.',
    variant: 'error',
    retryable: false,
  };
}

/**
 * Convert error code to user-friendly message
 * Useful for known backend error codes
 */
export function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    // Authentication errors
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action',

    // Validation errors
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_URL: 'Please enter a valid URL',

    // Business logic errors
    JOB_NOT_FOUND: 'The requested job could not be found',
    APPLICATION_NOT_FOUND: 'The requested application could not be found',
    DUPLICATE_APPLICATION: 'An application already exists for this job',

    // System errors
    DATABASE_ERROR: 'A database error occurred. Please try again.',
    EXTERNAL_SERVICE_ERROR: 'An external service error occurred. Please try again.',

    // Default
    UNKNOWN_ERROR: 'An unexpected error occurred',
  };

  return messages[code] || messages.UNKNOWN_ERROR;
}

/**
 * Check if error indicates user should re-authenticate
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('status' in error && (error.status === 401 || error.status === 403)) {
      return true;
    }
    if ('code' in error) {
      const code = (error as { code: string }).code;
      return code === 'UNAUTHORIZED' || code === 'TOKEN_EXPIRED';
    }
  }
  return false;
}

/**
 * Format field errors for form display
 * Converts Record<string, string> to array of FieldError objects
 */
export function formatFieldErrors(fieldErrors?: Record<string, string>): FieldError[] {
  if (!fieldErrors) return [];

  return Object.entries(fieldErrors).map(([field, message]) => ({
    field,
    message,
  }));
}
