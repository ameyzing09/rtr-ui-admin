/**
 * HTTP Client Wrapper
 * 
 * Centralized HTTP client for making API requests with consistent
 * error handling, authentication, and request/response processing.
 */

import { z } from 'zod';
import { TIMEOUTS } from '@/config/limits';
import { env } from '@/config/env';

// Request configuration interface
export interface HttpConfig {
  baseUrl?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  credentials?: RequestCredentials;
}

// Error response schema
const errorResponseSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
  status: z.number().optional(),
});

// HTTP error class
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// HTTP request options
export interface HttpRequestOptions<T = unknown> extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  responseSchema?: z.ZodType<T>;
  baseUrl?: string;
}

// HTTP response type
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

// Create HTTP client class
export class HttpClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private credentials: RequestCredentials;

  constructor(config: HttpConfig = {}) {
    this.baseUrl = config.baseUrl || env.NEXT_PUBLIC_API_BASE_URL || '';
    this.timeout = config.timeout || TIMEOUTS.API_REQUEST;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
    this.credentials = config.credentials || 'same-origin';
  }

  // Build URL with query parameters
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>, baseUrl?: string): string {
    const base = baseUrl || this.baseUrl;
    const url = new URL(endpoint, base);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  // Process response
  private async processResponse<T = unknown>(
    response: Response,
    responseSchema?: z.ZodType<T>
  ): Promise<HttpResponse<T>> {
    let data: T;

    // Check if response has content
    const contentType = response.headers.get('content-type');
    const hasJsonContent = contentType && contentType.includes('application/json');

    if (hasJsonContent) {
      try {
        data = await response.json();
      } catch (error) {
        throw new HttpError(
          'Failed to parse JSON response',
          response.status,
          'PARSE_ERROR',
          error
        );
      }
    } else {
      // For non-JSON responses, return text
      data = (await response.text()) as T;
    }

    // Handle error responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorCode: string | undefined;
      let errorDetails: unknown;

      if (hasJsonContent) {
        const parsedError = errorResponseSchema.safeParse(data);
        if (parsedError.success) {
          errorMessage = parsedError.data.message;
          errorCode = parsedError.data.code;
          errorDetails = parsedError.data.details;
        }
      }

      throw new HttpError(errorMessage, response.status, errorCode, errorDetails);
    }

    // Validate response schema if provided
    if (responseSchema && hasJsonContent) {
      const validationResult = responseSchema.safeParse(data);
      if (!validationResult.success) {
        throw new HttpError(
          'Response validation failed',
          response.status,
          'VALIDATION_ERROR',
          validationResult.error
        );
      }
      data = validationResult.data;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  // Main request method
  private async request<T = unknown>(
    endpoint: string,
    options: HttpRequestOptions<T> = {}
  ): Promise<HttpResponse<T>> {
    const {
      params,
      timeout = this.timeout,
      responseSchema,
      baseUrl,
      headers = {},
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, params, baseUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        credentials: this.credentials,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.processResponse<T>(response, responseSchema);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new HttpError('Request timeout', 408, 'TIMEOUT');
        }
        
        throw new HttpError(
          error.message || 'Network request failed',
          0,
          'NETWORK_ERROR',
          error
        );
      }

      throw new HttpError('Unknown error occurred', 0, 'UNKNOWN_ERROR');
    }
  }

  // HTTP method shortcuts
  async get<T = unknown>(endpoint: string, options?: Omit<HttpRequestOptions<T>, 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: Omit<HttpRequestOptions<T>, 'method' | 'body'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    } as RequestInit & HttpRequestOptions<T>);
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: Omit<HttpRequestOptions<T>, 'method' | 'body'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    } as RequestInit & HttpRequestOptions<T>);
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: Omit<HttpRequestOptions<T>, 'method' | 'body'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    } as RequestInit & HttpRequestOptions<T>);
  }

  async delete<T = unknown>(endpoint: string, options?: Omit<HttpRequestOptions<T>, 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Convenience method for JSON data
  async getData<T = unknown>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const response = await this.get<T>(endpoint, { params });
    return response.data;
  }

  async postData<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.post<T>(endpoint, data);
    return response.data;
  }

  async putData<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.put<T>(endpoint, data);
    return response.data;
  }

  async patchData<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.patch<T>(endpoint, data);
    return response.data;
  }

  async deleteData<T = unknown>(endpoint: string): Promise<T> {
    const response = await this.delete<T>(endpoint);
    return response.data;
  }

  // Update configuration
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
}

// Create default HTTP client instance
export const httpClient = new HttpClient();

// Helper function to create authenticated client
export function createAuthenticatedClient(token: string, config?: HttpConfig): HttpClient {
  return new HttpClient({
    ...config,
    defaultHeaders: {
      ...config?.defaultHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
}

// Types are already exported inline above
