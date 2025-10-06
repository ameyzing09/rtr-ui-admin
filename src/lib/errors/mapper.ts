import { type AppError, type ErrorCode, ERROR_MAPPING } from './types';

/**
 * Maps various error types to standardized AppError format
 */
export class ErrorMapper {
  /**
   * Maps any error to a standardized AppError
   */
  static mapError(error: unknown, context?: { url?: string; method?: string }): AppError {
    // Handle fetch/network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError('NETWORK', error, context);
    }

    // Handle AbortError (timeout/cancellation)
    if (error instanceof Error && error.name === 'AbortError') {
      return this.createError('TIMEOUT', error, context);
    }

    // Handle Response objects with status codes
    if (error instanceof Response) {
      return this.mapHttpResponseSync(error, context);
    }

    // Handle errors with status property (API client errors)
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number; message?: string };
      return this.mapHttpStatus(statusError.status, statusError.message || 'HTTP Error', context);
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      // Check for specific error messages that indicate network issues
      if (error.message.toLowerCase().includes('network') || 
          error.message.toLowerCase().includes('connection')) {
        return this.createError('NETWORK', error, context);
      }
      
      // Default to unknown for other errors
      return this.createError('UNKNOWN', error, context);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return this.createError('UNKNOWN', new Error(error), context);
    }

    // Handle completely unknown errors
    return this.createError('UNKNOWN', new Error('Unknown error occurred'), context);
  }

  /**
   * Maps HTTP Response to AppError (synchronous version)
   */
  private static mapHttpResponseSync(response: Response, context?: { url?: string; method?: string }): AppError {
    const errorMessage = `HTTP ${response.status} ${response.statusText}`;
    
    // For synchronous mapping, we can't read the response body
    // The HTTP client should handle response parsing and pass the parsed error
    return this.mapHttpStatus(response.status, errorMessage, context);
  }

  /**
   * Maps HTTP Response to AppError (async version for when response body is needed)
   */
  static async mapHttpResponseAsync(response: Response, context?: { url?: string; method?: string }): Promise<AppError> {
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    let correlationId: string | undefined;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        correlationId = errorData.correlationId || errorData.requestId;
      } else {
        const text = await response.text();
        if (text) errorMessage = text;
      }
    } catch {
      // If we can't parse the response, use the default message
    }

    return this.mapHttpStatus(response.status, errorMessage, context, correlationId);
  }

  /**
   * Maps HTTP status code to AppError
   */
  private static mapHttpStatus(
    status: number, 
    message: string, 
    context?: { url?: string; method?: string },
    correlationId?: string
  ): AppError {
    let code: ErrorCode = 'UNKNOWN';

    if (status === 0) {
      code = 'NETWORK';
    } else if (status === 401) {
      code = 'UNAUTHORIZED';
    } else if (status === 403) {
      code = 'FORBIDDEN';
    } else if (status === 404) {
      code = 'NOT_FOUND';
    } else if (status === 408) {
      code = 'TIMEOUT';
    } else if (status === 409) {
      code = 'CONFLICT';
    } else if (status === 422) {
      code = 'VALIDATION';
    } else if (status === 503) {
      code = 'MAINTENANCE';
    } else if (status >= 500) {
      code = 'SERVER';
    } else if (status >= 400) {
      code = 'VALIDATION'; // Other 4xx errors treated as validation
    }

    const baseError = ERROR_MAPPING[code];
    
    return {
      ...baseError,
      httpStatus: status,
      correlationId,
      details: {
        message,
        url: context?.url,
        method: context?.method,
        originalError: { status, message }
      }
    };
  }

  /**
   * Creates an AppError from an Error object
   */
  private static createError(
    code: ErrorCode, 
    error: Error, 
    context?: { url?: string; method?: string }
  ): AppError {
    const baseError = ERROR_MAPPING[code];
    
    return {
      ...baseError,
      details: {
        message: error.message,
        stack: error.stack,
        url: context?.url,
        method: context?.method,
        originalError: error
      }
    };
  }

  /**
   * Determines if an error should trigger an auth redirect
   */
  static shouldRedirectToAuth(error: AppError): boolean {
    return error.code === 'UNAUTHORIZED';
  }

  /**
   * Determines if an error is safe to retry automatically
   */
  static canAutoRetry(error: AppError, method: string = 'GET'): boolean {
    // Only GET requests can be auto-retried
    if (method.toUpperCase() !== 'GET') {
      return false;
    }

    return error.retryable;
  }

  /**
   * Logs error details for development (safe for production)
   */
  static logError(error: AppError, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${context || 'Application Error'}`);
      console.log('Code:', error.code);
      console.log('HTTP Status:', error.httpStatus);
      console.log('Retryable:', error.retryable);
      console.log('Correlation ID:', error.correlationId);
      console.log('Details:', error.details);
      console.log('User Message:', error.userMessage);
      console.groupEnd();
    } else {
      // In production, log minimal info
      console.log(`Error [${error.code}]:`, {
        correlationId: error.correlationId,
        httpStatus: error.httpStatus,
        context
      });
    }
  }
}