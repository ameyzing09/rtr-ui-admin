import { z } from 'zod';
import { env } from '@/config/env';

// API Response schemas
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
    success: z.boolean(),
    meta: z.record(z.string(), z.unknown()).optional(),
  });

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
    success: z.boolean(),
  });

// Types
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
  meta?: Record<string, unknown>;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
};

// Custom error class
export class ApiException extends Error {
  public code?: string;
  public details?: Record<string, unknown>;
  public status?: number;

  constructor(message: string, code?: string, details?: Record<string, unknown>, status?: number) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

// Base fetcher configuration
export interface FetcherConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

class Fetcher {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: FetcherConfig = {}) {
    this.baseUrl = config.baseUrl || env.NEXT_PUBLIC_API_BASE_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
    this.timeout = config.timeout || 10000; // 10 seconds
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    responseSchema?: z.ZodType<T>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }

        const parsedError = apiErrorSchema.safeParse(errorData);
        const error = parsedError.success ? parsedError.data : { message: `HTTP ${response.status}` };
        
        throw new ApiException(
          error.message || `HTTP ${response.status}`,
          'code' in error ? error.code : undefined,
          'details' in error ? error.details : undefined,
          response.status
        );
      }

      const data = await response.json();

      if (responseSchema) {
        const parsed = responseSchema.safeParse(data);
        if (!parsed.success) {
          throw new ApiException(
            'Invalid response format',
            'INVALID_RESPONSE',
            { zodError: parsed.error }
          );
        }
        return parsed.data;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiException('Request timeout', 'TIMEOUT');
        }
        throw new ApiException(error.message, 'NETWORK_ERROR');
      }
      
      throw new ApiException('Unknown error occurred', 'UNKNOWN_ERROR');
    }
  }

  async get<T>(endpoint: string, responseSchema?: z.ZodType<T>): Promise<T> {
    return this.request(endpoint, { method: 'GET' }, responseSchema);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    responseSchema?: z.ZodType<T>
  ): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      responseSchema
    );
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    responseSchema?: z.ZodType<T>
  ): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      responseSchema
    );
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    responseSchema?: z.ZodType<T>
  ): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      responseSchema
    );
  }

  async delete<T>(endpoint: string, responseSchema?: z.ZodType<T>): Promise<T> {
    return this.request(endpoint, { method: 'DELETE' }, responseSchema);
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken() {
    delete this.defaultHeaders.Authorization;
  }

  // Update headers
  updateHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

// Default fetcher instance
export const fetcher = new Fetcher();

// Create authenticated fetcher with token
export function createAuthenticatedFetcher(token: string): Fetcher {
  const authFetcher = new Fetcher();
  authFetcher.setAuthToken(token);
  return authFetcher;
}
