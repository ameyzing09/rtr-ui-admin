import { createAuthenticatedFetcher } from '@/lib/api/fetcher';
import { env } from '@/config/env';
import {
  tenantStatusListResponseSchema,
  tenantStatusResponseSchema,
  type TenantStatus,
  type CreateTenantStatusRequest,
  type UpdateTenantStatusRequest,
} from './schemas';

// ============================================================================
// Error Classes
// ============================================================================

export class TenantStatusApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TenantStatusApiError';
  }
}

// ============================================================================
// Tenant Status Service
// ============================================================================

/**
 * Service for managing tenant-specific application statuses
 */
class TenantStatusService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_TRACKING_API_BASE_URL || env.NEXT_PUBLIC_JOB_API_BASE_URL || '';
    console.log('[TenantStatusService] Initialized with baseUrl:', this.baseUrl);
  }

  /**
   * List all statuses for the tenant
   */
  async listStatuses(token: string): Promise<TenantStatus[]> {
    const url = '/settings/statuses';
    console.log('[TenantStatusService] listStatuses:', { baseUrl: this.baseUrl, url });

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get(url, tenantStatusListResponseSchema);
      console.log('[TenantStatusService] listStatuses success:', { count: response.data.length });
      return response.data;
    } catch (error) {
      console.error('[TenantStatusService] listStatuses error:', error);
      throw this.handleError(error, 'Failed to fetch statuses');
    }
  }

  /**
   * Create a new status
   */
  async createStatus(token: string, data: CreateTenantStatusRequest): Promise<TenantStatus> {
    const url = '/settings/statuses';
    console.log('[TenantStatusService] createStatus:', { baseUrl: this.baseUrl, url, data });

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.post(url, data, tenantStatusResponseSchema);
      console.log('[TenantStatusService] createStatus success:', response);
      return response;
    } catch (error) {
      console.error('[TenantStatusService] createStatus error:', error);
      throw this.handleError(error, 'Failed to create status');
    }
  }

  /**
   * Update an existing status
   */
  async updateStatus(
    token: string,
    statusId: string,
    data: UpdateTenantStatusRequest
  ): Promise<TenantStatus> {
    const url = `/settings/statuses/${statusId}`;
    console.log('[TenantStatusService] updateStatus:', { baseUrl: this.baseUrl, url, statusId, data });

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.patch(url, data, tenantStatusResponseSchema);
      console.log('[TenantStatusService] updateStatus success:', response);
      return response;
    } catch (error) {
      console.error('[TenantStatusService] updateStatus error:', error);
      throw this.handleError(error, 'Failed to update status');
    }
  }

  /**
   * Delete a status
   */
  async deleteStatus(token: string, statusId: string): Promise<void> {
    const url = `/settings/statuses/${statusId}`;
    console.log('[TenantStatusService] deleteStatus:', { baseUrl: this.baseUrl, url, statusId });

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      await authFetcher.delete(url);
      console.log('[TenantStatusService] deleteStatus success');
    } catch (error) {
      console.error('[TenantStatusService] deleteStatus error:', error);
      throw this.handleError(error, 'Failed to delete status');
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown, defaultMessage: string): TenantStatusApiError {
    if (error instanceof TenantStatusApiError) {
      return error;
    }

    // Handle API errors with code
    if (error && typeof error === 'object' && 'code' in error) {
      const apiError = error as { message?: string; code?: string; status?: number };
      return new TenantStatusApiError(
        apiError.message || defaultMessage,
        apiError.status || 500,
        apiError.code
      );
    }

    if (error instanceof Error) {
      return new TenantStatusApiError(error.message, 500, 'TENANT_STATUS_ERROR');
    }

    return new TenantStatusApiError(defaultMessage, 500, 'TENANT_STATUS_ERROR');
  }
}

export const tenantStatusService = new TenantStatusService();
