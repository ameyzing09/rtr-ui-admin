import 'server-only';

import { assertPermission, type UserSession } from '@/lib/rbac/guard';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { generateUUID } from '@/lib/utils/uuid';
import { auditTenantCreate, auditTenantUpdate, auditTenantDelete } from './audit';
import {
  createTenantRequestSchema,
  updateTenantRequestSchema,
  type CreateTenantRequest,
  type CreateTenantResponse,
  type TenantListResponse,
  type TenantListParams,
  type TenantStatusResponse,
  type TenantDetail,
  type UpdateTenantRequest,
  type Subscription
} from './schemas';

/**
 * Custom error class for Tenant API errors
 */
export class TenantApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TenantApiError';
  }
}

/**
 * TenantService - Server-only business logic for tenant operations
 *
 * This is the single source of truth for:
 * - External API URLs
 * - RBAC permission checks
 * - Business validation
 * - Audit logging
 *
 * All tenant operations MUST go through this service.
 */
export class TenantService {
  private readonly baseUrl: string;

  constructor() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      throw new Error(
        'NEXT_PUBLIC_API_BASE_URL environment variable is required. ' +
        'Set it in .env.local for development or configure it in your deployment environment.'
      );
    }

    this.baseUrl = apiBaseUrl;
  }

  /**
   * Make a request to the backend API
   */
  private async request<T>(
    endpoint: string,
    authToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    console.log(`[TenantService] Making API request to: ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...(options.headers as Record<string, string>),
    };

    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[TenantService] Response status: ${response.status} for ${url}`);
    } catch (error) {
      console.error(`[TenantService] Network error for ${url}:`, error);

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new TenantApiError(
          'Unable to connect to the server. Please check your connection.',
          0,
          'NETWORK_ERROR'
        );
      }

      throw new TenantApiError(
        error instanceof Error ? error.message : 'Network request failed',
        0,
        'FETCH_ERROR'
      );
    }

    if (!response.ok) {
      let errorMessage: string;
      let errorCode: string | undefined;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorData.detail || JSON.stringify(errorData);
        errorCode = errorData.code || errorData.error_code;
      } catch {
        // Provide user-friendly messages for common HTTP status codes
        switch (response.status) {
          case 400:
            errorMessage = 'Invalid request. Please check your input and try again.';
            break;
          case 401:
            errorMessage = 'Authentication required. Please log in again.';
            errorCode = 'UNAUTHORIZED';
            break;
          case 403:
            errorMessage = 'Access denied. You don\'t have permission for this action.';
            errorCode = 'FORBIDDEN';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            errorCode = 'NOT_FOUND';
            break;
          case 409:
            errorMessage = 'Conflict with existing data. Please check for duplicates.';
            errorCode = 'CONFLICT';
            break;
          case 422:
            errorMessage = 'Validation failed. Please check the required fields.';
            errorCode = 'VALIDATION_ERROR';
            break;
          case 500:
            errorMessage = 'Internal server error. Our team has been notified.';
            errorCode = 'SERVER_ERROR';
            break;
          default:
            errorMessage = response.statusText || `HTTP ${response.status} error`;
        }
      }

      console.error(`[TenantService] API Error [${response.status}]:`, errorMessage);
      throw new TenantApiError(errorMessage, response.status, errorCode);
    }

    return await response.json();
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    if (!params || Object.keys(params).length === 0) {
      return path;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  }

  // ==========================================================================
  // Tenant Operations
  // ==========================================================================

  /**
   * List tenants with optional filters
   */
  async listTenants(
    session: UserSession,
    authToken: string,
    params?: TenantListParams
  ): Promise<TenantListResponse> {
    // Permission check
    assertPermission(session, PERMISSIONS.TENANT_LIST);

    const endpoint = this.buildUrl('/admin/tenants', params);
    const response = await this.request<TenantListResponse>(endpoint, authToken, {
      method: 'GET',
    });

    return response;
  }

  /**
   * Create a new tenant
   */
  async createTenant(
    session: UserSession,
    authToken: string,
    data: CreateTenantRequest
  ): Promise<CreateTenantResponse> {
    // Permission check
    assertPermission(session, PERMISSIONS.TENANT_CREATE);

    // Validate request data
    const validatedData = createTenantRequestSchema.parse(data);

    const result = await this.request<CreateTenantResponse>(
      '/admin/tenant/create',
      authToken,
      {
        method: 'POST',
        body: JSON.stringify(validatedData),
        headers: {
          'Idempotency-Key': generateUUID(),
        },
      }
    );

    // Audit logging
    auditTenantCreate(session.userId, session.role, result.tenant.id, {
      tenantName: result.tenant.name,
      domain: result.tenant.domain,
      plan: validatedData.plan,
    });

    return result;
  }

  /**
   * Get tenant details
   */
  async getTenant(
    session: UserSession,
    authToken: string,
    tenantId: string
  ): Promise<TenantDetail> {
    assertPermission(session, PERMISSIONS.TENANT_READ);

    return await this.request<TenantDetail>(
      `/admin/tenant/${encodeURIComponent(tenantId)}`,
      authToken,
      { method: 'GET' }
    );
  }

  /**
   * Update tenant
   */
  async updateTenant(
    session: UserSession,
    authToken: string,
    tenantId: string,
    data: UpdateTenantRequest
  ): Promise<TenantDetail> {
    assertPermission(session, PERMISSIONS.TENANT_UPDATE);

    const validatedData = updateTenantRequestSchema.parse(data);

    const result = await this.request<TenantDetail>(
      `/admin/tenant/${encodeURIComponent(tenantId)}`,
      authToken,
      {
        method: 'PUT',
        body: JSON.stringify(validatedData),
        headers: {
          'Idempotency-Key': generateUUID(),
        },
      }
    );

    // Audit logging
    auditTenantUpdate(session.userId, session.role, tenantId, validatedData);

    return result;
  }

  /**
   * Delete tenant
   */
  async deleteTenant(
    session: UserSession,
    authToken: string,
    tenantId: string
  ): Promise<{ success: boolean }> {
    assertPermission(session, PERMISSIONS.TENANT_DELETE);

    const result = await this.request<{ success: boolean }>(
      `/admin/tenant/${encodeURIComponent(tenantId)}`,
      authToken,
      { method: 'DELETE' }
    );

    // Audit logging
    auditTenantDelete(session.userId, session.role, tenantId);

    return result;
  }

  /**
   * Get tenant provisioning status
   */
  async getTenantStatus(
    session: UserSession,
    authToken: string,
    tenantId: string
  ): Promise<TenantStatusResponse> {
    assertPermission(session, PERMISSIONS.TENANT_READ);

    return await this.request<TenantStatusResponse>(
      `/tenant/${encodeURIComponent(tenantId)}/status`,
      authToken,
      { method: 'GET' }
    );
  }

  /**
   * Retry failed tenant provisioning
   */
  async retryTenant(
    session: UserSession,
    authToken: string,
    tenantId: string
  ): Promise<{ success: boolean }> {
    assertPermission(session, PERMISSIONS.TENANT_UPDATE);

    return await this.request<{ success: boolean }>(
      `/tenant/${encodeURIComponent(tenantId)}/retry`,
      authToken,
      { method: 'POST' }
    );
  }

  // ==========================================================================
  // Subscription Operations
  // ==========================================================================

  /**
   * Get subscription details
   */
  async getSubscription(
    session: UserSession,
    authToken: string,
    tenantId: string
  ): Promise<Subscription> {
    assertPermission(session, PERMISSIONS.TENANT_READ);

    return await this.request<Subscription>(
      `/admin/tenant/${encodeURIComponent(tenantId)}/subscription`,
      authToken,
      { method: 'GET' }
    );
  }

  /**
   * Activate subscription
   */
  async activateSubscription(
    session: UserSession,
    authToken: string,
    tenantId: string
  ): Promise<Subscription> {
    assertPermission(session, PERMISSIONS.TENANT_SUBSCRIPTION_MANAGE);

    return await this.request<Subscription>(
      `/admin/tenant/${encodeURIComponent(tenantId)}/subscription/activate`,
      authToken,
      { method: 'POST' }
    );
  }

  /**
   * Suspend subscription
   */
  async suspendSubscription(
    session: UserSession,
    authToken: string,
    tenantId: string
  ): Promise<Subscription> {
    assertPermission(session, PERMISSIONS.TENANT_SUBSCRIPTION_MANAGE);

    return await this.request<Subscription>(
      `/admin/tenant/${encodeURIComponent(tenantId)}/subscription/suspend`,
      authToken,
      { method: 'POST' }
    );
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(
    session: UserSession,
    authToken: string,
    tenantId: string
  ): Promise<Subscription> {
    assertPermission(session, PERMISSIONS.TENANT_SUBSCRIPTION_MANAGE);

    return await this.request<Subscription>(
      `/admin/tenant/${encodeURIComponent(tenantId)}/subscription/resume`,
      authToken,
      { method: 'POST' }
    );
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    session: UserSession,
    authToken: string,
    tenantId: string
  ): Promise<Subscription> {
    assertPermission(session, PERMISSIONS.TENANT_SUBSCRIPTION_MANAGE);

    return await this.request<Subscription>(
      `/admin/tenant/${encodeURIComponent(tenantId)}/subscription/cancel`,
      authToken,
      { method: 'POST' }
    );
  }
}

// Export singleton instance
export const tenantService = new TenantService();
