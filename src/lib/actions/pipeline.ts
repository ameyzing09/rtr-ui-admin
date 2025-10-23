'use server';

import {
  requireCanListPipelines,
  requireCanCreatePipelines,
  requireCanReadPipelines,
  requireCanUpdatePipelines,
  requireCanAssignPipelines,
} from '@/domain/pipelines/permissions.server';
import { pipelineService, PipelineApiError } from '@/domain/pipelines/service';
import type {
  Pipeline,
  CreatePipelineRequest,
  UpdatePipelineRequest,
  AssignPipelineRequest,
  PipelineListResponse,
} from '@/domain/pipelines/schemas';

/**
 * Generic action result type
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: string;
      fieldErrors?: Record<string, string[]>;
    };

/**
 * Parse backend validation errors into field-level errors
 */
function parseValidationErrors(errors: string[]): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  errors.forEach((error) => {
    // Pattern: "field_name: error message"
    const match = error.match(/^(\w+):\s*(.+)/);
    if (match) {
      const fieldName = match[1];
      const errorMsg = match[2];
      if (!fieldErrors[fieldName]) fieldErrors[fieldName] = [];
      fieldErrors[fieldName].push(errorMsg);
      return;
    }

    // Generic error
    if (!fieldErrors.general) fieldErrors.general = [];
    fieldErrors.general.push(error);
  });

  return fieldErrors;
}

/**
 * Format error for ActionResult
 * Extracts error message, code, and field-level errors from various error types
 */
function formatError(error: unknown): {
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
} {
  if (error instanceof PipelineApiError) {
    let fieldErrors: Record<string, string[]> | undefined =
      error.details?.fieldErrors as Record<string, string[]> | undefined;

    // Check if error.details contains a message array (backend validation errors)
    if (error.details && Array.isArray(error.details.message)) {
      fieldErrors = parseValidationErrors(error.details.message as string[]);
    }

    return {
      error: error.message,
      code: error.code,
      fieldErrors,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

// ============================================================================
// Pipeline Actions
// ============================================================================

/**
 * Server action to list pipelines
 * GET /pipeline
 *
 * @returns List of pipelines for the tenant
 */
export async function listPipelinesAction(): Promise<ActionResult<PipelineListResponse>> {
  try {
    console.log('🔄 [listPipelinesAction] Fetching pipelines');

    const session = await requireCanListPipelines();
    const pipelines = await pipelineService.listPipelines(session, session.token);

    console.log('✅ [listPipelinesAction] Successfully retrieved pipelines:', {
      count: pipelines.length,
    });

    return {
      success: true,
      data: pipelines,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [listPipelinesAction] Failed:', error);
    return {
      success: false,
      ...formatError(error),
    };
  }
}

/**
 * Server action to get a single pipeline by ID
 * GET /pipeline/:id
 *
 * @param id - Pipeline ID
 * @returns Pipeline object or 404 error
 */
export async function getPipelineAction(id: string): Promise<ActionResult<Pipeline>> {
  try {
    console.log('🔄 [getPipelineAction] Fetching pipeline:', id);

    const session = await requireCanReadPipelines();
    const pipeline = await pipelineService.getPipeline(session, session.token, id);

    console.log('✅ [getPipelineAction] Successfully retrieved pipeline:', pipeline.id);

    return {
      success: true,
      data: pipeline,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [getPipelineAction] Failed:', error);
    return {
      success: false,
      ...formatError(error),
    };
  }
}

/**
 * Server action to create a new pipeline
 * POST /pipeline
 * Requires ADMIN or HR role
 *
 * @param payload - Pipeline creation data
 * @returns Created pipeline object
 */
export async function createPipelineAction(
  payload: CreatePipelineRequest
): Promise<ActionResult<Pipeline>> {
  try {
    console.log('🔄 [createPipelineAction] Creating pipeline:', { name: payload.name });

    const session = await requireCanCreatePipelines();
    const pipeline = await pipelineService.createPipeline(session, session.token, payload);

    console.log('✅ [createPipelineAction] Successfully created pipeline:', pipeline.id);

    return {
      success: true,
      data: pipeline,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [createPipelineAction] Failed:', error);

    return {
      success: false,
      ...formatError(error),
    };
  }
}

/**
 * Server action to update an existing pipeline
 * PATCH /pipeline/:id
 * Supports partial updates
 * Requires ADMIN or HR role
 *
 * @param id - Pipeline ID
 * @param payload - Fields to update
 * @returns Updated pipeline object
 */
export async function updatePipelineAction(
  id: string,
  payload: UpdatePipelineRequest
): Promise<ActionResult<Pipeline>> {
  try {
    console.log('🔄 [updatePipelineAction] Updating pipeline:', id);

    const session = await requireCanUpdatePipelines();
    const pipeline = await pipelineService.updatePipeline(
      session,
      session.token,
      id,
      payload
    );

    console.log('✅ [updatePipelineAction] Successfully updated pipeline:', pipeline.id);

    return {
      success: true,
      data: pipeline,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [updatePipelineAction] Failed:', error);

    return {
      success: false,
      ...formatError(error),
    };
  }
}

/**
 * Server action to assign a pipeline to a job
 * POST /pipeline/assign
 * Requires ADMIN or HR role
 *
 * @param payload - Assignment data (pipeline_id, job_id)
 * @returns Success message
 */
export async function assignPipelineAction(
  payload: AssignPipelineRequest
): Promise<ActionResult<{ message: string }>> {
  try {
    console.log('🔄 [assignPipelineAction] Assigning pipeline:', payload);

    const session = await requireCanAssignPipelines();
    const result = await pipelineService.assignPipeline(session, session.token, payload);

    console.log('✅ [assignPipelineAction] Successfully assigned pipeline');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [assignPipelineAction] Failed:', error);

    return {
      success: false,
      ...formatError(error),
    };
  }
}
