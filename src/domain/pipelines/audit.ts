/* eslint-disable @typescript-eslint/no-unused-vars */
import { audit } from '@/lib/audit/log';
import type { UserSession } from '@/lib/rbac/guard';
import type { Pipeline, CreatePipelineRequest, AssignPipelineRequest } from './schemas';
import { getStageCount } from './schemas';

/**
 * Audit pipeline creation
 */
export async function auditPipelineCreate(
  session: UserSession,
  pipeline: Pipeline,
  _request: CreatePipelineRequest
): Promise<void> {
  await audit('pipeline.create', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: pipeline.id,
    targetType: 'pipeline',
    details: {
      name: pipeline.name,
      description: pipeline.description,
      stage_count: getStageCount(pipeline),
      is_active: pipeline.is_active,
    },
  }).catch((error) => {
    console.error('Failed to audit pipeline creation:', error);
  });
}

/**
 * Audit pipeline update
 */
export async function auditPipelineUpdate(
  session: UserSession,
  pipelineId: string,
  patch: Partial<CreatePipelineRequest>,
  previousPipeline?: Pipeline
): Promise<void> {
  await audit('pipeline.update', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: pipelineId,
    targetType: 'pipeline',
    details: {
      updated_fields: Object.keys(patch),
      changes: patch,
      previous_name: previousPipeline?.name,
      previous_stage_count: previousPipeline ? getStageCount(previousPipeline) : undefined,
    },
  }).catch((error) => {
    console.error('Failed to audit pipeline update:', error);
  });
}

/**
 * Audit pipeline deletion
 */
export async function auditPipelineDelete(
  session: UserSession,
  pipelineId: string,
  pipeline?: Pipeline
): Promise<void> {
  await audit('pipeline.delete', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: pipelineId,
    targetType: 'pipeline',
    details: {
      name: pipeline?.name,
      description: pipeline?.description,
      stage_count: pipeline ? getStageCount(pipeline) : undefined,
    },
  }).catch((error) => {
    console.error('Failed to audit pipeline deletion:', error);
  });
}

/**
 * Audit pipeline assignment to job
 */
export async function auditPipelineAssign(
  session: UserSession,
  pipelineId: string,
  jobId: string,
  pipeline?: Pipeline
): Promise<void> {
  await audit('pipeline.assign', {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: pipelineId,
    targetType: 'pipeline',
    details: {
      pipeline_name: pipeline?.name,
      job_id: jobId,
      stage_count: pipeline ? getStageCount(pipeline) : undefined,
    },
  }).catch((error) => {
    console.error('Failed to audit pipeline assignment:', error);
  });
}

/**
 * Audit pipeline list operation
 * Triggered when user lists pipelines
 */
export async function auditPipelineList(
  session: UserSession
): Promise<void> {
  await audit('pipeline.list' as unknown as Parameters<typeof audit>[0], {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetType: 'pipeline',
    details: {},
  }).catch((error) => {
    console.error('Failed to audit pipeline list:', error);
  });
}

/**
 * Audit pipeline view operation
 * Triggered when user views pipeline details
 */
export async function auditPipelineView(
  session: UserSession,
  pipelineId: string,
  pipeline?: Pipeline
): Promise<void> {
  await audit('pipeline.view' as unknown as Parameters<typeof audit>[0], {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'success',
    targetId: pipelineId,
    targetType: 'pipeline',
    details: {
      name: pipeline?.name,
      stage_count: pipeline ? getStageCount(pipeline) : undefined,
    },
  }).catch((error) => {
    console.error('Failed to audit pipeline view:', error);
  });
}

/**
 * Audit pipeline operation failure
 */
export async function auditPipelineError(
  session: UserSession,
  operation: string,
  error: unknown,
  details?: Record<string, unknown>
): Promise<void> {
  await audit(`pipeline.${operation}.error` as unknown as Parameters<typeof audit>[0], {
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    tenantId: session.tenantId || 'N/A',
    status: 'failure',
    targetType: 'pipeline',
    details: {
      error: error instanceof Error ? error.message : String(error),
      ...details,
    },
  }).catch((auditError) => {
    console.error('Failed to audit pipeline error:', auditError);
  });
}
