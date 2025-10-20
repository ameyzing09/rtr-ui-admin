import { ApiException } from '@/lib/api/fetcher';

/**
 * Error categories for classifying different types of errors
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * User-friendly error information
 */
export interface UserFriendlyError {
  category: ErrorCategory;
  userMessage: string;
  userTitle: string;
  technicalDetails?: string;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Map HTTP status codes to error categories and messages
 */
function getErrorByStatus(status: number): { category: ErrorCategory; title: string; message: string } {
  switch (status) {
    case 400:
      return {
        category: ErrorCategory.VALIDATION,
        title: 'Invalid Request',
        message: 'The request could not be processed. Please check your input and try again.',
      };
    case 401:
      return {
        category: ErrorCategory.AUTHENTICATION,
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again.',
      };
    case 403:
      return {
        category: ErrorCategory.AUTHORIZATION,
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
      };
    case 404:
      return {
        category: ErrorCategory.NOT_FOUND,
        title: 'Not Found',
        message: 'The requested resource could not be found.',
      };
    case 409:
      return {
        category: ErrorCategory.CONFLICT,
        title: 'Conflict',
        message: 'The request conflicts with existing data. Please try again.',
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        category: ErrorCategory.SERVER_ERROR,
        title: 'Server Error',
        message: 'The server encountered an error. Please try again later.',
      };
    default:
      return {
        category: ErrorCategory.UNKNOWN,
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
      };
  }
}

/**
 * Classify and map errors to user-friendly messages
 */
export function classifyError(error: unknown): UserFriendlyError {
  // Handle ApiException
  if (error instanceof ApiException) {
    const isDev = process.env.NODE_ENV === 'development';

    // Log technical details in development
    if (isDev) {
      console.error('[Error Classification]', {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details,
      });
    }

    // Special handling for specific error codes
    if (error.code === 'TIMEOUT') {
      return {
        category: ErrorCategory.TIMEOUT,
        userMessage: 'The request took too long. Please check your connection and try again.',
        userTitle: 'Request Timeout',
        technicalDetails: error.message,
        retryable: true,
        statusCode: error.status,
      };
    }

    if (error.code === 'NETWORK_ERROR') {
      return {
        category: ErrorCategory.NETWORK_ERROR,
        userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
        userTitle: 'Connection Error',
        technicalDetails: error.message,
        retryable: true,
        statusCode: error.status,
      };
    }

    if (error.code === 'INVALID_RESPONSE') {
      return {
        category: ErrorCategory.SERVER_ERROR,
        userMessage: 'The server returned unexpected data. Please try again or contact support.',
        userTitle: 'Data Error',
        technicalDetails: isDev ? error.message : undefined,
        retryable: true,
        statusCode: error.status,
      };
    }

    // Use HTTP status code to determine error
    if (error.status) {
      const statusError = getErrorByStatus(error.status);
      return {
        category: statusError.category,
        userMessage: statusError.message,
        userTitle: statusError.title,
        technicalDetails: isDev ? `${error.message}` : undefined,
        retryable: error.status >= 500 || error.status === 408 || error.status === 429,
        statusCode: error.status,
      };
    }

    // Fallback
    return {
      category: ErrorCategory.UNKNOWN,
      userMessage: 'An unexpected error occurred. Please try again.',
      userTitle: 'Error',
      technicalDetails: isDev ? error.message : undefined,
      retryable: true,
    };
  }

  // Handle standard Error
  if (error instanceof Error) {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      console.error('[Error Classification]', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    return {
      category: ErrorCategory.UNKNOWN,
      userMessage: 'An unexpected error occurred. Please try again.',
      userTitle: 'Error',
      technicalDetails: isDev ? error.message : undefined,
      retryable: true,
    };
  }

  // Unknown error type
  console.error('[Error Classification] Unknown error type:', error);
  return {
    category: ErrorCategory.UNKNOWN,
    userMessage: 'An unexpected error occurred. Please try again.',
    userTitle: 'Error',
    retryable: true,
  };
}

/**
 * Get user-friendly message for specific action context
 */
export function getContextualErrorMessage(
  error: UserFriendlyError,
  context: 'list' | 'view' | 'create' | 'update' | 'delete' | 'reset_password' | 'change_password'
): string {
  // Override messages based on context
  const contextMessages: Record<typeof context, Record<ErrorCategory, string>> = {
    list: {
      [ErrorCategory.VALIDATION]: 'Unable to list items with the current filters. Please adjust and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to view this list.',
      [ErrorCategory.SERVER_ERROR]: 'Unable to load the list. Please try again later.',
      [ErrorCategory.NETWORK_ERROR]: 'Cannot connect to the server. Please check your connection.',
      [ErrorCategory.TIMEOUT]: 'The request took too long. Please try again.',
      [ErrorCategory.NOT_FOUND]: 'The requested list could not be found.',
      [ErrorCategory.CONFLICT]: 'There was a conflict. Please try again.',
      [ErrorCategory.UNKNOWN]: 'Unable to complete this action. Please try again.',
    },
    view: {
      [ErrorCategory.VALIDATION]: 'The request was invalid. Please try again.',
      [ErrorCategory.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to view this.',
      [ErrorCategory.SERVER_ERROR]: 'Unable to load the details. Please try again later.',
      [ErrorCategory.NETWORK_ERROR]: 'Cannot connect to the server. Please check your connection.',
      [ErrorCategory.TIMEOUT]: 'The request took too long. Please try again.',
      [ErrorCategory.NOT_FOUND]: 'The requested item could not be found.',
      [ErrorCategory.CONFLICT]: 'There was a conflict. Please try again.',
      [ErrorCategory.UNKNOWN]: 'Unable to complete this action. Please try again.',
    },
    create: {
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to create this.',
      [ErrorCategory.SERVER_ERROR]: 'Unable to create this item. Please try again later.',
      [ErrorCategory.NETWORK_ERROR]: 'Cannot connect to the server. Please check your connection.',
      [ErrorCategory.TIMEOUT]: 'The request took too long. Please try again.',
      [ErrorCategory.NOT_FOUND]: 'A required resource could not be found.',
      [ErrorCategory.CONFLICT]: 'This item already exists. Please try with different details.',
      [ErrorCategory.UNKNOWN]: 'Unable to complete this action. Please try again.',
    },
    update: {
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to update this.',
      [ErrorCategory.SERVER_ERROR]: 'Unable to update this item. Please try again later.',
      [ErrorCategory.NETWORK_ERROR]: 'Cannot connect to the server. Please check your connection.',
      [ErrorCategory.TIMEOUT]: 'The request took too long. Please try again.',
      [ErrorCategory.NOT_FOUND]: 'The item you are trying to update could not be found.',
      [ErrorCategory.CONFLICT]: 'The item has been modified. Please refresh and try again.',
      [ErrorCategory.UNKNOWN]: 'Unable to complete this action. Please try again.',
    },
    delete: {
      [ErrorCategory.VALIDATION]: 'Cannot delete this item. Please try again.',
      [ErrorCategory.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to delete this.',
      [ErrorCategory.SERVER_ERROR]: 'Unable to delete this item. Please try again later.',
      [ErrorCategory.NETWORK_ERROR]: 'Cannot connect to the server. Please check your connection.',
      [ErrorCategory.TIMEOUT]: 'The request took too long. Please try again.',
      [ErrorCategory.NOT_FOUND]: 'The item you are trying to delete could not be found.',
      [ErrorCategory.CONFLICT]: 'Cannot delete this item. It may be in use.',
      [ErrorCategory.UNKNOWN]: 'Unable to complete this action. Please try again.',
    },
    reset_password: {
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to reset passwords.',
      [ErrorCategory.SERVER_ERROR]: 'Unable to reset the password. Please try again later.',
      [ErrorCategory.NETWORK_ERROR]: 'Cannot connect to the server. Please check your connection.',
      [ErrorCategory.TIMEOUT]: 'The request took too long. Please try again.',
      [ErrorCategory.NOT_FOUND]: 'The user could not be found.',
      [ErrorCategory.CONFLICT]: 'Cannot reset password at this time. Please try again.',
      [ErrorCategory.UNKNOWN]: 'Unable to reset the password. Please try again.',
    },
    change_password: {
      [ErrorCategory.VALIDATION]: 'Password does not meet requirements. Please check and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to change this password.',
      [ErrorCategory.SERVER_ERROR]: 'Unable to change the password. Please try again later.',
      [ErrorCategory.NETWORK_ERROR]: 'Cannot connect to the server. Please check your connection.',
      [ErrorCategory.TIMEOUT]: 'The request took too long. Please try again.',
      [ErrorCategory.NOT_FOUND]: 'The user account could not be found.',
      [ErrorCategory.CONFLICT]: 'Cannot change password at this time. Please try again.',
      [ErrorCategory.UNKNOWN]: 'Unable to change the password. Please try again.',
    },
  };

  return contextMessages[context][error.category] || error.userMessage;
}
