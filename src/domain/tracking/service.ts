import { createAuthenticatedFetcher } from '@/lib/api/fetcher';
import { env } from '@/config/env';
import {
  trackingStateSchema,
  stageHistoryResponseSchema,
  pipelineBoardSchema,
  availableActionsResponseSchema,
  type TrackingState,
  type StageHistoryResponse,
  type PipelineBoard,
  type AvailableActionsResponse,
  type ExecuteActionRequest,
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
    const fullUrl = `${this.baseUrl}${url}`;
    console.log('[TrackingService] getTrackingState REQUEST:', { fullUrl, applicationId });
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get(
        url,
        trackingStateSchema
      );
      console.log('[TrackingService] getTrackingState RESPONSE:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('[TrackingService] getTrackingState ERROR:', error);
      throw this.handleError(error, 'Failed to fetch tracking state');
    }
  }

  /**
   * Get available actions for an application (v2 action engine)
   */
  async getAvailableActions(token: string, applicationId: string): Promise<AvailableActionsResponse> {
    const url = `/applications/${applicationId}/actions`;
    console.log('[TrackingService] getAvailableActions:', { baseUrl: this.baseUrl, url, applicationId });
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get(url, availableActionsResponseSchema);
      console.log('[TrackingService] getAvailableActions success:', {
        actionCount: response.availableActions.length,
      });
      return response;
    } catch (error) {
      console.error('[TrackingService] getAvailableActions error:', error);
      throw this.handleError(error, 'Failed to fetch available actions');
    }
  }

  /**
   * Execute an action on an application (v2 action engine)
   */
  async executeAction(
    token: string,
    applicationId: string,
    request: ExecuteActionRequest
  ): Promise<TrackingState> {
    const url = `/applications/${applicationId}/act`;
    console.log('[TrackingService] executeAction:', { baseUrl: this.baseUrl, url, applicationId, request });
    try {
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.post(
        url,
        request,
        trackingStateSchema.transform((data) => data)
      );
      console.log('[TrackingService] executeAction success:', response);
      return response;
    } catch (error) {
      console.error('[TrackingService] executeAction error:', error);
      throw this.handleError(error, 'Failed to execute action');
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
