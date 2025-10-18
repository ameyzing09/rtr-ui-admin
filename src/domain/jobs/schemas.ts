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
 */
export const jobSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),

  // Basic information
  title: z.string(),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  openings: z.number().int().positive().optional(), // Client-side only, not sent to backend

  // Description and requirements
  description: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  attachments: z.array(z.string()).optional(), // Array of file URLs

  // Visibility and publishing
  is_public: z.boolean().default(true),
  publish_at: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  expire_at: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  external_apply_url: z.string().url().nullable().optional(),

  // Status and metadata
  status: jobStatusSchema,
  created_by: z.string().optional(),
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),

  // Custom fields (EPIC E - driven by tenant schema)
  extra: z.record(z.string(), z.unknown()).optional(),

  // Computed fields (may come from backend)
  application_count: z.number().int().optional(),
});

export type Job = z.infer<typeof jobSchema>;

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Create job request schema with validation
 * Validation rules:
 * - title is required
 * - expire_at must be after publish_at when both are set
 * - external_apply_url must be a valid URL
 */
export const createJobRequestSchema = z.object({
  // Step 1: Basics
  title: z.string()
    .min(1, 'Job title is required')
    .max(200, 'Job title must be less than 200 characters'),
  department: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  openings: z.number().int().positive().optional(), // Client-side only

  // Step 2: Description
  description: z.string().optional(),
  requirements: z.string().optional(),
  attachments: z.array(z.string()).optional(),

  // Step 3: Visibility
  is_public: z.boolean().default(true),
  publish_at: z.date().nullable().optional(),
  expire_at: z.date().nullable().optional(),
  external_apply_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),

  // Step 4: Custom fields (EPIC E)
  extra: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (data) => {
    // Validation: expire_at must be after publish_at when both are set
    if (data.publish_at && data.expire_at) {
      return data.expire_at > data.publish_at;
    }
    return true;
  },
  {
    message: 'Expiration date must be after publish date',
    path: ['expire_at'],
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
 */
export const jobListItemSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  title: z.string(),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  status: jobStatusSchema,
  is_public: z.boolean(),
  publish_at: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  expire_at: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),
  application_count: z.number().int().optional(),
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
 */
export const jobListParamsSchema = z.object({
  // Filters
  title: z.string().optional(), // Search by title
  department: z.string().optional(), // Filter by department
  location: z.string().optional(), // Filter by location
  status: jobStatusSchema.optional(), // Filter by status
  is_public: z.boolean().optional(), // Filter by visibility

  // Sorting
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'publish_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),

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
  if (job.status !== 'PUBLISHED') return false;

  const now = new Date();

  // Check publish_at
  if (job.publish_at && job.publish_at > now) {
    return false;
  }

  // Check expire_at
  if (job.expire_at && job.expire_at < now) {
    return false;
  }

  return true;
}

/**
 * Get job status badge text
 */
export function getJobStatusBadge(job: Job | JobListItem): string {
  if (isJobActive(job)) {
    return 'Active';
  }

  const statusLabels: Record<JobStatus, string> = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    EXPIRED: 'Expired',
    ARCHIVED: 'Archived',
    CLOSED: 'Closed',
  };

  return statusLabels[job.status] || job.status;
}
