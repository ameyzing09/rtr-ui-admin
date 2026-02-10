import { z } from 'zod';

// ============================================================================
// Interview Status
// ============================================================================

export const interviewStatusSchema = z.enum(['PLANNED', 'IN_PROGRESS', 'CANCELLED']);
export type InterviewStatus = z.infer<typeof interviewStatusSchema>;

// ============================================================================
// Stage Schema
// ============================================================================

export const stageSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

// ============================================================================
// Pending Interview API Item Schema
// ============================================================================

export const pendingInterviewApiItemSchema = z.object({
  roundId: z.string().uuid(),
  interviewId: z.string().uuid(),
  applicationId: z.string().uuid(),
  applicantName: z.string(),
  jobTitle: z.string(),
  stage: stageSchema,
  roundType: z.string(),
  roundComplete: z.boolean(),
  evaluationInstanceId: z.string().uuid(),
  interviewStatus: interviewStatusSchema,
  assignedAt: z.string().min(1),
});

export type PendingInterviewItem = z.infer<typeof pendingInterviewApiItemSchema>;

// ============================================================================
// Pending Interviews List Schema (API envelope)
// ============================================================================

export const pendingInterviewsListSchema = z.object({
  data: z.array(pendingInterviewApiItemSchema),
});

export type PendingInterviewsList = z.infer<typeof pendingInterviewsListSchema>;

// ============================================================================
// Interview Detail Schemas
// ============================================================================

export const interviewAssignmentSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string().optional(),
  evaluationInstanceId: z.string().uuid().optional(),
});

export type InterviewAssignment = z.infer<typeof interviewAssignmentSchema>;

export const interviewRoundSchema = z.object({
  id: z.string().uuid(),
  roundType: z.string(),
  sequence: z.number(),
  assignments: z.array(interviewAssignmentSchema),
  evaluationInstanceId: z.string().uuid().optional(),
  status: interviewStatusSchema.optional(),
});

export type InterviewRound = z.infer<typeof interviewRoundSchema>;

export const interviewDetailDataSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  applicantName: z.string(),
  jobTitle: z.string(),
  stage: stageSchema,
  status: interviewStatusSchema,
  rounds: z.array(interviewRoundSchema),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const interviewDetailSchema = z.object({
  data: interviewDetailDataSchema,
}).transform((res) => res.data);

export type InterviewDetail = z.infer<typeof interviewDetailDataSchema>;

// ============================================================================
// Application Interviews Schema (for drawer timeline)
// ============================================================================

export const applicationInterviewItemSchema = z.object({
  id: z.string().uuid(),
  status: interviewStatusSchema,
  stage: stageSchema,
  rounds: z.array(interviewRoundSchema),
  createdAt: z.string(),
});

export type ApplicationInterviewItem = z.infer<typeof applicationInterviewItemSchema>;

export const applicationInterviewsListSchema = z.object({
  data: z.array(applicationInterviewItemSchema),
});

export type ApplicationInterviewsList = z.infer<typeof applicationInterviewsListSchema>;

// ============================================================================
// Cancel Interview Response Schema
// ============================================================================

export const cancelInterviewResponseSchema = z.object({
  data: z.object({
    id: z.string().uuid(),
    status: z.literal('CANCELLED'),
  }),
}).transform((res) => res.data);

export type CancelInterviewResponse = z.infer<typeof cancelInterviewResponseSchema>;
