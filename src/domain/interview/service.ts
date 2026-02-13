import { createAuthenticatedFetcher, ApiException } from '@/lib/api/fetcher';
import { env } from '@/config/env';
import type { UserSession } from '@/lib/rbac/guard';
import {
  pendingInterviewsListSchema,
  interviewDetailSchema,
  applicationInterviewsListSchema,
  cancelInterviewResponseSchema,
  createInterviewResponseSchema,
  type PendingInterviewsList,
  type InterviewDetail,
  type ApplicationInterviewsList,
  type CancelInterviewResponse,
  type CreateInterviewRequest,
  type CreateInterviewResponse,
} from './schemas';

// ============================================================================
// Error Classes
// ============================================================================

export class InterviewApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'InterviewApiError';
  }
}

// ============================================================================
// Interview Service
// ============================================================================

export class InterviewService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_INTERVIEW_API_BASE_URL || '';
  }

  /**
   * Get list of pending interviews for the current user
   */
  async getMyPendingInterviews(
    _session: UserSession,
    token: string
  ): Promise<PendingInterviewsList> {
    if (!this.baseUrl) {
      throw new InterviewApiError(
        'NEXT_PUBLIC_INTERVIEW_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      return await authFetcher.get('/my-pending', pendingInterviewsListSchema);
    } catch (error) {
      if (error instanceof InterviewApiError) throw error;

      if (error instanceof ApiException) {
        if (error.code === 'INVALID_RESPONSE') {
          throw new InterviewApiError(
            'Interview service response format mismatch',
            502,
            'SCHEMA_MISMATCH'
          );
        }
        if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
          throw new InterviewApiError(
            'Interview service unreachable',
            503,
            'NETWORK_ERROR'
          );
        }
        if (error.status === 401 || error.status === 403) {
          throw new InterviewApiError(
            'Access denied',
            error.status,
            'FORBIDDEN'
          );
        }
        throw new InterviewApiError(error.message, error.status ?? 500, 'INTERVIEW_LIST_ERROR');
      }

      if (error instanceof Error) {
        throw new InterviewApiError(error.message, 500, 'INTERVIEW_LIST_ERROR');
      }
      throw error;
    }
  }

  /**
   * Get interview detail by ID
   */
  async getInterviewDetail(
    _session: UserSession,
    token: string,
    interviewId: string
  ): Promise<InterviewDetail> {
    if (!this.baseUrl) {
      throw new InterviewApiError(
        'NEXT_PUBLIC_INTERVIEW_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      return await authFetcher.get(`/interviews/${interviewId}`, interviewDetailSchema);
    } catch (error) {
      if (error instanceof InterviewApiError) throw error;
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          throw new InterviewApiError(
            `Interview not found: ${interviewId}`,
            404,
            'INTERVIEW_NOT_FOUND'
          );
        }
        throw new InterviewApiError(error.message, 500, 'INTERVIEW_GET_ERROR');
      }
      throw error;
    }
  }

  /**
   * Get interviews for an application (used in drawer timeline)
   */
  async getInterviewsForApplication(
    _session: UserSession,
    token: string,
    applicationId: string
  ): Promise<ApplicationInterviewsList> {
    if (!this.baseUrl) {
      throw new InterviewApiError(
        'NEXT_PUBLIC_INTERVIEW_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      return await authFetcher.get(
        `/applications/${applicationId}/interviews`,
        applicationInterviewsListSchema
      );
    } catch (error) {
      if (error instanceof InterviewApiError) throw error;
      if (error instanceof Error) {
        throw new InterviewApiError(error.message, 500, 'INTERVIEW_LIST_ERROR');
      }
      throw error;
    }
  }

  /**
   * Cancel an interview
   */
  async cancelInterview(
    _session: UserSession,
    token: string,
    interviewId: string
  ): Promise<CancelInterviewResponse> {
    if (!this.baseUrl) {
      throw new InterviewApiError(
        'NEXT_PUBLIC_INTERVIEW_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      return await authFetcher.patch(
        `/interviews/${interviewId}`,
        { status: 'CANCELLED' },
        cancelInterviewResponseSchema
      );
    } catch (error) {
      if (error instanceof InterviewApiError) throw error;
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          throw new InterviewApiError(
            `Interview not found: ${interviewId}`,
            404,
            'INTERVIEW_NOT_FOUND'
          );
        }
        throw new InterviewApiError(error.message, 400, 'INTERVIEW_CANCEL_ERROR');
      }
      throw error;
    }
  }
  /**
   * Create an interview for an application
   */
  async createInterview(
    _session: UserSession,
    token: string,
    applicationId: string,
    request: CreateInterviewRequest
  ): Promise<CreateInterviewResponse> {
    if (!this.baseUrl) {
      throw new InterviewApiError(
        'NEXT_PUBLIC_INTERVIEW_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      return await authFetcher.post(
        `/applications/${applicationId}/interviews`,
        request,
        createInterviewResponseSchema
      );
    } catch (error) {
      if (error instanceof InterviewApiError) throw error;

      if (error instanceof ApiException) {
        if (error.code === 'INVALID_RESPONSE') {
          throw new InterviewApiError(
            'Interview service response format mismatch',
            502,
            'SCHEMA_MISMATCH'
          );
        }
        if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
          throw new InterviewApiError(
            'Interview service unreachable',
            503,
            'NETWORK_ERROR'
          );
        }
        if (error.status === 401 || error.status === 403) {
          throw new InterviewApiError(
            'Access denied',
            error.status,
            'FORBIDDEN'
          );
        }
        throw new InterviewApiError(error.message, error.status ?? 500, 'INTERVIEW_CREATE_ERROR');
      }

      if (error instanceof Error) {
        throw new InterviewApiError(error.message, 500, 'INTERVIEW_CREATE_ERROR');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const interviewService = new InterviewService();
