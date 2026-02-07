'use server';

import { revalidatePath } from 'next/cache';
import { trackingService, TrackingApiError } from '@/domain/tracking/service';
import {
  requireCanListApplications,
  requireCanUpdateApplications,
} from '@/domain/applications/permissions.server';
import type {
  TrackingState,
  StageHistoryResponse,
  PipelineBoard,
  AvailableActionsResponse,
  ExecuteActionRequest,
} from '@/domain/tracking/schemas';

/**
 * Generic action result type
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: string;
    };

/**
 * Format error for ActionResult
 */
function formatError(error: unknown): { error: string; code?: string } {
  if (error instanceof TrackingApiError) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

// ============================================================================
// Get Tracking State
// ============================================================================

/**
 * Get tracking state for an application
 */
export async function getTrackingStateAction(
  applicationId: string
): Promise<ActionResult<TrackingState>> {
  try {
    console.log('[getTrackingStateAction] Fetching tracking state:', applicationId);

    const session = await requireCanListApplications();
    const state = await trackingService.getTrackingState(session.token, applicationId);

    console.log('[getTrackingStateAction] Successfully fetched tracking state:', state);

    return { success: true, data: state };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    // Log full error details to terminal
    const errorDetails = (error as { details?: unknown })?.details;
    console.error('[getTrackingStateAction] FAILED:', JSON.stringify({
      message: error instanceof Error ? error.message : String(error),
      details: errorDetails,
    }, null, 2));

    // Pass detailed error to client
    const formatted = formatError(error);
    return {
      success: false,
      ...formatted,
      // Include Zod error details if available
      error: errorDetails
        ? `${formatted.error} - Details: ${JSON.stringify(errorDetails)}`
        : formatted.error,
    };
  }
}

// ============================================================================
// Get Available Actions (v2 Action Engine)
// ============================================================================

/**
 * Get available actions for an application
 */
export async function getAvailableActionsAction(
  applicationId: string
): Promise<ActionResult<AvailableActionsResponse>> {
  try {
    console.log('[getAvailableActionsAction] Fetching actions:', applicationId);

    const session = await requireCanListApplications();
    const response = await trackingService.getAvailableActions(session.token, applicationId);

    console.log('[getAvailableActionsAction] Successfully fetched actions:', {
      count: response.availableActions.length,
    });

    return { success: true, data: response };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[getAvailableActionsAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Execute Action (v2 Action Engine)
// ============================================================================

/**
 * Execute an action on an application (replaces moveStage + updateStatus)
 */
export async function executeActionAction(
  applicationId: string,
  request: ExecuteActionRequest
): Promise<ActionResult<TrackingState>> {
  try {
    console.log('[executeActionAction] Executing action:', {
      applicationId,
      action: request.action,
    });

    const session = await requireCanUpdateApplications();
    const state = await trackingService.executeAction(session.token, applicationId, request);

    // Revalidate job detail page
    revalidatePath('/dashboard/jobs/[id]', 'page');

    console.log('[executeActionAction] Successfully executed action');

    return { success: true, data: state };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[executeActionAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Get Stage History
// ============================================================================

/**
 * Get stage history for an application
 */
export async function getStageHistoryAction(
  applicationId: string,
  limit = 50,
  offset = 0
): Promise<ActionResult<StageHistoryResponse>> {
  try {
    console.log('[getStageHistoryAction] Fetching history:', applicationId);

    const session = await requireCanListApplications();
    const response = await trackingService.getStageHistory(
      session.token,
      applicationId,
      limit,
      offset
    );

    console.log('[getStageHistoryAction] Successfully fetched history:', {
      count: response.data.length,
    });

    return { success: true, data: response };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[getStageHistoryAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Get Pipeline Board
// ============================================================================

/**
 * Get pipeline board (Kanban view)
 */
export async function getPipelineBoardAction(
  pipelineId: string,
  options?: { status?: string; jobId?: string }
): Promise<ActionResult<PipelineBoard>> {
  try {
    console.log('[getPipelineBoardAction] Fetching board:', { pipelineId, options });

    const session = await requireCanListApplications();
    const board = await trackingService.getPipelineBoard(
      session.token,
      pipelineId,
      options
    );

    console.log('[getPipelineBoardAction] Successfully fetched board:', {
      stages: board.stages.length,
      total: board.totalApplications,
    });

    return { success: true, data: board };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[getPipelineBoardAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}
