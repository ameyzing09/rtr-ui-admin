'use server';

import { applicationService, ApplicationApiError } from '@/domain/applications/service';
import {
  requireCanListApplications,
  requireCanCreateApplications,
  requireCanUpdateApplications,
  requireCanDeleteApplications,
} from '@/domain/applications/permissions.server';
import {
  auditApplicationStatusChange,
} from '@/domain/applications/audit';
import {
  createApplicationRequestSchema,
  updateApplicationRequestSchema,
  type Application,
  type ApplicationListResponse,
  type CreateApplicationRequest,
  type UpdateApplicationRequest,
} from '@/domain/applications/schemas';
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
 * Format error for ActionResult
 * Extracts error message, code, and field-level errors from various error types
 */
function formatError(error: unknown): {
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
} {
  if (error instanceof ApplicationApiError) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

// ============================================================================
// C2: List Applications
// ============================================================================

/**
 * List all applications for the authenticated tenant
 * Optionally filter by jobId
 */
export async function listApplicationsAction(
  jobId?: string
): Promise<ActionResult<ApplicationListResponse>> {
  try {
    // Check permissions
    const session = await requireCanListApplications();

    // Fetch applications (audit logging handled in service)
    const applications = await applicationService.listApplications(
      session,
      session.token,
      jobId
    );

    return {
      success: true,
      data: applications,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
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
// C3: Get Application by ID
// ============================================================================

/**
 * Get a single application by ID
 */
export async function getApplicationAction(
  applicationId: string
): Promise<ActionResult<Application>> {
  try {
    // Check permissions
    const session = await requireCanListApplications();

    // Fetch application (audit logging handled in service)
    const application = await applicationService.getApplication(
      session,
      session.token,
      applicationId
    );

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
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
// C1: Create Application
// ============================================================================

/**
 * Create a new application
 */
export async function createApplicationAction(
  payload: CreateApplicationRequest
): Promise<ActionResult<Application>> {
  try {
    // Check permissions
    const session = await requireCanCreateApplications();

    // Validate payload
    const validatedPayload = createApplicationRequestSchema.parse(payload);

    // Create application (audit logging handled in service)
    const application = await applicationService.createApplication(
      session,
      session.token,
      validatedPayload
    );

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

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

// ============================================================================
// C3: Update Application
// ============================================================================

/**
 * Update an existing application
 */
export async function updateApplicationAction(
  applicationId: string,
  payload: UpdateApplicationRequest
): Promise<ActionResult<Application>> {
  try {
    // Check permissions
    const session = await requireCanUpdateApplications();

    // Get current application (for status change detection)
    const currentApplication = await applicationService.getApplication(
      session,
      session.token,
      applicationId
    );

    // Validate payload
    const validatedPayload = updateApplicationRequestSchema.parse(payload);

    // Update application (basic audit logging handled in service)
    const updatedApplication = await applicationService.updateApplication(
      session,
      session.token,
      applicationId,
      validatedPayload
    );

    // If status changed, log special status change audit
    if (
      validatedPayload.status &&
      validatedPayload.status !== currentApplication.status
    ) {
      await auditApplicationStatusChange(
        session,
        updatedApplication,
        currentApplication.status,
        validatedPayload.status
      );
    }

    return {
      success: true,
      data: updatedApplication,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

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

// ============================================================================
// C3: Delete Application
// ============================================================================

/**
 * Delete an application
 */
export async function deleteApplicationAction(
  applicationId: string
): Promise<ActionResult<void>> {
  try {
    // Check permissions
    const session = await requireCanDeleteApplications();

    // Delete application (audit logging handled in service)
    await applicationService.deleteApplication(session, session.token, applicationId);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    // Re-throw Next.js redirect errors to allow framework-level handling
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    return {
      success: false,
      ...formatError(error),
    };
  }
}
