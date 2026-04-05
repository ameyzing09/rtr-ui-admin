import { z } from 'zod';

// ============================================================================
// Viewer Context
// ============================================================================

export const viewerContextSchema = z.object({
  viewerRole: z.string(),
  isRestricted: z.boolean(),
});

export type ViewerContext = z.infer<typeof viewerContextSchema>;

// ============================================================================
// Application Summary
// ============================================================================

export const applicationSummarySchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  resumeUrl: z.string().nullable().optional(),
  coverLetter: z.string().nullable().optional(),
});

export type ApplicationSummary = z.infer<typeof applicationSummarySchema>;

// ============================================================================
// Candidate Summary
// ============================================================================

export const candidateSummarySchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable().optional(),
});

export type CandidateSummary = z.infer<typeof candidateSummarySchema>;

// ============================================================================
// Job Summary
// ============================================================================

export const jobSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

export type JobSummary = z.infer<typeof jobSummarySchema>;

// ============================================================================
// Tracking Summary
// ============================================================================

export const trackingSummarySchema = z.object({
  pipelineId: z.string(),
  currentStageId: z.string().uuid(),
  currentStageName: z.string(),
  currentStageIndex: z.number(),
  status: z.string(),
  outcomeType: z.string().nullable().optional(),
  isTerminal: z.boolean(),
  enteredStageAt: z.string(),
});

export type TrackingSummary = z.infer<typeof trackingSummarySchema>;

// ============================================================================
// Interview Summary
// ============================================================================

export const interviewerSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string().nullable().optional(),
});

export type Interviewer = z.infer<typeof interviewerSchema>;

export const interviewSummarySchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  pipelineStageId: z.string().uuid(),
  stageName: z.string().nullable().optional(),
  status: z.string(),
  roundCount: z.number(),
  completedRounds: z.number(),
  interviewers: z.array(interviewerSchema),
  createdAt: z.string(),
});

export type InterviewSummary = z.infer<typeof interviewSummarySchema>;

// ============================================================================
// Evaluation Summary
// ============================================================================

export const evaluationSummarySchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  templateId: z.string().uuid(),
  templateName: z.string().nullable().optional(),
  stageId: z.string().uuid().nullable().optional(),
  stageName: z.string().nullable().optional(),
  status: z.string(),
  participantCount: z.number(),
  submittedCount: z.number(),
  pendingCount: z.number(),
  isInterviewLevel: z.boolean(),
  createdAt: z.string(),
});

export type EvaluationSummary = z.infer<typeof evaluationSummarySchema>;

// ============================================================================
// Timeline Entry
// ============================================================================

export const timelineEntrySchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  summary: z.string(),
  actorId: z.string().nullable().optional(),
  actorName: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

// ============================================================================
// Application Detail Data (composed)
// ============================================================================

export const applicationDetailDataSchema = z.object({
  viewerContext: viewerContextSchema,
  application: applicationSummarySchema,
  candidate: candidateSummarySchema,
  job: jobSummarySchema,
  tracking: trackingSummarySchema.nullable(),
  interviews: z.array(interviewSummarySchema),
  evaluations: z.array(evaluationSummarySchema),
  timeline: z.array(timelineEntrySchema),
});

export type ApplicationDetailData = z.infer<typeof applicationDetailDataSchema>;

// ============================================================================
// API Response (unwraps { data: {...} } envelope)
// ============================================================================

export const applicationDetailResponseSchema = z.object({
  data: applicationDetailDataSchema,
}).transform((res) => res.data);
