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
    targetId: job.id,
    targetType: 'job',
    details: {
      title: job.title,
      department: job.department,
      location: job.location,
      isPublic: job.isPublic,
      publishAt: job.publishAt?.toISOString(),
      expireAt: job.expireAt?.toISOString(),
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
    targetId: jobId,
    targetType: 'job',
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
    targetId: jobId,
    targetType: 'job',
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
 * Audit job publish
 * Triggered when a job's isPublic is set to true or publishAt date is set
 */
export async function auditJobPublish(
  session: AuthSession,
  jobId: string,
  job?: Job
): Promise<void> {
  await audit('job.publish', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
    status: 'success',
    targetId: jobId,
    targetType: 'job',
    details: {
      title: job?.title,
      department: job?.department,
      location: job?.location,
      publishAt: job?.publishAt?.toISOString(),
      expireAt: job?.expireAt?.toISOString(),
    },
  }).catch((error) => {
    console.error('Failed to audit job publish:', error);
  });
}

/**
 * Audit job unpublish
 * Triggered when a job's isPublic is set to false
 */
export async function auditJobUnpublish(
  session: AuthSession,
  jobId: string,
  job?: Job,
  reason?: string
): Promise<void> {
  await audit('job.unpublish', {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
    status: 'success',
    targetId: jobId,
    targetType: 'job',
    details: {
      title: job?.title,
      department: job?.department,
      location: job?.location,
      reason,
    },
  }).catch((error) => {
    console.error('Failed to audit job unpublish:', error);
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
  await audit(`job.${operation}.error` as any, {
    actorId: session.user.id,
    actorEmail: session.user.email,
    actorRole: session.user.role,
    tenantId: session.user.tenantId || 'N/A',
    status: 'failure',
    targetType: 'job',
    details: {
      error: error instanceof Error ? error.message : String(error),
      ...details,
    },
  }).catch((auditError) => {
    console.error('Failed to audit job error:', auditError);
  });
}
