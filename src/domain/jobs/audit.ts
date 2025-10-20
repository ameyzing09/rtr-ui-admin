/* eslint-disable @typescript-eslint/no-unused-vars */
import { audit } from '@/lib/audit/log';
import type { UserSession } from '@/lib/rbac/guard';
import type { Job, CreateJobRequest, UpdateJobRequest, JobListParams } from './schemas';

/**
 * Audit job creation
 */
export async function auditJobCreate(
  session: UserSession,
  job: Job,
  _request: CreateJobRequest
): Promise<void> {
  await audit('job.create', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
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
  session: UserSession,
  jobId: string,
  patch: UpdateJobRequest,
  previousJob?: Job
): Promise<void> {
  await audit('job.update', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
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
  session: UserSession,
  jobId: string,
  job?: Job,
  cascadeInfo?: {
    applications_deleted?: number;
    interviews_deleted?: number;
    feedback_deleted?: number;
  }
): Promise<void> {
  await audit('job.delete', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
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
  session: UserSession,
  jobId: string,
  job?: Job
): Promise<void> {
  await audit('job.publish', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
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
  session: UserSession,
  jobId: string,
  job?: Job,
  reason?: string
): Promise<void> {
  await audit('job.unpublish', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
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
  session: UserSession,
  operation: string,
  error: unknown,
  details?: Record<string, unknown>
): Promise<void> {
  await audit(`job.${operation}.error` as unknown as Parameters<typeof audit>[0], {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
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

/**
 * Audit job list operation
 * Triggered when user lists jobs
 */
export async function auditJobList(
  session: UserSession,
  params: Partial<JobListParams>
): Promise<void> {
  await audit('job.list' as unknown as Parameters<typeof audit>[0], {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetType: 'job',
    details: {
      filters: params,
    },
  }).catch((error) => {
    console.error('Failed to audit job list:', error);
  });
}

/**
 * Audit job view operation
 * Triggered when user views job details
 */
export async function auditJobView(
  session: UserSession,
  jobId: string,
  job?: Job
): Promise<void> {
  await audit('job.view' as unknown as Parameters<typeof audit>[0], {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: jobId,
    targetType: 'job',
    details: {
      title: job?.title,
      department: job?.department,
    },
  }).catch((error) => {
    console.error('Failed to audit job view:', error);
  });
}
