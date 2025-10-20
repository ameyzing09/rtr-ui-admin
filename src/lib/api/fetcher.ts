import { z } from 'zod';
import { env, getLocalTenantId } from '@/config/env';
import { getOrCreateCsrfToken, CSRF_CONFIG } from '@/lib/security/csrf';
import { extractTenantIdFromToken } from '@/lib/utils/jwt';

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

export class Fetcher {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: FetcherConfig = {}) {
    // Use NEXT_PUBLIC_JOB_API_BASE_URL for job-application service
    // Fallback to NEXT_PUBLIC_API_BASE_URL for backward compatibility
    console.log('Initializing Fetcher with config:', config);
    this.baseUrl = config.baseUrl || env.NEXT_PUBLIC_JOB_API_BASE_URL || env.NEXT_PUBLIC_API_BASE_URL || '';
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

    const requestHeaders = { ...this.defaultHeaders };

    // In local dev mode, add tenant ID header for convenience (no signature needed)
    const localTenantId = getLocalTenantId();
    if (localTenantId && !requestHeaders['X-Tenant-ID']) {
      requestHeaders['X-Tenant-ID'] = localTenantId;
    }

    // Add CSRF token for state-changing requests (only in browser)
    const method = options.method?.toUpperCase() || 'GET';
    if (typeof window !== 'undefined' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      try {
        const csrfToken = getOrCreateCsrfToken();
        requestHeaders[CSRF_CONFIG.HEADER_NAME] = csrfToken;
      } catch (error) {
        console.warn('Failed to get CSRF token:', error);
        // Continue without CSRF token rather than failing the request
      }
    }

    // Verification logging (development only)
    if (env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const hasAuth = requestHeaders.Authorization?.startsWith('Bearer ');
      const hasTenantId = !!requestHeaders['X-Tenant-ID'];
      console.log(`[Fetcher] ${method} ${endpoint}`, {
        hasAuthToken: hasAuth,
        authTokenPreview: hasAuth ? requestHeaders.Authorization?.substring(0, 20) + '...' : 'MISSING',
        hasTenantId,
        tenantId: requestHeaders['X-Tenant-ID'] || 'N/A',
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
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

        // Handle backend validation errors where message is an array
        // e.g., { statusCode: 400, message: ["error1", "error2"], error: "Bad Request" }
        let errorMessage: string;
        let errorDetails: Record<string, unknown> | undefined;

        if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          if (Array.isArray(errorData.message)) {
            // Backend validation errors - message is an array
            errorMessage = errorData.message.join(', ') || `HTTP ${response.status}`;
            errorDetails = { message: errorData.message };

            // Also include any other fields from errorData
            Object.keys(errorData).forEach((key) => {
              if (key !== 'message' && errorData && typeof errorData === 'object' && key in errorData) {
                if (!errorDetails) errorDetails = {};
                errorDetails[key] = (errorData as Record<string, unknown>)[key];
              }
            });
          } else {
            // Standard error format
            const parsedError = apiErrorSchema.safeParse(errorData);
            const error = parsedError.success ? parsedError.data : { message: `HTTP ${response.status}` };
            errorMessage = error.message || `HTTP ${response.status}`;
            errorDetails = 'details' in error ? error.details : undefined;
          }
        } else {
          errorMessage = `HTTP ${response.status}`;
        }

        const errorCode = typeof errorData === 'object' && errorData !== null && 'code' in errorData
          ? (errorData.code as string)
          : undefined;

        throw new ApiException(
          errorMessage,
          errorCode,
          errorDetails,
          response.status
        );
      }

      // Check if response has content before trying to parse JSON
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');

      // If no content or content-length is 0, return empty object
      if (contentLength === '0' || response.status === 204) {
        return {} as T;
      }

      // Try to parse as JSON if content-type indicates JSON or we have content
      let data: T;
      try {
        const text = await response.text();
        if (!text || text.trim() === '') {
          // Empty response body
          data = {} as T;
        } else {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        // If JSON parsing fails, return empty object
        console.warn('Failed to parse response as JSON, returning empty object', parseError);
        data = {} as T;
      }

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

  // Set tenant ID in X-Tenant-ID header
  // Automatically used by createAuthenticatedFetcher() which extracts it from JWT
  setTenantId(tenantId: string) {
    this.defaultHeaders['X-Tenant-ID'] = tenantId;
  }

  removeTenantId() {
    delete this.defaultHeaders['X-Tenant-ID'];
  }

  // Get all default headers (for internal use)
  getHeaders(): Record<string, string> {
    return { ...this.defaultHeaders };
  }

  // Get a specific header value
  getHeader(name: string): string | undefined {
    return this.defaultHeaders[name];
  }

  // Update headers
  updateHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

// Default fetcher instance
export const fetcher = new Fetcher();

// Create authenticated fetcher with token
export function createAuthenticatedFetcher(token: string, config?: FetcherConfig): Fetcher {
  const authFetcher = new Fetcher(config);
  authFetcher.setAuthToken(token);

  // Automatically extract and set tenantId from JWT token
  // This ensures X-Tenant-ID header is included with all requests
  const extractedTenantId = extractTenantIdFromToken(token);
  if (extractedTenantId) {
    authFetcher.setTenantId(extractedTenantId);
    console.log('[createAuthenticatedFetcher] Automatically set X-Tenant-ID header from token');
  } else {
    console.warn('[createAuthenticatedFetcher] Could not extract tenantId from token');
  }

  return authFetcher;
}

// Token availability helpers
/**
 * Check if an Authorization header with Bearer token is set on the default fetcher instance
 * Note: This only checks for the presence of the Authorization header with 'Bearer ' prefix.
 * It does NOT validate JWT structure, signature, or expiration.
 * For full JWT validation, use the backend or a dedicated JWT validation library.
 * @returns true if Authorization header with 'Bearer ' prefix is set
 */
export function hasBearerToken(): boolean {
  return fetcher.getHeader('Authorization')?.startsWith('Bearer ') ?? false;
}

/**
 * Get the current JWT token from the default fetcher instance
 * @returns JWT token string or null if not set
 */
export function getToken(): string | null {
  const authHeader = fetcher.getHeader('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Check if the fetcher is configured for authenticated requests
 * Useful for protecting service calls that require authentication
 * Note: This only checks if a Bearer token header is present, not if it's valid
 */
export function isAuthenticated(): boolean {
  return hasBearerToken();
}

