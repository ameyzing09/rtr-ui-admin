'use server';

import { revalidatePath } from 'next/cache';
import { trackingService, TrackingApiError } from '@/domain/tracking/service';
import {
  requireCanListApplications,
  requireCanUpdateApplications,
} from '@/domain/applications/permissions.server';
import type {
  TrackingState,
  StageHistory,
  StageHistoryResponse,
  PipelineBoard,
  MoveStageRequest,
  UpdateStatusRequest,
} from '@/domain/tracking/schemas';
import { isAdjacentMove } from '@/domain/tracking/schemas';

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
    console.log('🔄 [getTrackingStateAction] Fetching tracking state:', applicationId);

    const session = await requireCanListApplications();
    const state = await trackingService.getTrackingState(session.token, applicationId);

    console.log('✅ [getTrackingStateAction] Successfully fetched tracking state');

    return { success: true, data: state };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [getTrackingStateAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Move Stage
// ============================================================================

/**
 * Move application to a different stage
 * Only allows adjacent stage moves (currentIndex ± 1)
 */
export async function moveStageAction(
  applicationId: string,
  request: MoveStageRequest,
  currentStageIndex: number,
  targetStageIndex: number
): Promise<ActionResult<TrackingState>> {
  try {
    console.log('🔄 [moveStageAction] Moving application:', {
      applicationId,
      toStageId: request.to_stage_id,
      currentIndex: currentStageIndex,
      targetIndex: targetStageIndex,
    });

    // Validate adjacent move
    if (!isAdjacentMove(currentStageIndex, targetStageIndex)) {
      return {
        success: false,
        error: 'Can only move to adjacent stages',
        code: 'INVALID_MOVE',
      };
    }

    const session = await requireCanUpdateApplications();
    const state = await trackingService.moveStage(session.token, applicationId, request);

    // Revalidate job detail page
    revalidatePath('/dashboard/jobs/[id]', 'page');

    console.log('✅ [moveStageAction] Successfully moved application');

    return { success: true, data: state };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [moveStageAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Update Status
// ============================================================================

/**
 * Update application status (ACTIVE, HIRED, REJECTED, etc.)
 */
export async function updateStatusAction(
  applicationId: string,
  request: UpdateStatusRequest
): Promise<ActionResult<TrackingState>> {
  try {
    console.log('🔄 [updateStatusAction] Updating status:', {
      applicationId,
      newStatus: request.status,
    });

    const session = await requireCanUpdateApplications();
    const state = await trackingService.updateStatus(session.token, applicationId, request);

    // Revalidate job detail page
    revalidatePath('/dashboard/jobs/[id]', 'page');

    console.log('✅ [updateStatusAction] Successfully updated status');

    return { success: true, data: state };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [updateStatusAction] Failed:', error);
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
    console.log('🔄 [getStageHistoryAction] Fetching history:', applicationId);

    const session = await requireCanListApplications();
    const response = await trackingService.getStageHistory(
      session.token,
      applicationId,
      limit,
      offset
    );

    console.log('✅ [getStageHistoryAction] Successfully fetched history:', {
      count: response.data.length,
    });

    return { success: true, data: response };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [getStageHistoryAction] Failed:', error);
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
    console.log('🔄 [getPipelineBoardAction] Fetching board:', { pipelineId, options });

    const session = await requireCanListApplications();
    const board = await trackingService.getPipelineBoard(
      session.token,
      pipelineId,
      options
    );

    console.log('✅ [getPipelineBoardAction] Successfully fetched board:', {
      stages: board.stages.length,
      total: board.totalApplications,
    });

    return { success: true, data: board };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('❌ [getPipelineBoardAction] Failed:', error);
    return { success: false, ...formatError(error) };
  }
}
