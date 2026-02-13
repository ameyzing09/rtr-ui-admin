'use server';

import { createAuthenticatedFetcher, ApiException } from '@/lib/api/fetcher';
import { env } from '@/config/env';
import {
  requireCanViewSignals,
  requireCanSetManualSignal,
} from '@/domain/evaluation/permissions.server';
import {
  applicationSignalsSchema,
  actionsWithSignalsSchema,
  setManualSignalResponseSchema,
  setManualSignalRequestSchema,
  type ApplicationSignal,
  type ActionsWithSignals,
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
): Promise<ActionResult<ApplicationSignal[]>> {
  try {
    // Check permissions
    const session = await requireCanViewSignals();

    // Build URL with optional query params
    let url = `/applications/${applicationId}/signals`;
    if (includeHistory) {
      url += '?include_history=true';
    }

    // Fetch signals
    const authFetcher = createAuthenticatedFetcher(session.token, {
      baseUrl: env.NEXT_PUBLIC_EVALUATION_API_BASE_URL,
    });
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
 * Uses the tracking service (not evaluation) — same endpoint as getAvailableActions
 */
export async function getApplicationActionsWithSignalsAction(
  applicationId: string
): Promise<ActionResult<ActionsWithSignals>> {
  try {
    // Check permissions
    const session = await requireCanViewSignals();

    // Fetch actions from tracking service
    const url = `/applications/${applicationId}/actions`;
    const authFetcher = createAuthenticatedFetcher(session.token, {
      baseUrl: env.NEXT_PUBLIC_TRACKING_API_BASE_URL,
    });
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
 * UI-facing input for setManualSignalAction
 * (uses friendly field names before transformation)
 */
interface SetManualSignalInput {
  key: string;
  value: boolean | number | string;
  reason?: string;
}

/**
 * Derive signal_type from a JS value
 */
function deriveSignalType(value: boolean | number | string): 'boolean' | 'integer' | 'float' | 'text' {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'float';
  }
  return 'text';
}

/**
 * Set a manual signal on an application
 * Used by HR/Admin to manually set signal values
 *
 * Transforms UI-friendly input into backend-expected format:
 * - key → signal_key
 * - auto-derives signal_type from value
 * - stringifies value (e.g. true → "true", 42 → "42")
 * - reason → note
 */
export async function setManualSignalAction(
  applicationId: string,
  input: SetManualSignalInput
): Promise<ActionResult<SetManualSignalResponse>> {
  try {
    // Check permissions
    const session = await requireCanSetManualSignal();

    // Transform UI input to backend-expected format
    const payload = {
      signal_key: input.key,
      signal_type: deriveSignalType(input.value),
      value: String(input.value),
      note: input.reason || undefined,
    };

    // Validate the backend payload
    const validatedPayload = setManualSignalRequestSchema.parse(payload);

    // Set signal
    const url = `/applications/${applicationId}/signals`;
    const authFetcher = createAuthenticatedFetcher(session.token, {
      baseUrl: env.NEXT_PUBLIC_EVALUATION_API_BASE_URL,
    });
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
