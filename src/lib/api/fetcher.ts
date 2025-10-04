import { z } from 'zod';
import { env, getTenantHeaders, isLocal } from '@/config/env';

// API Response base + schemas
export const baseApiEnvelopeSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  baseApiEnvelopeSchema.extend({
    data: dataSchema,
  });

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  baseApiEnvelopeSchema.extend({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

// Types
export type ApiError = z.infer<typeof apiErrorSchema>;
export type BaseApiEnvelope = z.infer<typeof baseApiEnvelopeSchema>;
export type ApiResponse<T> = BaseApiEnvelope & { data: T };

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = BaseApiEnvelope & {
  data: T[];
  pagination: Pagination;
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
    
    // In local environment, automatically set tenant headers from environment if available
    if (isLocal) {
      // Note: We can't use async/await in constructor, so we'll set headers in the request method
      // This is a placeholder for now
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    responseSchema?: z.ZodType<T>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Generate fresh tenant headers for each request in local environment
    const isLocalEnv = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';
    console.log('Environment check - isLocalEnv:', isLocalEnv);
    console.log('Environment check - NODE_ENV:', process.env.NODE_ENV);
    console.log('Environment check - NEXT_PUBLIC_LOCAL_MODE:', process.env.NEXT_PUBLIC_LOCAL_MODE);
    console.log('Environment check - NEXT_PUBLIC_TENANT_ID:', process.env.NEXT_PUBLIC_TENANT_ID);
    
    let requestHeaders = { ...this.defaultHeaders };
    
    if (isLocalEnv) {
      const tenantHeaders = await getTenantHeaders();
      console.log('getTenantHeaders result:', tenantHeaders);
      Object.entries(tenantHeaders).forEach(([key, value]) => {
        if (value) {
          requestHeaders[key] = value;
          console.log(`Set ${key} to:`, value);
        }
      });
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    console.log('requestHeaders', requestHeaders);
    console.log()
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...requestHeaders,
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

  setTenantId(tenantId: string) {
    this.defaultHeaders['X-Tenant-ID'] = tenantId;
  }

  setTenantTs(tenantTs: string) {
    this.defaultHeaders['X-Tenant-Ts'] = tenantTs;
  }

  setTenantSig(tenantSig: string) {
    this.defaultHeaders['X-Tenant-Sig'] = tenantSig;
  }

  setTenantHeaders(tenantId: string, tenantTs?: string, tenantSig?: string) {
    this.setTenantId(tenantId);
    if (tenantTs) this.setTenantTs(tenantTs);
    if (tenantSig) this.setTenantSig(tenantSig);
  }

  removeTenantId() {
    delete this.defaultHeaders['X-Tenant-ID'];
  }

  removeTenantTs() {
    delete this.defaultHeaders['X-Tenant-Ts'];
  }

  removeTenantSig() {
    delete this.defaultHeaders['X-Tenant-Sig'];
  }

  removeAllTenantHeaders() {
    delete this.defaultHeaders['X-Tenant-ID'];
    delete this.defaultHeaders['X-Tenant-Ts'];
    delete this.defaultHeaders['X-Tenant-Sig'];
  }

  // Update headers
  updateHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

// Default fetcher instance
export const fetcher = new Fetcher();

// Create authenticated fetcher with token
export async function createAuthenticatedFetcher(token: string, tenantId?: string): Promise<Fetcher> {
  const authFetcher = new Fetcher();
  authFetcher.setAuthToken(token);
  
  // Use provided tenantId, or fall back to environment tenant headers in local mode
  const isLocalEnv = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';
  
  if (tenantId) {
    // Use provided tenant ID
    authFetcher.setTenantId(tenantId);
  } else if (isLocalEnv) {
    // Use environment tenant headers
    const tenantHeaders = await getTenantHeaders();
    Object.entries(tenantHeaders).forEach(([key, value]) => {
      if (value) {
        if (key === 'X-Tenant-ID') {
          authFetcher.setTenantId(value);
        } else if (key === 'X-Tenant-Ts') {
          authFetcher.setTenantTs(value);
        } else if (key === 'X-Tenant-Sig') {
          authFetcher.setTenantSig(value);
        }
      }
    });
  }
  
  return authFetcher;
}

