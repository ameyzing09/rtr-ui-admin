import { z } from 'zod';

// ============================================================================
// Signal Type Definitions
// ============================================================================

export const signalTypeSchema = z.enum(['boolean', 'numeric', 'text']);
export type SignalType = z.infer<typeof signalTypeSchema>;

export const aggregationMethodSchema = z.enum(['average', 'majority', 'any_true', 'all_true', 'concatenate']);
export type AggregationMethod = z.infer<typeof aggregationMethodSchema>;

export const evaluationStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export type EvaluationStatus = z.infer<typeof evaluationStatusSchema>;

export const participantStatusSchema = z.enum(['PENDING', 'SUBMITTED', 'DECLINED']);
export type ParticipantStatus = z.infer<typeof participantStatusSchema>;

// ============================================================================
// Signal Definition Schema
// ============================================================================

const signalScaleSchema = z.object({
  min: z.number().nullable(),
  max: z.number().nullable(),
});

export const signalDefinitionSchema = z.object({
  id: z.string(),
  key: z.string(),
  type: signalTypeSchema,
  label: z.string(),
  required: z.boolean(),
  scale: signalScaleSchema.optional(),
});

export type SignalDefinition = z.infer<typeof signalDefinitionSchema>;

// ============================================================================
// Evaluation Participant Schema
// ============================================================================

export const evaluationParticipantSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string().optional(),
  status: participantStatusSchema,
});

export type EvaluationParticipant = z.infer<typeof evaluationParticipantSchema>;

// ============================================================================
// Evaluation Details Schema
// ============================================================================

const evaluationTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const evaluationDetailsDataSchema = z.object({
  id: z.string().uuid(),
  status: evaluationStatusSchema,
  template: evaluationTemplateSchema,
  signals: z.array(signalDefinitionSchema),
  participants: z.array(evaluationParticipantSchema),
});

// API response wrapper - unwraps { data: {...} } envelope
export const evaluationDetailsSchema = z.object({
  data: evaluationDetailsDataSchema,
}).transform((res) => res.data);

export type EvaluationDetails = z.infer<typeof evaluationDetailsDataSchema>;

// ============================================================================
// Pending Evaluation List Item Schema
// ============================================================================

// Raw API response item schema
const pendingEvaluationApiItemSchema = z.object({
  evaluationId: z.string().uuid(),
  applicationId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  templateName: z.string().optional(),
  stageId: z.string().uuid().nullable().optional(),
  stageName: z.string().nullable().optional(),
  evaluationStatus: z.string(),
  scheduledAt: z.string().nullable().optional(),
  applicantName: z.string(),
  applicantEmail: z.string().email().optional(),
  participantStatus: z.string(),
  createdAt: z.string(),
});

// Transformed item for UI consumption
export const pendingEvaluationItemSchema = pendingEvaluationApiItemSchema.transform((item) => ({
  id: item.evaluationId,
  applicationId: item.applicationId,
  applicantName: item.applicantName,
  applicantEmail: item.applicantEmail,
  jobTitle: item.templateName, // Use templateName as job title for display
  stageName: item.stageName ?? undefined,
  deadline: item.scheduledAt ?? undefined,
  createdAt: item.createdAt,
  status: item.evaluationStatus,
  participantStatus: item.participantStatus,
}));

export type PendingEvaluationItem = z.infer<typeof pendingEvaluationItemSchema>;

// API returns { data: [...] } - array directly under data
export const pendingEvaluationsListSchema = z.object({
  data: z.array(pendingEvaluationItemSchema),
}).transform((res) => ({
  evaluations: res.data,
  total: res.data.length,
}));

export type PendingEvaluationsList = {
  evaluations: PendingEvaluationItem[];
  total: number;
};

// ============================================================================
// Submit Evaluation Request Schema
// ============================================================================

export const submitEvaluationRequestSchema = z.object({
  response_data: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
});

export type SubmitEvaluationRequest = z.infer<typeof submitEvaluationRequestSchema>;

// API response for submission
export const submitEvaluationResponseDataSchema = z.object({
  id: z.string().uuid(),
  participantId: z.string().uuid(),
  responseData: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
  submittedAt: z.string(),
});

export const submitEvaluationResponseSchema = z.object({
  data: submitEvaluationResponseDataSchema,
}).transform((res) => res.data);

export type SubmitEvaluationResponse = z.infer<typeof submitEvaluationResponseDataSchema>;

// ============================================================================
// UI Helper Functions
// ============================================================================

export function getSignalTypeLabel(type: SignalType): string {
  switch (type) {
    case 'boolean':
      return 'Yes/No';
    case 'numeric':
      return 'Rating';
    case 'text':
      return 'Text Response';
    default:
      return type;
  }
}

export function getAggregationLabel(aggregation: AggregationMethod): string {
  switch (aggregation) {
    case 'average':
      return 'Average of all responses';
    case 'majority':
      return 'Majority vote';
    case 'any_true':
      return 'True if any respond yes';
    case 'all_true':
      return 'True only if all respond yes';
    case 'concatenate':
      return 'Combined text';
    default:
      return aggregation;
  }
}
