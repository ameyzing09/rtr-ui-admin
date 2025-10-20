import { createAuthenticatedFetcher } from '@/lib/api/fetcher';
import type { UserSession } from '@/lib/rbac/guard';
import {
  applicationSchema,
  applicationListResponseSchema,
  type Application,
  type ApplicationListResponse,
  type CreateApplicationRequest,
  type UpdateApplicationRequest,
} from './schemas';
import {
  auditApplicationCreate,
  auditApplicationUpdate,
  auditApplicationDelete,
  auditApplicationList,
  auditApplicationView,
  auditApplicationError,
} from './audit';

// ============================================================================
// Error Classes
// ============================================================================

export class ApplicationApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApplicationApiError';
  }
}

// ============================================================================
// Application Service
// ============================================================================

/**
 * Application Service
 * Handles all API operations for applications
 */
export class ApplicationService {
  private baseUrl = '/applications';

  /**
   * List all applications for the authenticated tenant
   * Optionally filter by jobId
   */
  async listApplications(
    session: UserSession,
    token: string,
    jobId?: string
  ): Promise<ApplicationListResponse> {
    try {
      // Build URL with optional jobId query parameter
      let url = this.baseUrl;
      if (jobId) {
        url += `?jobId=${encodeURIComponent(jobId)}`;
      }

      // Create authenticated fetcher with token
      const authFetcher = createAuthenticatedFetcher(token);
      const data = await authFetcher.get(url, applicationListResponseSchema);

      // Audit log successful list operation
      await auditApplicationList(session, { jobId });

      return data;
    } catch (error) {
      // Audit error
      await auditApplicationError(session, 'list', error, { jobId });

      if (error instanceof Error) {
        throw new ApplicationApiError(
          error.message,
          500,
          'APPLICATION_LIST_ERROR'
        );
      }
      throw error;
    }
  }

  /**
   * Create a new application
   */
  async createApplication(
    session: UserSession,
    token: string,
    payload: CreateApplicationRequest
  ): Promise<Application> {
    try {
      // API expects camelCase, so we can pass through directly
      const apiPayload = {
        ...payload,
      };

      // Create authenticated fetcher with token
      const authFetcher = createAuthenticatedFetcher(token);
      const data = await authFetcher.post(this.baseUrl, apiPayload, applicationSchema);

      // Audit log successful creation
      await auditApplicationCreate(session, data);

      return data;
    } catch (error) {
      // Audit error
      await auditApplicationError(session, 'create', error, { payload });

      if (error instanceof Error) {
        throw new ApplicationApiError(
          error.message,
          400,
          'APPLICATION_CREATE_ERROR'
        );
      }
      throw error;
    }
  }

  /**
   * Get a single application by ID
   */
  async getApplication(
    session: UserSession,
    token: string,
    applicationId: string
  ): Promise<Application> {
    try {
      const url = `${this.baseUrl}/${applicationId}`;

      // Create authenticated fetcher with token
      const authFetcher = createAuthenticatedFetcher(token);
      const data = await authFetcher.get(url, applicationSchema);

      // Audit log successful view operation
      await auditApplicationView(session, applicationId, data);

      return data;
    } catch (error) {
      // Audit error
      await auditApplicationError(session, 'view', error, { applicationId });

      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          throw new ApplicationApiError(
            `Application not found: ${applicationId}`,
            404,
            'APPLICATION_NOT_FOUND'
          );
        }
        throw new ApplicationApiError(
          error.message,
          500,
          'APPLICATION_GET_ERROR'
        );
      }
      throw error;
    }
  }

  /**
   * Update an existing application (partial update)
   */
  async updateApplication(
    session: UserSession,
    token: string,
    applicationId: string,
    payload: UpdateApplicationRequest
  ): Promise<Application> {
    try {
      const url = `${this.baseUrl}/${applicationId}`;

      // API expects camelCase, so we can pass through directly
      const apiPayload = {
        ...payload,
      };

      // Create authenticated fetcher with token
      const authFetcher = createAuthenticatedFetcher(token);
      const data = await authFetcher.put(url, apiPayload, applicationSchema);

      // Audit log successful update
      await auditApplicationUpdate(session, applicationId, payload);

      return data;
    } catch (error) {
      // Audit error
      await auditApplicationError(session, 'update', error, { applicationId, payload });

      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          throw new ApplicationApiError(
            `Application not found: ${applicationId}`,
            404,
            'APPLICATION_NOT_FOUND'
          );
        }
        throw new ApplicationApiError(
          error.message,
          400,
          'APPLICATION_UPDATE_ERROR'
        );
      }
      throw error;
    }
  }

  /**
   * Delete an application
   */
  async deleteApplication(
    session: UserSession,
    token: string,
    applicationId: string
  ): Promise<void> {
    try {
      const url = `${this.baseUrl}/${applicationId}`;

      // Create authenticated fetcher with token
      const authFetcher = createAuthenticatedFetcher(token);
      await authFetcher.delete(url);

      // Audit log successful deletion
      await auditApplicationDelete(session, applicationId);
    } catch (error) {
      // Audit error
      await auditApplicationError(session, 'delete', error, { applicationId });

      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          throw new ApplicationApiError(
            `Application not found: ${applicationId}`,
            404,
            'APPLICATION_NOT_FOUND'
          );
        }
        throw new ApplicationApiError(
          error.message,
          500,
          'APPLICATION_DELETE_ERROR'
        );
      }
      throw error;
    }
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();
