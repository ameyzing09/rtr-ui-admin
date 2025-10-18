import { fetcher, ApiException } from '@/lib/api/fetcher';
import type { AuthSession } from '@/lib/auth/types';
import {
  jobSchema,
  jobListResponseSchema,
  deleteJobResponseSchema,
  type Job,
  type CreateJobRequest,
  type UpdateJobRequest,
  type JobListResponse,
  type JobListParams,
  type DeleteJobResponse,
} from './schemas';

/**
 * Custom error class for Job API errors
 */
export class JobApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'JobApiError';
  }
}

/**
 * Job Service
 * Handles all job-related API operations
 */
export class JobService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/job';
  }

  /**
   * Handle API errors and convert to JobApiError
   */
  private handleError(error: unknown): never {
    console.error('Job API Error:', error);

    if (error instanceof ApiException) {
      throw new JobApiError(
        error.message,
        error.code,
        error.status,
        error.details
      );
    }

    if (error instanceof Error) {
      throw new JobApiError(error.message);
    }

    throw new JobApiError('Unknown error occurred');
  }

  /**
   * List jobs with filters and pagination
   * B1: GET /job
   */
  async listJobs(
    session: AuthSession,
    token: string,
    params: Partial<JobListParams> = {}
  ): Promise<JobListResponse> {
    try {
      console.log('[JobService] Listing jobs with params:', params);

      // Build query string
      const queryParams = new URLSearchParams();
      if (params.title) queryParams.set('title', params.title);
      if (params.department) queryParams.set('department', params.department);
      if (params.location) queryParams.set('location', params.location);
      if (params.status) queryParams.set('status', params.status);
      if (params.isPublic !== undefined) queryParams.set('isPublic', String(params.isPublic));
      if (params.sortBy) queryParams.set('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
      if (params.page) queryParams.set('page', String(params.page));
      if (params.limit) queryParams.set('limit', String(params.limit));

      const endpoint = queryParams.toString()
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl;

      const response = await fetcher.get(endpoint, jobListResponseSchema);

      console.log('[JobService] Successfully fetched jobs:', {
        count: response.jobs?.length || 0,
        total: response.total,
      });

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new job
   * B2: POST /job
   */
  async createJob(
    session: AuthSession,
    token: string,
    payload: CreateJobRequest
  ): Promise<Job> {
    try {
      console.log('[JobService] Creating job:', { title: payload.title });

      // Transform dates to ISO strings for API
      const apiPayload = {
        ...payload,
        publishAt: payload.publishAt ? payload.publishAt.toISOString() : null,
        expireAt: payload.expireAt ? payload.expireAt.toISOString() : null,
      };

      const response = await fetcher.post(this.baseUrl, apiPayload, jobSchema);

      console.log('[JobService] Successfully created job:', response.id);

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a single job by ID
   * B3: GET /job/:id
   */
  async getJob(
    session: AuthSession,
    token: string,
    id: string
  ): Promise<Job> {
    try {
      console.log('[JobService] Fetching job:', id);

      const response = await fetcher.get(`${this.baseUrl}/${id}`, jobSchema);

      console.log('[JobService] Successfully fetched job:', id);

      return response;
    } catch (error) {
      if (error instanceof ApiException && error.status === 404) {
        throw new JobApiError('Job not found', 'JOB_NOT_FOUND', 404);
      }
      return this.handleError(error);
    }
  }

  /**
   * Update a job (partial updates allowed)
   * B4: PUT /job/:id
   */
  async updateJob(
    session: AuthSession,
    token: string,
    id: string,
    patch: UpdateJobRequest
  ): Promise<Job> {
    try {
      console.log('[JobService] Updating job:', id, patch);

      // Transform dates to ISO strings for API
      const apiPatch: Record<string, unknown> = {};
      Object.entries(patch).forEach(([key, value]) => {
        if (key === 'publishAt' || key === 'expireAt') {
          apiPatch[key] = value instanceof Date ? value.toISOString() : value;
        } else {
          apiPatch[key] = value;
        }
      });

      const response = await fetcher.put(
        `${this.baseUrl}/${id}`,
        apiPatch,
        jobSchema
      );

      console.log('[JobService] Successfully updated job:', id);

      return response;
    } catch (error) {
      if (error instanceof ApiException && error.status === 404) {
        throw new JobApiError('Job not found', 'JOB_NOT_FOUND', 404);
      }
      return this.handleError(error);
    }
  }

  /**
   * Delete a job
   * B5: DELETE /job/:id
   */
  async deleteJob(
    session: AuthSession,
    token: string,
    id: string
  ): Promise<DeleteJobResponse> {
    try {
      console.log('[JobService] Deleting job:', id);

      const response = await fetcher.delete(
        `${this.baseUrl}/${id}`,
        deleteJobResponseSchema
      );

      console.log('[JobService] Successfully deleted job:', id, {
        cascade: response.cascade_info,
      });

      return response;
    } catch (error) {
      if (error instanceof ApiException && error.status === 404) {
        throw new JobApiError('Job not found', 'JOB_NOT_FOUND', 404);
      }
      return this.handleError(error);
    }
  }

  /**
   * Get cascade delete preview (optional - if backend supports it)
   * Returns information about what will be deleted
   */
  async getCascadeInfo(
    session: AuthSession,
    token: string,
    id: string
  ): Promise<{ applications: number; interviews: number; feedback: number }> {
    try {
      console.log('[JobService] Fetching cascade info for job:', id);

      // If backend supports a preview endpoint like GET /job/:id/cascade-info
      // Otherwise, return default values
      return {
        applications: 0,
        interviews: 0,
        feedback: 0,
      };
    } catch (error) {
      console.error('[JobService] Failed to fetch cascade info:', error);
      // Return defaults on error
      return {
        applications: 0,
        interviews: 0,
        feedback: 0,
      };
    }
  }
}

// Singleton instance
export const jobService = new JobService();
