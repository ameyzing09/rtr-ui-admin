'use server';

import { evaluationService, EvaluationApiError } from '@/domain/evaluation/service';
import {
  requireCanListEvaluations,
  requireCanViewEvaluations,
  requireCanRespondToEvaluation,
} from '@/domain/evaluation/permissions.server';
import {
  submitEvaluationRequestSchema,
  type EvaluationDetails,
  type PendingEvaluationsList,
  type SubmitEvaluationRequest,
  type SubmitEvaluationResponse,
} from '@/domain/evaluation/schemas';
import { ZodError } from 'zod';
import type { ActionResult } from './types';


/**
 * Format error for ActionResult
 */
function formatError(error: unknown): {
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
} {
  if (error instanceof EvaluationApiError) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

// ============================================================================
// Get My Pending Evaluations
// ============================================================================

/**
 * Get list of pending evaluations for the current user
 */
export async function getMyPendingEvaluationsAction(): Promise<
  ActionResult<PendingEvaluationsList>
> {
  try {
    // Check permissions
    const session = await requireCanListEvaluations();

    // Fetch pending evaluations
    const evaluations = await evaluationService.getMyPendingEvaluations(
      session,
      session.token
    );

    return {
      success: true,
      data: evaluations,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    return {
      success: false,
      ...formatError(error),
    };
  }
}

// ============================================================================
// Get Evaluation Details
// ============================================================================

/**
 * Get evaluation details with signal definitions
 */
export async function getEvaluationDetailsAction(
  evaluationId: string
): Promise<ActionResult<EvaluationDetails | null>> {
  try {
    // Check permissions
    const session = await requireCanViewEvaluations();

    // Fetch evaluation details
    const evaluation = await evaluationService.getEvaluationDetails(
      session,
      session.token,
      evaluationId
    );

    return {
      success: true,
      data: evaluation,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    return {
      success: false,
      ...formatError(error),
    };
  }
}

// ============================================================================
// Submit Evaluation Response
// ============================================================================

/**
 * Submit evaluation response
 * This is an immutable operation - responses cannot be modified once submitted
 */
export async function submitEvaluationResponseAction(
  evaluationId: string,
  responseData: SubmitEvaluationRequest
): Promise<ActionResult<SubmitEvaluationResponse>> {
  try {
    // Check permissions
    const session = await requireCanRespondToEvaluation();

    // Validate request payload
    const validatedPayload = submitEvaluationRequestSchema.parse(responseData);

    // Submit response
    const result = await evaluationService.submitResponse(
      session,
      session.token,
      evaluationId,
      validatedPayload
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        fieldErrors: Object.fromEntries(
          error.issues.map((err) => [err.path.join('.'), [err.message]])
        ),
      };
    }

    return {
      success: false,
      ...formatError(error),
    };
  }
}
