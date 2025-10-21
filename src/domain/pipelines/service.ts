import { ApiException, createAuthenticatedFetcher } from '@/lib/api/fetcher';
import type { UserSession } from '@/lib/rbac/guard';
import { z } from 'zod';
import {
  pipelineSchema,
  type Pipeline,
  type CreatePipelineRequest,
  type UpdatePipelineRequest,
  type AssignPipelineRequest,
  type PipelineListResponse,
} from './schemas';
import {
  auditPipelineCreate,
  auditPipelineUpdate,
  auditPipelineAssign,
  auditPipelineList,
  auditPipelineView,
  auditPipelineError,
} from './audit';

/**
 * Custom error class for Pipeline API errors
 */
export class PipelineApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PipelineApiError';
  }
}

/**
 * Pipeline Service
 * Handles all pipeline-related API operations
 *
 * Note: Pipeline API is on port 8081 and uses different error format than NestJS services
 */
export class PipelineService {
  private baseUrl: string;

  constructor() {
    // Pipeline API base URL from environment
    const apiBaseUrl = process.env.NEXT_PUBLIC_PIPELINE_API_BASE_URL || 'http://localhost:8081';
    this.baseUrl = apiBaseUrl;
  }

  /**
   * Handle API errors and convert to PipelineApiError
   * Properly handles 403 Forbidden errors
   */
  private handleError(error: unknown): never {
    console.error('Pipeline API Error:', error);

    if (error instanceof ApiException) {
      // Handle 403 Forbidden gracefully
      if (error.status === 403) {
        throw new PipelineApiError(
          error.message || "You don't have permission to perform this action.",
          error.code || 'FORBIDDEN',
          403,
          error.details
        );
      }

      throw new PipelineApiError(
        error.message,
        error.code,
        error.status,
        error.details
      );
    }

    if (error instanceof Error) {
      throw new PipelineApiError(error.message);
    }

    throw new PipelineApiError('Unknown error occurred');
  }

  /**
   * List all pipelines for tenant
   * GET /pipeline
   */
  async listPipelines(
    session: UserSession,
    token: string
  ): Promise<PipelineListResponse> {
    try {
      console.log('[PipelineService] Listing pipelines for tenant:', session.tenantId);

      // Create authenticated fetcher with pipeline API base URL
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get<PipelineListResponse>(
        '/pipeline',
        z.array(pipelineSchema)
      );

      console.log('[PipelineService] Successfully fetched pipelines:', {
        count: response.length,
      });

      // Audit log successful list operation
      await auditPipelineList(session);

      return response;
    } catch (error) {
      // Audit error
      await auditPipelineError(session, 'list', error);
      return this.handleError(error);
    }
  }

  /**
   * Get pipeline by ID
   * GET /pipeline/:id
   */
  async getPipeline(
    session: UserSession,
    token: string,
    pipelineId: string
  ): Promise<Pipeline> {
    try {
      console.log('[PipelineService] Fetching pipeline:', pipelineId);

      // Create authenticated fetcher with pipeline API base URL
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.get<Pipeline>(
        `/pipeline/${pipelineId}`,
        pipelineSchema
      );

      console.log('[PipelineService] Successfully fetched pipeline:', response.id);

      // Audit log successful view operation
      await auditPipelineView(session, pipelineId, response);

      return response;
    } catch (error) {
      // Audit error
      await auditPipelineError(session, 'view', error, { pipelineId });
      return this.handleError(error);
    }
  }

  /**
   * Create a new pipeline
   * POST /pipeline
   * Requires ADMIN or HR role
   */
  async createPipeline(
    session: UserSession,
    token: string,
    payload: CreatePipelineRequest
  ): Promise<Pipeline> {
    try {
      console.log('[PipelineService] Creating pipeline:', { name: payload.name });

      // Create authenticated fetcher with pipeline API base URL
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.post<Pipeline>(
        '/pipeline',
        payload,
        pipelineSchema
      );

      console.log('[PipelineService] Successfully created pipeline:', response.id);

      // Audit log successful creation
      await auditPipelineCreate(session, response, payload);

      return response;
    } catch (error) {
      // Audit error
      await auditPipelineError(session, 'create', error, { payload });
      return this.handleError(error);
    }
  }

  /**
   * Update an existing pipeline
   * PATCH /pipeline/:id
   * Requires ADMIN or HR role
   * Supports partial updates
   */
  async updatePipeline(
    session: UserSession,
    token: string,
    pipelineId: string,
    payload: UpdatePipelineRequest
  ): Promise<Pipeline> {
    try {
      console.log('[PipelineService] Updating pipeline:', pipelineId);

      // Create authenticated fetcher with pipeline API base URL
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.patch<Pipeline>(
        `/pipeline/${pipelineId}`,
        payload,
        pipelineSchema
      );

      console.log('[PipelineService] Successfully updated pipeline:', response.id);

      // Audit log successful update
      await auditPipelineUpdate(session, pipelineId, payload);

      return response;
    } catch (error) {
      // Audit error
      await auditPipelineError(session, 'update', error, { pipelineId, payload });
      return this.handleError(error);
    }
  }

  /**
   * Assign pipeline to job
   * POST /pipeline/assign
   * Requires ADMIN or HR role
   */
  async assignPipeline(
    session: UserSession,
    token: string,
    payload: AssignPipelineRequest
  ): Promise<{ message: string }> {
    try {
      console.log('[PipelineService] Assigning pipeline:', payload);

      // Create authenticated fetcher with pipeline API base URL
      const authFetcher = createAuthenticatedFetcher(token, { baseUrl: this.baseUrl });
      const response = await authFetcher.post<{ message: string }>(
        '/pipeline/assign',
        payload,
        z.object({ message: z.string() })
      );

      console.log('[PipelineService] Successfully assigned pipeline');

      // Audit log successful assignment
      await auditPipelineAssign(session, payload.pipeline_id, payload.job_id);

      return response;
    } catch (error) {
      // Audit error
      await auditPipelineError(session, 'assign', error, { payload });
      return this.handleError(error);
    }
  }
}

/**
 * Singleton instance
 */
export const pipelineService = new PipelineService();
