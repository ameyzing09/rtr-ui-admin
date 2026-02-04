import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

/**
 * Application Status Enum
 * Matches backend status values
 */
export const applicationStatusSchema = z.enum([
  'PENDING',   // Initial status when application is submitted
  'REVIEWED',  // Application has been reviewed by recruiter
  'REJECTED',  // Application was rejected
  'HIRED',     // Applicant was hired
]);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

// ============================================================================
// API Response Schema (camelCase from backend)
// ============================================================================

/**
 * Application entity as returned by the API
 * Backend returns camelCase field names
 */
export const applicationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  jobId: z.string().uuid(),
  applicantName: z.string(),
  applicantEmail: z.string().email(),
  applicantPhone: z.string().nullable(),
  resumeUrl: z.string().url().nullable(),
  coverLetter: z.string().nullable(),
  status: applicationStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Application = z.infer<typeof applicationSchema>;

/**
 * Application List Response
 */
export const applicationListResponseSchema = z.array(applicationSchema);
export type ApplicationListResponse = z.infer<typeof applicationListResponseSchema>;

// ============================================================================
// Request Schemas (camelCase for frontend)
// ============================================================================

/**
 * Create Application Request
 * Used when creating a new application (internal recruiter use)
 */
export const createApplicationRequestSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  applicantName: z.string().min(1, 'Applicant name is required').max(200),
  applicantEmail: z.string().email('Invalid email address'),
  applicantPhone: z.string().min(1, 'Phone number is required').max(50),
  resumeUrl: z.string().url('Invalid resume URL'),
  coverLetter: z.string().max(5000).optional(),
  status: applicationStatusSchema.default('PENDING'),
});

export type CreateApplicationRequest = z.infer<typeof createApplicationRequestSchema>;

/**
 * Update Application Request
 * Used when updating an existing application
 * All fields are optional (partial update)
 */
export const updateApplicationRequestSchema = z.object({
  applicantName: z.string().min(1).max(200).optional(),
  applicantEmail: z.string().email().optional(),
  applicantPhone: z.string().min(1).max(50).optional(),
  resumeUrl: z.string().url().optional(),
  coverLetter: z.string().max(5000).nullable().optional(),
  status: applicationStatusSchema.optional(),
});

export type UpdateApplicationRequest = z.infer<typeof updateApplicationRequestSchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get color class for application status badge
 */
export function getApplicationStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    REVIEWED: 'bg-blue-100 text-blue-800 border-blue-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    HIRED: 'bg-green-100 text-green-800 border-green-200',
  };
  return colors[status];
}

/**
 * Get human-readable label for application status
 */
export function getApplicationStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    PENDING: 'Pending Review',
    REVIEWED: 'Reviewed',
    REJECTED: 'Rejected',
    HIRED: 'Hired',
  };
  return labels[status];
}

/**
 * Transform frontend camelCase request to API camelCase format
 * Note: API expects camelCase in request body
 */
export function toApiRequest(data: CreateApplicationRequest | UpdateApplicationRequest): Record<string, unknown> {
  // API expects camelCase, so we can pass through directly
  return {
    ...data,
  };
}

/**
 * Check if status is a terminal state (no further action needed)
 */
export function isTerminalStatus(status: ApplicationStatus): boolean {
  return status === 'REJECTED' || status === 'HIRED';
}

/**
 * Get valid next statuses for a given current status
 */
export function getValidNextStatuses(currentStatus: ApplicationStatus): ApplicationStatus[] {
  const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    PENDING: ['REVIEWED', 'REJECTED'],
    REVIEWED: ['REJECTED', 'HIRED'],
    REJECTED: [], // Terminal state
    HIRED: [], // Terminal state
  };
  return transitions[currentStatus];
}
