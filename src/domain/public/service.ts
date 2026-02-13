import { publicClient, PublicApiError } from '@/lib/api/publicClient';

// Re-export for use in API routes and actions
export { PublicApiError };
import {
  publicJobsResponseSchema,
  publicJobDetailSchema,
  publicApplicationSubmitResponseSchema,
  publicApplicationStatusSchema,
  type PublicJobsResponse,
  type PublicJobDetail,
  type PublicJobsQuery,
  type PublicApplicationSubmitRequest,
  type PublicApplicationSubmitResponse,
  type PublicApplicationStatus,
} from './schemas';

// ============================================================================
// Public Job Service
// ============================================================================

/**
 * Public Job Service
 * Handles all public (unauthenticated) job operations
 */
export class PublicJobService {
  private baseUrl = '/public/jobs';

  /**
   * D1: List public jobs (paginated)
   * GET /public/jobs
   */
  async listJobs(query: PublicJobsQuery = { page: 1, pageSize: 10 }): Promise<PublicJobsResponse> {
    try {
      const queryParams: Record<string, string | number> = {};

      if (query.search) queryParams.search = query.search;
      if (query.department) queryParams.department = query.department;
      if (query.location) queryParams.location = query.location;
      if (query.page) queryParams.page = query.page;
      if (query.pageSize) queryParams.pageSize = query.pageSize;

      const data = await publicClient.get(
        this.baseUrl,
        publicJobsResponseSchema,
        queryParams
      );

      return data;
    } catch (error) {
      if (error instanceof PublicApiError) {
        throw error;
      }
      throw new PublicApiError(
        'Failed to load jobs',
        500,
        'PUBLIC_JOBS_LIST_ERROR'
      );
    }
  }

  /**
   * D2: Get public job detail
   * GET /public/jobs/:id
   */
  async getJob(jobId: string): Promise<PublicJobDetail> {
    try {
      const url = `${this.baseUrl}/${jobId}`;
      const data = await publicClient.get(url, publicJobDetailSchema);
      return data;
    } catch (error) {
      if (error instanceof PublicApiError) {
        // Re-throw with more specific error for 404
        if (error.statusCode === 404) {
          throw new PublicApiError(
            'Job not found or no longer available',
            404,
            'PUBLIC_JOB_NOT_FOUND'
          );
        }
        throw error;
      }
      throw new PublicApiError(
        'Failed to load job',
        500,
        'PUBLIC_JOB_GET_ERROR'
      );
    }
  }
}

// ============================================================================
// Public Application Service
// ============================================================================

/**
 * Public Application Service
 * Handles public application submission
 */
export class PublicApplicationService {
  private baseUrl = '/public/applications';

  /**
   * D3: Submit public application
   * POST /public/applications
   */
  async submitApplication(
    payload: PublicApplicationSubmitRequest
  ): Promise<PublicApplicationSubmitResponse> {
    try {
      const data = await publicClient.post(
        '/public/applications',
        payload,
        publicApplicationSubmitResponseSchema
      );

      return data;
    } catch (error) {
      if (error instanceof PublicApiError) {
        // Add more context to common errors
        if (error.statusCode === 400) {
          throw new PublicApiError(
            error.message || 'Please check your form and try again',
            400,
            'VALIDATION_ERROR'
          );
        }
        if (error.statusCode === 429) {
          throw new PublicApiError(
            'Too many applications submitted. Please try again later.',
            429,
            'RATE_LIMIT_EXCEEDED'
          );
        }
        throw error;
      }
      throw new PublicApiError(
        'Failed to submit application',
        500,
        'PUBLIC_APPLICATION_SUBMIT_ERROR'
      );
    }
  }

  /**
   * Get application status by token
   * GET /public/applications/:token
   */
  async getApplicationStatus(token: string): Promise<PublicApplicationStatus> {
    try {
      const url = `${this.baseUrl}/${token}`;
      const data = await publicClient.get(url, publicApplicationStatusSchema);
      return data;
    } catch (error) {
      if (error instanceof PublicApiError) {
        if (error.statusCode === 404) {
          throw new PublicApiError(
            'Application not found',
            404,
            'PUBLIC_APPLICATION_NOT_FOUND'
          );
        }
        throw error;
      }
      throw new PublicApiError(
        'Failed to load application status',
        500,
        'PUBLIC_APPLICATION_STATUS_ERROR'
      );
    }
  }
}

// Export singleton instances
export const publicJobService = new PublicJobService();
export const publicApplicationService = new PublicApplicationService();
