import { auditLog } from '@/lib/audit/auditLog';
import type { Session } from '@/domain/auth/schemas';
import type {
  Application,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationStatus,
} from './schemas';

// ============================================================================
// Audit Actions
// ============================================================================

/**
 * Application-related audit actions
 */
export enum ApplicationAuditAction {
  LIST = 'APPLICATION_LIST',
  VIEW = 'APPLICATION_VIEW',
  CREATE = 'APPLICATION_CREATE',
  UPDATE = 'APPLICATION_UPDATE',
  STATUS_CHANGE = 'APPLICATION_STATUS_CHANGE',
  DELETE = 'APPLICATION_DELETE',
}

// ============================================================================
// Audit Functions
// ============================================================================

/**
 * Audit: List applications
 */
export async function auditApplicationList(
  session: Session,
  count: number,
  filters?: { jobId?: string }
): Promise<void> {
  await auditLog({
    userId: session.user.id,
    tenantId: session.tenantId,
    action: ApplicationAuditAction.LIST,
    resourceType: 'application',
    resourceId: null,
    details: {
      count,
      filters,
    },
  });
}

/**
 * Audit: View application
 */
export async function auditApplicationView(
  session: Session,
  application: Application
): Promise<void> {
  await auditLog({
    userId: session.user.id,
    tenantId: session.tenantId,
    action: ApplicationAuditAction.VIEW,
    resourceType: 'application',
    resourceId: application.id,
    details: {
      applicationId: application.id,
      jobId: application.jobId,
      applicantName: application.applicantName,
      status: application.status,
    },
  });
}

/**
 * Audit: Create application
 */
export async function auditApplicationCreate(
  session: Session,
  application: Application,
  requestData: CreateApplicationRequest
): Promise<void> {
  await auditLog({
    userId: session.user.id,
    tenantId: session.tenantId,
    action: ApplicationAuditAction.CREATE,
    resourceType: 'application',
    resourceId: application.id,
    details: {
      applicationId: application.id,
      jobId: application.jobId,
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      status: application.status,
    },
  });
}

/**
 * Audit: Update application
 */
export async function auditApplicationUpdate(
  session: Session,
  application: Application,
  requestData: UpdateApplicationRequest
): Promise<void> {
  await auditLog({
    userId: session.user.id,
    tenantId: session.tenantId,
    action: ApplicationAuditAction.UPDATE,
    resourceType: 'application',
    resourceId: application.id,
    details: {
      applicationId: application.id,
      jobId: application.jobId,
      applicantName: application.applicantName,
      updates: requestData,
    },
  });
}

/**
 * Audit: Change application status
 * Special audit for status changes (important business event)
 */
export async function auditApplicationStatusChange(
  session: Session,
  application: Application,
  oldStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): Promise<void> {
  await auditLog({
    userId: session.user.id,
    tenantId: session.tenantId,
    action: ApplicationAuditAction.STATUS_CHANGE,
    resourceType: 'application',
    resourceId: application.id,
    details: {
      applicationId: application.id,
      jobId: application.jobId,
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      oldStatus,
      newStatus,
    },
  });
}

/**
 * Audit: Delete application
 */
export async function auditApplicationDelete(
  session: Session,
  applicationId: string,
  application?: Application
): Promise<void> {
  await auditLog({
    userId: session.user.id,
    tenantId: session.tenantId,
    action: ApplicationAuditAction.DELETE,
    resourceType: 'application',
    resourceId: applicationId,
    details: {
      applicationId,
      jobId: application?.jobId,
      applicantName: application?.applicantName,
      applicantEmail: application?.applicantEmail,
      status: application?.status,
    },
  });
}
