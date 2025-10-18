import { audit } from '@/lib/audit/log';
import type { AuthSession } from '@/lib/auth/types';
import type {
  Application,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationStatus,
} from './schemas';

/**
 * Audit application creation
 */
export async function auditApplicationCreate(
  session: AuthSession,
  application: Application,
  request: CreateApplicationRequest
): Promise<void> {
  await audit('application.create', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
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
  session: AuthSession,
  applicationId: string,
  patch: UpdateApplicationRequest,
  previousApplication?: Application
): Promise<void> {
  await audit('application.update', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
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
  session: AuthSession,
  application: Application,
  oldStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): Promise<void> {
  await audit('application.status_change', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
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
  session: AuthSession,
  applicationId: string,
  application?: Application
): Promise<void> {
  await audit('application.delete', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
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
  session: AuthSession,
  operation: string,
  error: unknown,
  details?: Record<string, unknown>
): Promise<void> {
  await audit(`application.${operation}.error` as any, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
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
