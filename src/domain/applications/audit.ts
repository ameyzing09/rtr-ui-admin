import { audit } from '@/lib/audit/log';
import type { UserSession } from '@/lib/rbac/guard';
import type {
  Application,
  UpdateApplicationRequest,
  ApplicationStatus,
} from './schemas';

/**
 * Audit application creation
 */
export async function auditApplicationCreate(
  session: UserSession,
  application: Application
): Promise<void> {
  await audit('application.create', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: application.id,
    targetType: 'application',
    details: {
      applicationId: application.id,
      jobId: application.jobId,
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      applicantPhone: application.applicantPhone,
      status: application.status,
    },
  }).catch((error) => {
    console.error('Failed to audit application creation:', error);
  });
}

/**
 * Audit application update
 */
export async function auditApplicationUpdate(
  session: UserSession,
  applicationId: string,
  patch: UpdateApplicationRequest,
  previousApplication?: Application
): Promise<void> {
  await audit('application.update', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: applicationId,
    targetType: 'application',
    details: {
      applicationId,
      jobId: previousApplication?.jobId,
      applicantName: previousApplication?.applicantName,
      updated_fields: Object.keys(patch),
      changes: patch,
    },
  }).catch((error) => {
    console.error('Failed to audit application update:', error);
  });
}

/**
 * Audit application status change
 * Special audit for status changes (important business event)
 */
export async function auditApplicationStatusChange(
  session: UserSession,
  application: Application,
  oldStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): Promise<void> {
  await audit('application.status_change', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: application.id,
    targetType: 'application',
    details: {
      applicationId: application.id,
      jobId: application.jobId,
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      oldStatus,
      newStatus,
    },
  }).catch((error) => {
    console.error('Failed to audit application status change:', error);
  });
}

/**
 * Audit application deletion
 */
export async function auditApplicationDelete(
  session: UserSession,
  applicationId: string,
  application?: Application
): Promise<void> {
  await audit('application.delete', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: applicationId,
    targetType: 'application',
    details: {
      applicationId,
      jobId: application?.jobId,
      applicantName: application?.applicantName,
      applicantEmail: application?.applicantEmail,
      status: application?.status,
    },
  }).catch((error) => {
    console.error('Failed to audit application deletion:', error);
  });
}

/**
 * Audit application operation failure
 */
export async function auditApplicationError(
  session: UserSession,
  operation: string,
  error: unknown,
  details?: Record<string, unknown>
): Promise<void> {
  await audit(`application.${operation}.error` as unknown as Parameters<typeof audit>[0], {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'failure',
    targetType: 'application',
    details: {
      error: error instanceof Error ? error.message : String(error),
      ...details,
    },
  }).catch((auditError) => {
    console.error('Failed to audit application error:', auditError);
  });
}

/**
 * Audit application list operation
 * Triggered when user lists applications
 */
export async function auditApplicationList(
  session: UserSession,
  filters?: Record<string, unknown>
): Promise<void> {
  await audit('application.list' as unknown as Parameters<typeof audit>[0], {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetType: 'application',
    details: {
      filters,
    },
  }).catch((error) => {
    console.error('Failed to audit application list:', error);
  });
}

/**
 * Audit application view operation
 * Triggered when user views application details
 */
export async function auditApplicationView(
  session: UserSession,
  applicationId: string,
  application?: Application
): Promise<void> {
  await audit('application.view' as unknown as Parameters<typeof audit>[0], {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: applicationId,
    targetType: 'application',
    details: {
      applicantName: application?.applicantName,
      applicantEmail: application?.applicantEmail,
      jobId: application?.jobId,
    },
  }).catch((error) => {
    console.error('Failed to audit application view:', error);
  });
}
