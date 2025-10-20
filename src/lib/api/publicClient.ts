import { z } from 'zod';
import { getLocalTenantSubdomain } from '@/config/env';

/**
 * Public API Client
 * Handles unauthenticated requests to public endpoints
 * Tenant is identified via subdomain in Host header
 */

// Use Job-Application service for public APIs
const BASE_URL = process.env.NEXT_PUBLIC_JOB_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Public API Error
 */
export class PublicApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'PublicApiError';
  }
}

/**
 * Get tenant subdomain from request headers or environment
 * For local/dev: Uses NEXT_PUBLIC_TENANT_SUBDOMAIN or falls back to NEXT_PUBLIC_TENANT_ID
 * For production: Extracts from actual hostname (client-side) or Host header (server-side)
 *
 * Mirrors the pattern used by getLocalTenantId() in env.ts for consistency
 */
export function getTenantSubdomain(): string | null {
  // In local/dev environment, use environment variable
  const localSubdomain = getLocalTenantSubdomain();
  if (localSubdomain) {
    return localSubdomain;
  }

  // Production: Extract from hostname (client-side only)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Skip localhost and IP addresses (shouldn't happen in production)
    if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return null;
    }

    // Extract subdomain (first part before first dot)
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts[0];
    }
  }

  // Server-side in production: would need to extract from request headers
  // This is handled by Next.js middleware or server components
  return null;
}

/**
 * Build Host header for tenant identification
 */
function buildHostHeader(): string {
  const subdomain = getTenantSubdomain();
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';

  if (subdomain) {
    return `${subdomain}.${domain}`;
  }

  // Fallback for development
  return domain;
}

/**
 * Public API Client
 * No authentication required, uses Host header for tenant identification
 */
export const publicClient = {
  /**
   * GET request to public endpoint
   */
  async get<T>(
    path: string,
    schema: z.ZodSchema<T>,
    queryParams?: Record<string, string | number>
  ): Promise<T> {
    try {
      // Build URL with query params
      const url = new URL(path, BASE_URL);
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Host': buildHostHeader(),
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Disable caching for dynamic content
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new PublicApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.error
        );
      }

      const data = await response.json();
      return schema.parse(data);
    } catch (error) {
      if (error instanceof PublicApiError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new PublicApiError(
          'Invalid response format from server',
          500,
          'VALIDATION_ERROR'
        );
      }
      throw new PublicApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'UNKNOWN_ERROR'
      );
    }
  },

  /**
   * POST request to public endpoint
   */
  async post<T>(
    path: string,
    body: Record<string, unknown>,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    try {
      const url = new URL(path, BASE_URL);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Host': buildHostHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new PublicApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.error
        );
      }

      const data = await response.json();
      return schema.parse(data);
    } catch (error) {
      if (error instanceof PublicApiError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new PublicApiError(
          'Invalid response format from server',
          500,
          'VALIDATION_ERROR'
        );
      }
      throw new PublicApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'UNKNOWN_ERROR'
      );
    }
  },
};
