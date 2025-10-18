import { z } from 'zod';

// ============================================================================
// Public Job Schemas
// ============================================================================

/**
 * Public Job (List View)
 * Returned by GET /public/jobs
 */
export const publicJobSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  description_excerpt: z.string(),
  publish_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  extra: z.record(z.unknown()).nullable().optional(),
});

export type PublicJob = z.infer<typeof publicJobSchema>;

/**
 * Public Jobs List Response (Paginated)
 * Includes data array and total count for pagination
 */
export const publicJobsResponseSchema = z.object({
  data: z.array(publicJobSchema),
  total: z.number(),
});

export type PublicJobsResponse = z.infer<typeof publicJobsResponseSchema>;

/**
 * Public Job Detail
 * Returned by GET /public/jobs/:id
 * Includes full description instead of excerpt
 */
export const publicJobDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  publish_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  extra: z.record(z.unknown()).nullable().optional(),
});

export type PublicJobDetail = z.infer<typeof publicJobDetailSchema>;

/**
 * Public Jobs Query Parameters
 */
export const publicJobsQuerySchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(10),
});

export type PublicJobsQuery = z.infer<typeof publicJobsQuerySchema>;

// ============================================================================
// Public Application Schemas
// ============================================================================

/**
 * Public Application Submit Request
 * Note: API expects snake_case field names
 */
export const publicApplicationSubmitRequestSchema = z.object({
  job_id: z.string().uuid('Invalid job ID'),
  applicant_name: z.string().min(1, 'Name is required').max(200),
  applicant_email: z.string().email('Invalid email address'),
  applicant_phone: z.string().max(50).optional(),
  resume_url: z.string().url('Invalid resume URL').optional(),
  cover_letter: z.string().max(5000).optional(),
  captcha_token: z.string().optional(), // Required if CAPTCHA enabled
});

export type PublicApplicationSubmitRequest = z.infer<typeof publicApplicationSubmitRequestSchema>;

/**
 * Public Application Submit Response
 * Returns minimal data for security
 */
export const publicApplicationSubmitResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
});

export type PublicApplicationSubmitResponse = z.infer<typeof publicApplicationSubmitResponseSchema>;

// ============================================================================
// Frontend-friendly types for form handling
// ============================================================================

/**
 * Application Form Data (camelCase for frontend)
 * Will be transformed to snake_case before API submission
 */
export const applicationFormDataSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  applicantName: z.string().min(1, 'Name is required').max(200),
  applicantEmail: z.string().email('Invalid email address'),
  applicantPhone: z.string().max(50).optional(),
  resumeUrl: z.string().url('Invalid resume URL').optional(),
  coverLetter: z.string().max(5000).optional(),
  captchaToken: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationFormDataSchema>;

/**
 * Transform frontend camelCase form data to API snake_case
 */
export function transformApplicationFormToApi(
  formData: ApplicationFormData
): PublicApplicationSubmitRequest {
  return {
    job_id: formData.jobId,
    applicant_name: formData.applicantName,
    applicant_email: formData.applicantEmail,
    applicant_phone: formData.applicantPhone,
    resume_url: formData.resumeUrl,
    cover_letter: formData.coverLetter,
    captcha_token: formData.captchaToken,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate total pages from total count and page size
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

/**
 * Check if job is currently published
 */
export function isJobPublished(job: PublicJob | PublicJobDetail): boolean {
  const now = new Date();
  return job.publish_at <= now;
}

/**
 * Format date for display
 */
export function formatPublishDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
