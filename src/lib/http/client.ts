import { ErrorMapper } from '../errors/mapper';
import { type AppError } from '../errors/types';
import { generateUUID } from '../utils/uuid';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retryable?: boolean;
  requiresIdempotency?: boolean;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export interface HttpError extends AppError {
  response?: Response;
}

/**
 * Centralized HTTP client with error mapping, timeouts, and controlled retry
 */
export class HttpClient {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly MAX_RETRIES = 1; // Only one retry allowed
  private static authRefreshInProgress = false;

  /**
   * Makes an HTTP request with error mapping and optional retry
   */
  static async request<T = unknown>(
    url: string, 
    config: RequestConfig = {}
  ): Promise<HttpResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.DEFAULT_TIMEOUT,
      retryable = method === 'GET',
      requiresIdempotency = ['POST', 'PUT', 'PATCH'].includes(method)
    } = config;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Prepare headers
      const requestHeaders = this.prepareHeaders(headers, requiresIdempotency);
      
      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
        body: body ? JSON.stringify(body) : undefined
      };

      // Make the request
      const response = await this.makeRequest<T>(url, requestOptions);
      
      // Clear timeout on success
      clearTimeout(timeoutId);
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Map error through centralized mapper
      const mappedError = ErrorMapper.mapError(error, { url, method });
      ErrorMapper.logError(mappedError, `HTTP ${method} ${url}`);

      // Handle 401 errors with refresh attempt
      if (mappedError.code === 'UNAUTHORIZED') {
        const refreshResult = await this.handleUnauthorized(url, config);
        if (refreshResult) {
          return refreshResult as HttpResponse<T>;
        }
      }

      // Handle retryable errors (only for GET requests)
      if (retryable && ErrorMapper.canAutoRetry(mappedError, method)) {
        try {
          const retryResponse = await this.makeRequest<T>(url, {
            method,
            headers: this.prepareHeaders(headers, requiresIdempotency),
            body: body ? JSON.stringify(body) : undefined
          });
          
          ErrorMapper.logError(mappedError, `HTTP ${method} ${url} - Retry succeeded`);
          return retryResponse;
        } catch (retryError) {
          // If retry fails, throw the original error
          ErrorMapper.logError(
            ErrorMapper.mapError(retryError, { url, method }),
            `HTTP ${method} ${url} - Retry failed`
          );
        }
      }

      // Throw the mapped error
      const httpError: HttpError = {
        ...mappedError,
        response: error instanceof Response ? error : undefined
      };
      throw httpError;
    }
  }

  /**
   * Makes the actual HTTP request
   */
  private static async makeRequest<T>(url: string, options: RequestInit): Promise<HttpResponse<T>> {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Let the error mapper handle the response
      throw response;
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let data: T;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as T;
    }

    return {
      data,
      status: response.status,
      headers: response.headers
    };
  }

  /**
   * Prepares request headers with auth and idempotency
   */
  private static prepareHeaders(
    customHeaders: Record<string, string>,
    requiresIdempotency: boolean
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // Add auth token if available
    const authToken = this.getAuthToken();
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Add idempotency key for write operations
    if (requiresIdempotency) {
      headers['Idempotency-Key'] = this.generateIdempotencyKey();
    }

    return headers;
  }

  /**
   * Handles 401 errors with a single refresh attempt
   */
  private static async handleUnauthorized<T>(
    url: string,
    config: RequestConfig
  ): Promise<HttpResponse<T> | null> {
    // Prevent multiple refresh attempts
    if (this.authRefreshInProgress) {
      return null;
    }

    this.authRefreshInProgress = true;

    try {
      // Attempt to refresh the token
      const refreshSuccess = await this.attemptTokenRefresh();
      
      if (refreshSuccess) {
        // Retry the original request once with new token
        const retryResponse = await this.request<T>(url, { ...config, retryable: false });
        return retryResponse;
      }
    } catch (refreshError) {
      ErrorMapper.logError(
        ErrorMapper.mapError(refreshError),
        'Token refresh failed'
      );
    } finally {
      this.authRefreshInProgress = false;
    }

    return null;
  }

  /**
   * Attempts to refresh the authentication token
   */
  private static async attemptTokenRefresh(): Promise<boolean> {
    try {
      // This would be implementation-specific
      // For now, we'll just return false to indicate no refresh capability
      // In a real app, this would call your auth refresh endpoint
      
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      // Example refresh logic (implement based on your auth system):
      // const response = await fetch('/api/auth/refresh', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ refreshToken })
      // });
      
      // if (response.ok) {
      //   const { accessToken } = await response.json();
      //   this.setAuthToken(accessToken);
      //   return true;
      // }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Gets auth token from storage (sessionStorage first, localStorage as legacy fallback)
   */
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  /**
   * Gets refresh token from storage
   */
  private static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem('refresh_token');
    } catch {
      return null;
    }
  }

  /**
   * Generates an idempotency key for write operations
   */
  private static generateIdempotencyKey(): string {
    return generateUUID();
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  static get<T>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  static post<T>(url: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body });
  }

  static put<T>(url: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body });
  }

  static patch<T>(url: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', body });
  }

  static delete<T>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}