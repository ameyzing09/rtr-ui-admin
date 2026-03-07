import { createAuthenticatedFetcher } from '@/lib/api/fetcher';

import type { UserSession } from '@/lib/rbac/guard';
import {
  evaluationDetailsSchema,
  pendingEvaluationsListSchema,
  submitEvaluationResponseSchema,
  completeEvaluationResponseSchema,
  evaluationResponsesListSchema,
  type EvaluationDetails,
  type EvaluationResponse,
  type PendingEvaluationsList,
  type SubmitEvaluationRequest,
  type SubmitEvaluationResponse,
  type CompleteEvaluationResponse,
} from './schemas';

// ============================================================================
// Error Classes
// ============================================================================

export class EvaluationApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'EvaluationApiError';
  }
}

// ============================================================================
// Evaluation Service
// ============================================================================

export class EvaluationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_EVALUATION_API_BASE_URL || '';
    console.log('[EvaluationService] Initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Get list of pending evaluations for the current user
   */
  async getMyPendingEvaluations(
    session: UserSession,
    token: string
  ): Promise<PendingEvaluationsList> {
    if (!this.baseUrl) {
      throw new EvaluationApiError(
        'NEXT_PUBLIC_EVALUATION_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const data = await authFetcher.get('/my-pending', pendingEvaluationsListSchema);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new EvaluationApiError(
          error.message,
          500,
          'EVALUATION_LIST_ERROR'
        );
      }
      throw error;
    }
  }

  /**
   * Get evaluation details with signal definitions and participants
   */
  async getEvaluationDetails(
    session: UserSession,
    token: string,
    evaluationId: string
  ): Promise<EvaluationDetails | null> {
    if (!this.baseUrl) {
      throw new EvaluationApiError(
        'NEXT_PUBLIC_EVALUATION_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const data = await authFetcher.get(`/${evaluationId}`, evaluationDetailsSchema);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Check ApiException.status (reliable) instead of string matching (fragile)
        const status = 'status' in error ? (error as { status: number }).status : undefined;
        if (status === 404 || error.message.includes('not found')) {
          throw new EvaluationApiError(
            `Evaluation not found: ${evaluationId}`,
            404,
            'EVALUATION_NOT_FOUND'
          );
        }
        throw new EvaluationApiError(
          error.message,
          status ?? 500,
          'EVALUATION_GET_ERROR'
        );
      }
      throw error;
    }
  }

  /**
   * Get all submitted responses for an evaluation (HR/Admin only)
   */
  async getEvaluationResponses(
    session: UserSession,
    token: string,
    evaluationId: string
  ): Promise<EvaluationResponse[]> {
    if (!this.baseUrl) {
      throw new EvaluationApiError(
        'NEXT_PUBLIC_EVALUATION_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const data = await authFetcher.get(`/${evaluationId}/responses`, evaluationResponsesListSchema);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        const status = 'status' in error ? (error as { status: number }).status : undefined;
        throw new EvaluationApiError(
          error.message,
          status ?? 500,
          'EVALUATION_RESPONSES_ERROR'
        );
      }
      throw error;
    }
  }

  /**
   * Submit evaluation response
   * This is an immutable operation - responses cannot be modified once submitted
   */
  async submitResponse(
    session: UserSession,
    token: string,
    evaluationId: string,
    request: SubmitEvaluationRequest
  ): Promise<SubmitEvaluationResponse> {
    if (!this.baseUrl) {
      throw new EvaluationApiError(
        'NEXT_PUBLIC_EVALUATION_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const data = await authFetcher.post(`/${evaluationId}/respond`, request, submitEvaluationResponseSchema);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already responded')) {
          throw new EvaluationApiError(
            'You have already submitted a response to this evaluation',
            409,
            'EVALUATION_ALREADY_RESPONDED'
          );
        }
        if (error.message.includes('not a participant')) {
          throw new EvaluationApiError(
            'You are not a participant in this evaluation',
            403,
            'EVALUATION_NOT_PARTICIPANT'
          );
        }
        throw new EvaluationApiError(
          error.message,
          400,
          'EVALUATION_SUBMIT_ERROR'
        );
      }
      throw error;
    }
  }

  /**
   * Complete an evaluation instance (HR/Admin only)
   * Triggers signal aggregation
   */
  async completeEvaluation(
    session: UserSession,
    token: string,
    evaluationId: string,
  ): Promise<CompleteEvaluationResponse> {
    if (!this.baseUrl) {
      throw new EvaluationApiError(
        'NEXT_PUBLIC_EVALUATION_API_BASE_URL is not configured',
        500,
        'CONFIG_ERROR'
      );
    }

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const data = await authFetcher.post(
        `/${evaluationId}/complete`,
        {},
        completeEvaluationResponseSchema
      );
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('EVALUATION_INCOMPLETE')) {
          throw new EvaluationApiError(
            'Not all participants have submitted their evaluations yet',
            400,
            'EVALUATION_INCOMPLETE'
          );
        }
        if (error.message.includes('EVALUATION_ALREADY_COMPLETED') || error.message.includes('already completed')) {
          throw new EvaluationApiError(
            'This evaluation has already been completed',
            409,
            'EVALUATION_ALREADY_COMPLETED'
          );
        }
        throw new EvaluationApiError(
          error.message,
          400,
          'EVALUATION_COMPLETE_ERROR'
        );
      }
      throw error;
    }
  }
}

// Export singleton instance
export const evaluationService = new EvaluationService();
