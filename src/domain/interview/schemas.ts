import { z } from 'zod';

// ============================================================================
// Interview Status
// ============================================================================

export const interviewStatusSchema = z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
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
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string(),
});

export type InterviewAssignment = z.infer<typeof interviewAssignmentSchema>;

export const interviewRoundSchema = z.object({
  id: z.string().uuid(),
  roundType: z.string(),
  sequence: z.number(),
  evaluationInstanceId: z.string().uuid().nullable(),
  createdAt: z.string(),
  assignments: z.array(interviewAssignmentSchema),
});

export type InterviewRound = z.infer<typeof interviewRoundSchema>;

export const interviewDetailDataSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  pipelineStageId: z.string().uuid(),
  status: interviewStatusSchema,
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  rounds: z.array(interviewRoundSchema),
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
  applicationId: z.string().uuid(),
  pipelineStageId: z.string().uuid(),
  status: interviewStatusSchema,
  createdBy: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
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

// ============================================================================
// Create Interview Request Schemas
// ============================================================================

export const createInterviewRoundRequestSchema = z.object({
  round_type: z.string().min(1),
  sequence: z.number().int().positive(),
  interviewer_ids: z.array(z.string().uuid()).min(1),
  evaluation_template_id: z.string().uuid(),
});
export type CreateInterviewRoundRequest = z.infer<typeof createInterviewRoundRequestSchema>;

export const createInterviewRequestSchema = z.object({
  pipeline_stage_id: z.string().uuid(),
  rounds: z.array(createInterviewRoundRequestSchema).min(1),
});
export type CreateInterviewRequest = z.infer<typeof createInterviewRequestSchema>;

// ============================================================================
// Create Interview Response Schemas
// ============================================================================

const createdAssignmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string(),
});

const createdRoundSchema = z.object({
  id: z.string().uuid(),
  roundType: z.string(),
  sequence: z.number(),
  evaluationInstanceId: z.string().uuid().nullable(),
  assignments: z.array(createdAssignmentSchema),
});

export const createInterviewResponseDataSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  status: interviewStatusSchema,
  rounds: z.array(createdRoundSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createInterviewResponseSchema = z.object({
  data: createInterviewResponseDataSchema,
}).transform((r) => r.data);

export type CreateInterviewResponse = z.infer<typeof createInterviewResponseDataSchema>;
