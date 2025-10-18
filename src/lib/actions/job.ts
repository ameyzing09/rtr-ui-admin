'use server';

import { requireCanListJobs, requireCanCreateJobs, requireCanReadJobs, requireCanUpdateJobs, requireCanDeleteJobs } from '@/domain/jobs/permissions';
import { jobService, JobApiError } from '@/domain/jobs/service';
import { auditJobCreate, auditJobUpdate, auditJobDelete, auditJobList, auditJobView, auditJobError } from '@/domain/jobs/audit';
import type {
  Job,
  CreateJobRequest,
  UpdateJobRequest,
  JobListResponse,
  JobListParams,
  DeleteJobResponse,
} from '@/domain/jobs/schemas';

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
 * Parse backend validation errors into field-level errors
 * Handles patterns like:
 * - "extra: missing required property 'salary_range'" → { extra_salary_range: ["This field is required"] }
 * - "extra/experience_years: must be number" → { extra_experience_years: ["must be number"] }
 */
function parseValidationErrors(errors: string[]): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  errors.forEach((error) => {
    // Pattern 1: "extra: missing required property 'field_name'"
    const match1 = error.match(/extra:\s*missing required property '(.+?)'/);
    if (match1) {
      const fieldName = match1[1];
      const key = `extra_${fieldName}`;
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push('This field is required');
      return;
    }

    // Pattern 2: "extra/field_name: error message"
    const match2 = error.match(/extra\/(.+?):\s*(.+)/);
    if (match2) {
      const fieldName = match2[1];
      const errorMsg = match2[2];
      const key = `extra_${fieldName}`;
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(errorMsg);
      return;
    }

    // Pattern 3: Generic "extra: error message"
    if (error.startsWith('extra:')) {
      const errorMsg = error.replace('extra:', '').trim();
      if (!fieldErrors.extra) fieldErrors.extra = [];
      fieldErrors.extra.push(errorMsg);
      return;
    }

    // Pattern 4: Standard field errors "field_name should not be empty"
    const match4 = error.match(/^(\w+)\s+(.+)/);
    if (match4) {
      const fieldName = match4[1];
      const errorMsg = match4[2];
      if (!fieldErrors[fieldName]) fieldErrors[fieldName] = [];
      fieldErrors[fieldName].push(errorMsg);
    }
  });

  return fieldErrors;
}

/**
 * Format error for ActionResult
 * Extracts error message, code, and field-level errors from various error types
 */
function formatError(error: unknown): {
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
} {
  if (error instanceof JobApiError) {
    let fieldErrors: Record<string, string[]> | undefined =
      error.details?.fieldErrors as Record<string, string[]> | undefined;

    // Check if error.details contains a message array (backend validation errors)
    if (error.details && Array.isArray(error.details.message)) {
      fieldErrors = parseValidationErrors(error.details.message as string[]);
    }

    return {
      error: error.message,
      code: error.code,
      fieldErrors,
    };
  }
  return { error: error instanceof Error ? error.message : String(error) };
}

// ============================================================================
// B1: List Jobs
// ============================================================================

/**
 * Server action to list jobs
 * B1: GET /job
 *
 * @param params - Filter and pagination parameters
 * @returns List of jobs with pagination info
 */
export async function listJobsAction(
  params: Partial<JobListParams> = {}
): Promise<ActionResult<JobListResponse>> {
  try {
    console.log('🔄 [listJobsAction] Fetching jobs with params:', params);

    const session = await requireCanListJobs();
    const jobs = await jobService.listJobs(session, session.token, params);

    // Audit log
    await auditJobList(session, params);

    console.log('✅ [listJobsAction] Successfully retrieved jobs:', {
      count: jobs.jobs?.length || 0,
      total: jobs.total,
    });

    return {
      success: true,
      data: jobs,
    };
  } catch (error) {
    console.error('❌ [listJobsAction] Failed:', error);
    return {
      success: false,
      ...formatError(error),
    };
  }
}

// ============================================================================
// B2: Create Job
// ============================================================================

/**
 * Server action to create a new job
 * B2: POST /job
 *
 * @param payload - Job creation data
 * @returns Created job object
 */
export async function createJobAction(
  payload: CreateJobRequest
): Promise<ActionResult<Job>> {
  try {
    console.log('🔄 [createJobAction] Creating job:', { title: payload.title });

    const session = await requireCanCreateJobs();
    const job = await jobService.createJob(session, session.token, payload);

    // Audit log
    await auditJobCreate(session, job, payload);

    console.log('✅ [createJobAction] Successfully created job:', job.id);

    return {
      success: true,
      data: job,
    };
  } catch (error) {
    console.error('❌ [createJobAction] Failed:', error);

    // Audit error
    try {
      const session = await requireCanCreateJobs();
      await auditJobError(session, 'create', error, { payload });
    } catch {
      // Ignore audit errors
    }

    return {
      success: false,
      ...formatError(error),
    };
  }
}

// ============================================================================
// B3: Get Job
// ============================================================================

/**
 * Server action to get a single job by ID
 * B3: GET /job/:id
 *
 * @param id - Job ID
 * @returns Job object or 404 error
 */
export async function getJobAction(id: string): Promise<ActionResult<Job>> {
  try {
    console.log('🔄 [getJobAction] Fetching job:', id);

    const session = await requireCanReadJobs();
    const job = await jobService.getJob(session, session.token, id);

    // Audit log
    await auditJobView(session, id, job);

    console.log('✅ [getJobAction] Successfully fetched job:', id);

    return {
      success: true,
      data: job,
    };
  } catch (error) {
    console.error('❌ [getJobAction] Failed:', error);

    // Special handling for 404
    if (error instanceof JobApiError && error.code === 'JOB_NOT_FOUND') {
      return {
        success: false,
        error: 'Job not found',
        code: 'JOB_NOT_FOUND',
      };
    }

    return {
      success: false,
      ...formatError(error),
    };
  }
}

// ============================================================================
// B4: Update Job
// ============================================================================

/**
 * Server action to update a job
 * B4: PUT /job/:id
 *
 * @param id - Job ID
 * @param patch - Partial job data to update
 * @returns Updated job object or 404 error
 */
export async function updateJobAction(
  id: string,
  patch: UpdateJobRequest
): Promise<ActionResult<Job>> {
  try {
    console.log('🔄 [updateJobAction] Updating job:', id, patch);

    const session = await requireCanUpdateJobs();

    // Optionally fetch previous job for audit trail
    let previousJob: Job | undefined;
    try {
      previousJob = await jobService.getJob(session, session.token, id);
    } catch {
      // If fetch fails, continue without previous job
    }

    const job = await jobService.updateJob(session, session.token, id, patch);

    // Audit log
    await auditJobUpdate(session, id, patch, previousJob);

    console.log('✅ [updateJobAction] Successfully updated job:', id);

    return {
      success: true,
      data: job,
    };
  } catch (error) {
    console.error('❌ [updateJobAction] Failed:', error);

    // Audit error
    try {
      const session = await requireCanUpdateJobs();
      await auditJobError(session, 'update', error, { id, patch });
    } catch {
      // Ignore audit errors
    }

    // Special handling for 404
    if (error instanceof JobApiError && error.code === 'JOB_NOT_FOUND') {
      return {
        success: false,
        error: 'Job not found',
        code: 'JOB_NOT_FOUND',
      };
    }

    return {
      success: false,
      ...formatError(error),
    };
  }
}

// ============================================================================
// B5: Delete Job
// ============================================================================

/**
 * Server action to delete a job
 * B5: DELETE /job/:id
 *
 * @param id - Job ID
 * @returns Deletion result with cascade information
 */
export async function deleteJobAction(
  id: string
): Promise<ActionResult<DeleteJobResponse>> {
  try {
    console.log('🔄 [deleteJobAction] Deleting job:', id);

    const session = await requireCanDeleteJobs();

    // Optionally fetch job for audit trail
    let job: Job | undefined;
    try {
      job = await jobService.getJob(session, session.token, id);
    } catch {
      // If fetch fails, continue without job details
    }

    const result = await jobService.deleteJob(session, session.token, id);

    // Audit log
    await auditJobDelete(session, id, job, result.cascade_info);

    console.log('✅ [deleteJobAction] Successfully deleted job:', id, {
      cascade: result.cascade_info,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('❌ [deleteJobAction] Failed:', error);

    // Audit error
    try {
      const session = await requireCanDeleteJobs();
      await auditJobError(session, 'delete', error, { id });
    } catch {
      // Ignore audit errors
    }

    // Special handling for 404
    if (error instanceof JobApiError && error.code === 'JOB_NOT_FOUND') {
      return {
        success: false,
        error: 'Job not found',
        code: 'JOB_NOT_FOUND',
      };
    }

    return {
      success: false,
      ...formatError(error),
    };
  }
}

// ============================================================================
// Helper Actions
// ============================================================================

/**
 * Get cascade delete information for a job
 * Returns what will be deleted if the job is deleted
 */
export async function getCascadeInfoAction(
  id: string
): Promise<ActionResult<{ applications: number; interviews: number; feedback: number }>> {
  try {
    console.log('🔄 [getCascadeInfoAction] Fetching cascade info for job:', id);

    const session = await requireCanDeleteJobs();
    const info = await jobService.getCascadeInfo(session, session.token, id);

    return {
      success: true,
      data: info,
    };
  } catch (error) {
    console.error('❌ [getCascadeInfoAction] Failed:', error);
    return {
      success: false,
      ...formatError(error),
    };
  }
}
