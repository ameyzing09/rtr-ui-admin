'use server';

import { createAuthenticatedFetcher, ApiException } from '@/lib/api/fetcher';
import {
  requireCanViewSignals,
  requireCanSetManualSignal,
} from '@/domain/evaluation/permissions.server';
import {
  applicationSignalsSchema,
  actionsWithSignalsSchema,
  setManualSignalResponseSchema,
  setManualSignalRequestSchema,
  type ApplicationSignals,
  type ActionsWithSignals,
  type SetManualSignalRequest,
  type SetManualSignalResponse,
} from '@/domain/signals/schemas';
import { ZodError } from 'zod';

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
 * Error class for Signal API operations
 */
class SignalApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'SignalApiError';
  }
}

/**
 * Format error for ActionResult
 */
function formatError(error: unknown): {
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
} {
  if (error instanceof SignalApiError) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  if (error instanceof ApiException) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

// ============================================================================
// Get Application Signals
// ============================================================================

/**
 * Get all signals for an application
 */
export async function getApplicationSignalsAction(
  applicationId: string,
  includeHistory?: boolean
): Promise<ActionResult<ApplicationSignals>> {
  try {
    // Check permissions
    const session = await requireCanViewSignals();

    // Build URL with optional query params
    let url = `/applications/${applicationId}/signals`;
    if (includeHistory) {
      url += '?includeHistory=true';
    }

    // Fetch signals
    const authFetcher = createAuthenticatedFetcher(session.token);
    const data = await authFetcher.get(url, applicationSignalsSchema);

    return {
      success: true,
      data,
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
// Get Application Actions with Signal Conditions
// ============================================================================

/**
 * Get all available actions with their signal conditions
 * Shows which actions are available and which conditions are met/unmet
 */
export async function getApplicationActionsWithSignalsAction(
  applicationId: string
): Promise<ActionResult<ActionsWithSignals>> {
  try {
    // Check permissions
    const session = await requireCanViewSignals();

    // Fetch actions with signals
    const url = `/applications/${applicationId}/actions-with-signals`;
    const authFetcher = createAuthenticatedFetcher(session.token);
    const data = await authFetcher.get(url, actionsWithSignalsSchema);

    return {
      success: true,
      data,
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
// Set Manual Signal
// ============================================================================

/**
 * Set a manual signal on an application
 * Used by HR/Admin to manually set signal values
 */
export async function setManualSignalAction(
  applicationId: string,
  request: SetManualSignalRequest
): Promise<ActionResult<SetManualSignalResponse>> {
  try {
    // Check permissions
    const session = await requireCanSetManualSignal();

    // Validate request payload
    const validatedPayload = setManualSignalRequestSchema.parse(request);

    // Set signal
    const url = `/applications/${applicationId}/signals`;
    const authFetcher = createAuthenticatedFetcher(session.token);
    const data = await authFetcher.post(url, validatedPayload, setManualSignalResponseSchema);

    return {
      success: true,
      data,
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
