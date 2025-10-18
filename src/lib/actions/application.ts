'use server';

import { applicationService } from '@/domain/applications/service';
import {
  requireCanListApplications,
  requireCanCreateApplications,
  requireCanUpdateApplications,
  requireCanDeleteApplications,
} from '@/domain/applications/permissions';
import {
  auditApplicationList,
  auditApplicationView,
  auditApplicationCreate,
  auditApplicationUpdate,
  auditApplicationStatusChange,
  auditApplicationDelete,
} from '@/domain/applications/audit';
import {
  createApplicationRequestSchema,
  updateApplicationRequestSchema,
  type Application,
  type ApplicationListResponse,
  type CreateApplicationRequest,
  type UpdateApplicationRequest,
} from '@/domain/applications/schemas';
import { ActionResult, formatError } from '@/lib/utils/actions';
import { ZodError } from 'zod';

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

    // Fetch applications
    const applications = await applicationService.listApplications(
      session,
      session.token,
      jobId
    );

    // Audit log
    await auditApplicationList(session, applications.length, { jobId });

    return {
      success: true,
      data: applications,
    };
  } catch (error) {
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

    // Fetch application
    const application = await applicationService.getApplication(
      session,
      session.token,
      applicationId
    );

    // Audit log
    await auditApplicationView(session, application);

    return {
      success: true,
      data: application,
    };
  } catch (error) {
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

    // Create application
    const application = await applicationService.createApplication(
      session,
      session.token,
      validatedPayload
    );

    // Audit log
    await auditApplicationCreate(session, application, validatedPayload);

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        fieldErrors: Object.fromEntries(
          error.errors.map((err) => [err.path.join('.'), err.message])
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

    // Get current application (for status change audit)
    const currentApplication = await applicationService.getApplication(
      session,
      session.token,
      applicationId
    );

    // Validate payload
    const validatedPayload = updateApplicationRequestSchema.parse(payload);

    // Update application
    const updatedApplication = await applicationService.updateApplication(
      session,
      session.token,
      applicationId,
      validatedPayload
    );

    // Audit log
    await auditApplicationUpdate(session, updatedApplication, validatedPayload);

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
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        fieldErrors: Object.fromEntries(
          error.errors.map((err) => [err.path.join('.'), err.message])
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

    // Get application details before deletion (for audit)
    let application: Application | undefined;
    try {
      application = await applicationService.getApplication(
        session,
        session.token,
        applicationId
      );
    } catch {
      // If we can't get the application, it might already be deleted
      // Continue with deletion attempt
    }

    // Delete application
    await applicationService.deleteApplication(session, session.token, applicationId);

    // Audit log
    await auditApplicationDelete(session, applicationId, application);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      ...formatError(error),
    };
  }
}
