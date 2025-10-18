import { audit } from '@/lib/audit/log';
import type { AuthSession } from '@/lib/auth/types';
import type { Job, CreateJobRequest, UpdateJobRequest } from './schemas';

/**
 * Audit job creation
 */
export async function auditJobCreate(
  session: AuthSession,
  job: Job,
  request: CreateJobRequest
): Promise<void> {
  await audit('job.create', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
    status: 'success',
    resourceId: job.id,
    resourceType: 'job',
    details: {
      title: job.title,
      department: job.department,
      location: job.location,
      is_public: job.is_public,
      status: job.status,
    },
  }).catch((error) => {
    console.error('Failed to audit job creation:', error);
  });
}

/**
 * Audit job update
 */
export async function auditJobUpdate(
  session: AuthSession,
  jobId: string,
  patch: UpdateJobRequest,
  previousJob?: Job
): Promise<void> {
  await audit('job.update', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
    status: 'success',
    resourceId: jobId,
    resourceType: 'job',
    details: {
      updated_fields: Object.keys(patch),
      changes: patch,
      previous_title: previousJob?.title,
    },
  }).catch((error) => {
    console.error('Failed to audit job update:', error);
  });
}

/**
 * Audit job deletion
 */
export async function auditJobDelete(
  session: AuthSession,
  jobId: string,
  job?: Job,
  cascadeInfo?: {
    applications_deleted?: number;
    interviews_deleted?: number;
    feedback_deleted?: number;
  }
): Promise<void> {
  await audit('job.delete', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
    status: 'success',
    resourceId: jobId,
    resourceType: 'job',
    details: {
      title: job?.title,
      department: job?.department,
      cascade: cascadeInfo,
    },
  }).catch((error) => {
    console.error('Failed to audit job deletion:', error);
  });
}

/**
 * Audit job view/read
 */
export async function auditJobView(
  session: AuthSession,
  jobId: string,
  job?: Job
): Promise<void> {
  await audit('job.view', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
    status: 'success',
    resourceId: jobId,
    resourceType: 'job',
    details: {
      title: job?.title,
    },
  }).catch((error) => {
    console.error('Failed to audit job view:', error);
  });
}

/**
 * Audit job list access
 */
export async function auditJobList(
  session: AuthSession,
  filters?: Record<string, unknown>
): Promise<void> {
  await audit('job.list', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
    status: 'success',
    resourceType: 'job',
    details: {
      filters,
    },
  }).catch((error) => {
    console.error('Failed to audit job list:', error);
  });
}

/**
 * Audit job operation failure
 */
export async function auditJobError(
  session: AuthSession,
  operation: string,
  error: unknown,
  details?: Record<string, unknown>
): Promise<void> {
  await audit(`job.${operation}.error`, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
    status: 'error',
    resourceType: 'job',
    details: {
      error: error instanceof Error ? error.message : String(error),
      ...details,
    },
  }).catch((auditError) => {
    console.error('Failed to audit job error:', auditError);
  });
}
