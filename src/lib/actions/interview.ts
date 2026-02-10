'use server';

import { interviewService, InterviewApiError } from '@/domain/interview/service';
import {
  requireCanListInterviews,
  requireCanViewInterview,
  requireCanCancelInterview,
} from '@/domain/interview/permissions.server';
import {
  type PendingInterviewItem,
  type InterviewDetail,
  type ApplicationInterviewItem,
  type CancelInterviewResponse,
} from '@/domain/interview/schemas';
import { isNextRouterError } from 'next/dist/client/components/is-next-router-error';
import type { ActionResult } from './types';

// ============================================================================
// Pending Interviews Result (special: kind-based error differentiation)
// ============================================================================

export type PendingInterviewErrorKind = 'schema_mismatch' | 'forbidden' | 'network' | 'config' | 'unknown';

export type PendingInterviewsResult =
  | { success: true; data: PendingInterviewItem[] }
  | { success: false; error: string; kind: PendingInterviewErrorKind };

function classifyInterviewError(error: unknown): { error: string; kind: PendingInterviewErrorKind } {
  if (error instanceof InterviewApiError) {
    switch (error.code) {
      case 'SCHEMA_MISMATCH':
        return { error: 'Interview service response outdated — please contact admin', kind: 'schema_mismatch' };
      case 'CONFIG_ERROR':
        return { error: 'Interview service is not configured', kind: 'config' };
      case 'NETWORK_ERROR':
        return { error: 'Interview service is unreachable', kind: 'network' };
      case 'FORBIDDEN':
        return { error: 'You do not have access to view interviews', kind: 'forbidden' };
      default:
        return { error: error.message, kind: 'unknown' };
    }
  }
  return { error: error instanceof Error ? error.message : 'Failed to load interviews', kind: 'unknown' };
}

/**
 * Format error for ActionResult
 */
function formatError(error: unknown): {
  error: string;
  code?: string;
} {
  if (error instanceof InterviewApiError) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

// ============================================================================
// Get My Pending Interviews
// ============================================================================

/**
 * Get list of pending interviews for the current user.
 *
 * Returns { success: true, data } on success.
 * Returns { success: false, error, kind } on failure — the service preserves
 * semantic error codes so the page can render the right banner.
 */
export async function getMyPendingInterviewsAction(): Promise<PendingInterviewsResult> {
  try {
    const session = await requireCanListInterviews();
    const result = await interviewService.getMyPendingInterviews(session, session.token);
    return { success: true, data: result.data };
  } catch (error) {
    if (isNextRouterError(error)) throw error;
    return { success: false, ...classifyInterviewError(error) };
  }
}

// ============================================================================
// Get Interview Detail
// ============================================================================

/**
 * Get interview details by ID
 */
export async function getInterviewDetailAction(
  interviewId: string
): Promise<ActionResult<InterviewDetail>> {
  try {
    const session = await requireCanViewInterview();
    const interview = await interviewService.getInterviewDetail(
      session,
      session.token,
      interviewId
    );
    return { success: true, data: interview };
  } catch (error) {
    if (isNextRouterError(error)) throw error;
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Get Interviews for Application (Phase 2B)
// ============================================================================

/**
 * Get interviews for an application (used in drawer timeline)
 */
export async function getInterviewsForApplicationAction(
  applicationId: string
): Promise<ActionResult<ApplicationInterviewItem[]>> {
  try {
    const session = await requireCanListInterviews();
    const result = await interviewService.getInterviewsForApplication(
      session,
      session.token,
      applicationId
    );
    return { success: true, data: result.data };
  } catch (error) {
    if (isNextRouterError(error)) throw error;
    return { success: false, ...formatError(error) };
  }
}

// ============================================================================
// Cancel Interview (Phase 2B)
// ============================================================================

/**
 * Cancel an interview
 */
export async function cancelInterviewAction(
  interviewId: string
): Promise<ActionResult<CancelInterviewResponse>> {
  try {
    const session = await requireCanCancelInterview();
    const result = await interviewService.cancelInterview(
      session,
      session.token,
      interviewId
    );
    return { success: true, data: result };
  } catch (error) {
    if (isNextRouterError(error)) throw error;
    return { success: false, ...formatError(error) };
  }
}
