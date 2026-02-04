import { createAuthenticatedFetcher } from '@/lib/api/fetcher';
import { env } from '@/config/env';
import {
  trackingStateSchema,
  stageHistoryResponseSchema,
  pipelineBoardSchema,
  type TrackingState,
  type StageHistoryResponse,
  type PipelineBoard,
  type MoveStageRequest,
  type UpdateStatusRequest,
} from './schemas';

// ============================================================================
// Error Classes
// ============================================================================

export class TrackingApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TrackingApiError';
  }
}

// ============================================================================
// Tracking Service
// ============================================================================

/**
 * Tracking service for application stage management
 */
class TrackingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_TRACKING_API_BASE_URL || env.NEXT_PUBLIC_JOB_API_BASE_URL || '';
    console.log('[TrackingService] Initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Get tracking state for an application
   */
  async getTrackingState(token: string, applicationId: string): Promise<TrackingState> {
    const url = `/applications/${applicationId}`;
    console.log('[TrackingService] getTrackingState:', { baseUrl: this.baseUrl, url, applicationId });
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get(
        url,
        trackingStateSchema.transform((data) => data)
      );
      console.log('[TrackingService] getTrackingState success:', response);
      return response;
    } catch (error) {
      console.error('[TrackingService] getTrackingState error:', error);
      throw this.handleError(error, 'Failed to fetch tracking state');
    }
  }

  /**
   * Move application to a different stage
   */
  async moveStage(
    token: string,
    applicationId: string,
    request: MoveStageRequest
  ): Promise<TrackingState> {
    const url = `/applications/${applicationId}/move`;
    console.log('[TrackingService] moveStage:', { baseUrl: this.baseUrl, url, applicationId, request });
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.post(
        url,
        request,
        trackingStateSchema.transform((data) => data)
      );
      console.log('[TrackingService] moveStage success:', response);
      return response;
    } catch (error) {
      console.error('[TrackingService] moveStage error:', error);
      throw this.handleError(error, 'Failed to move stage');
    }
  }

  /**
   * Update application status
   */
  async updateStatus(
    token: string,
    applicationId: string,
    request: UpdateStatusRequest
  ): Promise<TrackingState> {
    const url = `/applications/${applicationId}/status`;
    console.log('[TrackingService] updateStatus:', { baseUrl: this.baseUrl, url, applicationId, request });
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.patch(
        url,
        request,
        trackingStateSchema.transform((data) => data)
      );
      console.log('[TrackingService] updateStatus success:', response);
      return response;
    } catch (error) {
      console.error('[TrackingService] updateStatus error:', error);
      throw this.handleError(error, 'Failed to update status');
    }
  }

  /**
   * Get stage history for an application
   */
  async getStageHistory(
    token: string,
    applicationId: string,
    limit = 50,
    offset = 0
  ): Promise<StageHistoryResponse> {
    const url = `/applications/${applicationId}/history?limit=${limit}&offset=${offset}`;
    console.log('[TrackingService] getStageHistory:', { baseUrl: this.baseUrl, url, applicationId, limit, offset });
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get(url, stageHistoryResponseSchema);
      console.log('[TrackingService] getStageHistory success:', { count: response.data?.length });
      return response;
    } catch (error) {
      console.error('[TrackingService] getStageHistory error:', error);
      throw this.handleError(error, 'Failed to fetch stage history');
    }
  }

  /**
   * Get pipeline board (Kanban view)
   */
  async getPipelineBoard(
    token: string,
    pipelineId: string,
    options?: { status?: string; jobId?: string }
  ): Promise<PipelineBoard> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.jobId) params.set('jobId', options.jobId);

    const queryString = params.toString();
    const url = `/pipelines/${pipelineId}/board${queryString ? `?${queryString}` : ''}`;

    console.log('[TrackingService] getPipelineBoard:', {
      baseUrl: this.baseUrl,
      fullUrl: `${this.baseUrl}${url}`,
      pipelineId,
      options
    });

    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get(url, pipelineBoardSchema);
      console.log('[TrackingService] getPipelineBoard success:', {
        stages: response.stages?.length,
        totalApplications: response.totalApplications,
      });
      return response;
    } catch (error) {
      console.error('[TrackingService] getPipelineBoard error:', error);
      throw this.handleError(error, 'Failed to fetch pipeline board');
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown, defaultMessage: string): TrackingApiError {
    if (error instanceof TrackingApiError) {
      return error;
    }
    if (error instanceof Error) {
      return new TrackingApiError(error.message, 500, 'TRACKING_ERROR');
    }
    return new TrackingApiError(defaultMessage, 500, 'TRACKING_ERROR');
  }
}

export const trackingService = new TrackingService();
