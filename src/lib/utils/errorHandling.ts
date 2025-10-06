/**
 * User-centric error handling utilities for tenant management
 * Maps technical errors to user-friendly messages
 */

export interface UserError {
  title: string;
  message: string;
  action?: string;
  type: 'network' | 'server' | 'validation' | 'auth' | 'notfound' | 'unknown';
}

/**
 * Maps common HTTP status codes to user-friendly error messages
 */
const STATUS_CODE_MESSAGES: Record<number, UserError> = {
  // Network/Connectivity Issues
  0: {
    title: 'Connection Failed',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    action: 'Check your connection and retry',
    type: 'network'
  },

  // Client Errors (4xx)
  400: {
    title: 'Invalid Request',
    message: 'The information provided is invalid. Please check your input and try again.',
    action: 'Review and correct the form data',
    type: 'validation'
  },
  401: {
    title: 'Authentication Required',
    message: 'Your session has expired. Please log in again to continue.',
    action: 'Log in again',
    type: 'auth'
  },
  403: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action. Contact your administrator if you believe this is an error.',
    action: 'Contact administrator',
    type: 'auth'
  },
  404: {
    title: 'Not Found',
    message: 'The requested tenant could not be found. It may have been deleted or moved.',
    action: 'Return to tenant list',
    type: 'notfound'
  },
  409: {
    title: 'Conflict',
    message: 'This action conflicts with existing data. The tenant name or domain may already exist.',
    action: 'Try with different values',
    type: 'validation'
  },
  422: {
    title: 'Validation Error',
    message: 'The provided data failed validation. Please check the required fields and formats.',
    action: 'Review and correct the data',
    type: 'validation'
  },
  429: {
    title: 'Too Many Requests',
    message: 'You\'re making requests too quickly. Please wait a moment and try again.',
    action: 'Wait a moment and retry',
    type: 'server'
  },

  // Server Errors (5xx)
  500: {
    title: 'Server Error',
    message: 'An internal server error occurred. Our team has been notified and is working on a fix.',
    action: 'Try again later',
    type: 'server'
  },
  502: {
    title: 'Service Unavailable',
    message: 'The server is temporarily unavailable. This is usually resolved quickly.',
    action: 'Try again in a few minutes',
    type: 'server'
  },
  503: {
    title: 'Service Unavailable',
    message: 'The service is temporarily down for maintenance. Please try again later.',
    action: 'Try again later',
    type: 'server'
  },
  504: {
    title: 'Request Timeout',
    message: 'The server took too long to respond. This might be due to high traffic.',
    action: 'Try again in a moment',
    type: 'server'
  }
};

/**
 * Maps specific error codes from the backend to user-friendly messages
 */
const ERROR_CODE_MESSAGES: Record<string, UserError> = {
  // Tenant-specific errors
  'TENANT_NOT_FOUND': {
    title: 'Tenant Not Found',
    message: 'The tenant you\'re looking for doesn\'t exist or has been removed.',
    action: 'Return to tenant list',
    type: 'notfound'
  },
  'TENANT_ALREADY_EXISTS': {
    title: 'Tenant Already Exists',
    message: 'A tenant with this name or domain already exists. Please choose a different name or domain.',
    action: 'Use a different name or domain',
    type: 'validation'
  },
  'DOMAIN_ALREADY_EXISTS': {
    title: 'Domain Already Taken',
    message: 'This domain is already being used by another tenant. Please choose a different domain.',
    action: 'Choose a different domain',
    type: 'validation'
  },
  'INVALID_DOMAIN_FORMAT': {
    title: 'Invalid Domain Format',
    message: 'The domain format is invalid. Use only letters, numbers, and hyphens.',
    action: 'Fix the domain format',
    type: 'validation'
  },
  'TENANT_NOT_ACTIVE': {
    title: 'Tenant Not Active',
    message: 'This tenant is not currently active. Some operations may be restricted.',
    action: 'Contact administrator',
    type: 'validation'
  },
  'SUBSCRIPTION_REQUIRED': {
    title: 'Subscription Required',
    message: 'A valid subscription is required to perform this action.',
    action: 'Check subscription status',
    type: 'validation'
  },
  'RATE_LIMIT_EXCEEDED': {
    title: 'Rate Limit Exceeded',
    message: 'You\'re making too many requests. Please slow down and try again.',
    action: 'Wait and try again',
    type: 'server'
  },
  'INSUFFICIENT_PERMISSIONS': {
    title: 'Insufficient Permissions',
    message: 'You don\'t have the required permissions to perform this action.',
    action: 'Contact administrator',
    type: 'auth'
  }
};

/**
 * Determines if an error is a network connectivity issue
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true;
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') ||
           message.includes('connection') ||
           message.includes('cors');
  }
  
  return false;
}

/**
 * Extracts error information from various error types
 */
function extractErrorInfo(error: unknown): { status?: number; code?: string; message: string } {
  // Network errors (fetch failures)
  if (isNetworkError(error)) {
    return { status: 0, message: 'Network connection failed' };
  }

  // TenantApiError (custom API errors)
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as { status: number; code?: string; message: string };
    return {
      status: apiError.status,
      code: apiError.code,
      message: apiError.message
    };
  }

  // Standard Error objects
  if (error instanceof Error) {
    return { message: error.message };
  }

  // String errors
  if (typeof error === 'string') {
    return { message: error };
  }

  // Unknown error types
  return { message: 'An unexpected error occurred' };
}

/**
 * Converts technical errors into user-friendly error messages
 */
export function createUserError(error: unknown): UserError {
  const { status, code, message } = extractErrorInfo(error);

  // First, try to match by specific error code
  if (code && ERROR_CODE_MESSAGES[code]) {
    return ERROR_CODE_MESSAGES[code];
  }

  // Then, try to match by HTTP status code
  if (status !== undefined && STATUS_CODE_MESSAGES[status]) {
    return STATUS_CODE_MESSAGES[status];
  }

  // For validation errors, try to extract field-specific messages
  if (status === 400 || status === 422) {
    // Try to parse validation error message
    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return {
        title: 'Validation Error',
        message: message,
        action: 'Please correct the highlighted fields',
        type: 'validation'
      };
    }
  }

  // Network connectivity issues
  if (status === 0 || isNetworkError(error)) {
    return {
      title: 'Connection Problem',
      message: 'Unable to reach the server. Please check your internet connection and try again.',
      action: 'Check connection and retry',
      type: 'network'
    };
  }

  // Generic server error for 5xx status codes
  if (status && status >= 500) {
    return {
      title: 'Server Error',
      message: 'The server encountered an error. Please try again in a few moments.',
      action: 'Try again later',
      type: 'server'
    };
  }

  // Fallback for unknown errors
  return {
    title: 'Unexpected Error',
    message: message || 'Something went wrong. Please try again.',
    action: 'Retry the operation',
    type: 'unknown'
  };
}

/**
 * Creates a user-friendly error message for display in the UI
 */
export function formatUserErrorMessage(error: unknown): string {
  const userError = createUserError(error);
  
  let message = userError.message;
  if (userError.action) {
    message += ` ${userError.action}.`;
  }
  
  return message;
}

/**
 * Determines if an error should trigger a redirect to login
 */
export function shouldRedirectToLogin(error: unknown): boolean {
  const { status, code } = extractErrorInfo(error);
  return status === 401 || code === 'UNAUTHORIZED' || code === 'TOKEN_EXPIRED';
}

/**
 * Determines if an error should redirect to a different page
 */
export function getErrorRedirectPath(error: unknown): string | null {
  const { status, code } = extractErrorInfo(error);
  
  if (status === 401 || code === 'UNAUTHORIZED') {
    return '/login';
  }
  
  if (status === 404 || code === 'TENANT_NOT_FOUND') {
    return '/sa/tenants';
  }
  
  return null;
}