import { fetcher } from '@/lib/api/fetcher';
import type { Session } from '@/domain/auth/schemas';
import {
  applicationSchema,
  applicationListResponseSchema,
  type Application,
  type ApplicationListResponse,
  type CreateApplicationRequest,
  type UpdateApplicationRequest,
} from './schemas';

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
    session: Session,
    token: string,
    jobId?: string
  ): Promise<ApplicationListResponse> {
    try {
      // Build URL with optional jobId query parameter
      let url = this.baseUrl;
      if (jobId) {
        url += `?jobId=${encodeURIComponent(jobId)}`;
      }

      const data = await fetcher.get(url, applicationListResponseSchema);
      return data;
    } catch (error) {
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
    session: Session,
    token: string,
    payload: CreateApplicationRequest
  ): Promise<Application> {
    try {
      // API expects camelCase, so we can pass through directly
      const apiPayload = {
        ...payload,
      };

      const data = await fetcher.post(this.baseUrl, apiPayload, applicationSchema);
      return data;
    } catch (error) {
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
    session: Session,
    token: string,
    applicationId: string
  ): Promise<Application> {
    try {
      const url = `${this.baseUrl}/${applicationId}`;
      const data = await fetcher.get(url, applicationSchema);
      return data;
    } catch (error) {
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
    session: Session,
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

      const data = await fetcher.put(url, apiPayload, applicationSchema);
      return data;
    } catch (error) {
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
    session: Session,
    token: string,
    applicationId: string
  ): Promise<void> {
    try {
      const url = `${this.baseUrl}/${applicationId}`;
      await fetcher.delete(url);
    } catch (error) {
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
