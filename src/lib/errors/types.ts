/**
 * Central error handling types for the application
 */

export type ErrorCode = 
  | 'NETWORK'
  | 'TIMEOUT' 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'SERVER'
  | 'MAINTENANCE'
  | 'UNKNOWN';

export interface AppError {
  /** Error classification for handling logic */
  code: ErrorCode;
  /** HTTP status code if applicable */
  httpStatus?: number;
  /** Whether this error can be safely retried */
  retryable: boolean;
  /** Correlation ID from backend if available */
  correlationId?: string;
  /** Technical details for logging (never shown to users) */
  details: {
    message: string;
    stack?: string;
    originalError?: unknown;
    url?: string;
    method?: string;
  };
  /** User-friendly error information */
  userMessage: {
    title: string;
    message: string;
    action?: string;
  };
}

/**
 * Error mapping configuration for different error types
 */
export const ERROR_MAPPING: Record<ErrorCode, Omit<AppError, 'details' | 'correlationId'>> = {
  NETWORK: {
    code: 'NETWORK',
    retryable: true,
    userMessage: {
      title: 'Connection Problem',
      message: "Can't reach the server right now. Please check your connection and try again.",
      action: 'Retry'
    }
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    httpStatus: 408,
    retryable: true,
    userMessage: {
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      action: 'Retry'
    }
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    httpStatus: 401,
    retryable: false,
    userMessage: {
      title: 'Session Expired',
      message: 'Your session has expired. Please sign in again to continue.',
      action: 'Sign In'
    }
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    httpStatus: 403,
    retryable: false,
    userMessage: {
      title: 'Access Denied',
      message: "You don't have permission to perform this action. Contact your administrator if needed.",
      action: 'Go Back'
    }
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    httpStatus: 404,
    retryable: false,
    userMessage: {
      title: 'Not Found',
      message: 'The requested resource could not be found. It may have been moved or deleted.',
      action: 'Go Back'
    }
  },
  VALIDATION: {
    code: 'VALIDATION',
    httpStatus: 422,
    retryable: false,
    userMessage: {
      title: 'Invalid Information',
      message: 'Please check your input and correct any errors before continuing.',
      action: 'Review Form'
    }
  },
  CONFLICT: {
    code: 'CONFLICT',
    httpStatus: 409,
    retryable: false,
    userMessage: {
      title: 'Conflict',
      message: 'This action conflicts with existing data. Please check and try again.',
      action: 'Review Changes'
    }
  },
  SERVER: {
    code: 'SERVER',
    httpStatus: 500,
    retryable: true,
    userMessage: {
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again in a moment.',
      action: 'Retry'
    }
  },
  MAINTENANCE: {
    code: 'MAINTENANCE',
    httpStatus: 503,
    retryable: true,
    userMessage: {
      title: 'Service Unavailable',
      message: 'The service is temporarily unavailable for maintenance. Please try again later.',
      action: 'Try Later'
    }
  },
  UNKNOWN: {
    code: 'UNKNOWN',
    retryable: false,
    userMessage: {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Please refresh the page or try again.',
      action: 'Refresh Page'
    }
  }
};