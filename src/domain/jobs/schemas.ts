import { z } from 'zod';

// ============================================================================
// Enums and Constants
// ============================================================================

export const jobStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'EXPIRED',
  'ARCHIVED',
  'CLOSED',
]);
export type JobStatus = z.infer<typeof jobStatusSchema>;

export const JOB_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', description: 'Not yet published' },
  { value: 'PUBLISHED', label: 'Published', description: 'Active and accepting applications' },
  { value: 'EXPIRED', label: 'Expired', description: 'Past expiration date' },
  { value: 'ARCHIVED', label: 'Archived', description: 'No longer active' },
  { value: 'CLOSED', label: 'Closed', description: 'Position filled' },
] as const;

// ============================================================================
// Core Job Schema
// ============================================================================

/**
 * Core job model from backend API
 * Backend returns camelCase field names
 */
export const jobSchema = z.object({
  id: z.string(),
  tenantId: z.string(),

  // Basic information
  title: z.string(),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),

  // Description and requirements
  description: z.string().nullable().optional(),

  // Visibility and publishing
  isPublic: z.boolean().default(true),
  publishAt: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  expireAt: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  externalApplyUrl: z.string().url().nullable().optional(),

  // Custom fields (EPIC E - driven by tenant schema)
  extra: z.record(z.string(), z.unknown()).nullable().optional(),

  // Status and metadata
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
});

export type Job = z.infer<typeof jobSchema>;

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Create job request schema with validation
 * Backend expects camelCase field names
 * Validation rules:
 * - title is required
 * - expireAt must be after publishAt when both are set
 * - externalApplyUrl must be a valid URL
 */
export const createJobRequestSchema = z.object({
  // Step 1: Basics
  title: z.string()
    .min(1, 'Job title is required')
    .max(200, 'Job title must be less than 200 characters'),
  department: z.string().max(100).optional(),
  location: z.string().max(200).optional(),

  // Step 2: Description
  description: z.string().optional(),

  // Step 3: Visibility
  isPublic: z.boolean().default(true),
  publishAt: z.date().nullable().optional(),
  expireAt: z.date().nullable().optional(),
  externalApplyUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),

  // Step 4: Custom fields (EPIC E)
  extra: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (data) => {
    // Validation: expireAt must be after publishAt when both are set
    if (data.publishAt && data.expireAt) {
      return data.expireAt > data.publishAt;
    }
    return true;
  },
  {
    message: 'Expiration date must be after publish date',
    path: ['expireAt'],
  }
);

export type CreateJobRequest = z.infer<typeof createJobRequestSchema>;

/**
 * Update job request schema - allows partial updates
 */
export const updateJobRequestSchema = createJobRequestSchema.partial();
export type UpdateJobRequest = z.infer<typeof updateJobRequestSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Job list item schema - may have fewer fields than full job
 * Backend returns camelCase field names
 */
export const jobListItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string(),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  isPublic: z.boolean(),
  publishAt: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  expireAt: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  externalApplyUrl: z.string().url().nullable().optional(),
  extra: z.record(z.string(), z.unknown()).nullable().optional(),
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
});

export type JobListItem = z.infer<typeof jobListItemSchema>;

/**
 * Job list response with pagination
 */
export const jobListResponseSchema = z.union([
  // Format 1: Wrapped in jobs array with pagination
  z.object({
    jobs: z.array(jobListItemSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }),
  // Format 2: Direct array response
  z.array(jobListItemSchema),
  // Format 3: Data wrapper
  z.object({
    data: z.array(jobListItemSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }),
]).transform((data) => {
  // Normalize to consistent format
  if (Array.isArray(data)) {
    return { jobs: data, total: data.length };
  }
  if ('data' in data) {
    return { jobs: data.data, total: data.total, page: data.page, limit: data.limit };
  }
  return data;
});

export type JobListResponse = z.infer<typeof jobListResponseSchema>;

/**
 * Job list query parameters
 * Backend expects camelCase for sorting fields
 */
export const jobListParamsSchema = z.object({
  // Filters
  title: z.string().optional(), // Search by title
  department: z.string().optional(), // Filter by department
  location: z.string().optional(), // Filter by location
  status: jobStatusSchema.optional(), // Filter by status
  isPublic: z.boolean().optional(), // Filter by visibility

  // Sorting
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'publishAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Pagination
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

export type JobListParams = z.infer<typeof jobListParamsSchema>;

// ============================================================================
// Delete Response Schema
// ============================================================================

/**
 * Delete job response with cascade information
 */
export const deleteJobResponseSchema = z.object({
  success: z.boolean(),
  cascade_info: z.object({
    applications_deleted: z.number().optional(),
    interviews_deleted: z.number().optional(),
    feedback_deleted: z.number().optional(),
  }).optional(),
});

export type DeleteJobResponse = z.infer<typeof deleteJobResponseSchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get job status display color
 */
export function getJobStatusColor(status: JobStatus): string {
  const colors: Record<JobStatus, string> = {
    DRAFT: 'gray',
    PUBLISHED: 'green',
    EXPIRED: 'orange',
    ARCHIVED: 'gray',
    CLOSED: 'blue',
  };
  return colors[status] || 'gray';
}

/**
 * Check if job is currently active (published and not expired)
 */
export function isJobActive(job: Job | JobListItem): boolean {
  const now = new Date();

  // Check if public
  if (!job.isPublic) return false;

  // Check publishAt
  if (job.publishAt && job.publishAt > now) {
    return false;
  }

  // Check expireAt
  if (job.expireAt && job.expireAt < now) {
    return false;
  }

  return true;
}

/**
 * Get job status badge text based on current state
 */
export function getJobStatusBadge(job: Job | JobListItem): string {
  const now = new Date();

  // If not public, it's a draft
  if (!job.isPublic) {
    return 'Draft';
  }

  // If publish date is in the future, it's scheduled
  if (job.publishAt && job.publishAt > now) {
    return 'Scheduled';
  }

  // If expire date is in the past, it's expired
  if (job.expireAt && job.expireAt < now) {
    return 'Expired';
  }

  // Otherwise, it's active
  return 'Active';
}
