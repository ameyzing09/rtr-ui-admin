import { z } from 'zod';

// ============================================================================
// Signal Type Definitions
// ============================================================================

export const signalTypeSchema = z.enum(['boolean', 'numeric', 'text']);
export type SignalType = z.infer<typeof signalTypeSchema>;

export const aggregationMethodSchema = z.enum(['average', 'majority', 'any_true', 'all_true', 'concatenate']);
export type AggregationMethod = z.infer<typeof aggregationMethodSchema>;

// ============================================================================
// Signal Definition Schema
// ============================================================================

export const signalDefinitionSchema = z.object({
  key: z.string(),
  type: signalTypeSchema,
  label: z.string(),
  description: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  required: z.boolean().default(true),
  aggregation: aggregationMethodSchema.optional(),
});

export type SignalDefinition = z.infer<typeof signalDefinitionSchema>;

// ============================================================================
// Evaluation Participant Schema
// ============================================================================

export const evaluationParticipantSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string(),
  userEmail: z.string().email(),
  role: z.string().optional(),
  hasResponded: z.boolean(),
  respondedAt: z.string().nullable().optional(),
});

export type EvaluationParticipant = z.infer<typeof evaluationParticipantSchema>;

// ============================================================================
// Evaluation Details Schema
// ============================================================================

export const evaluationDetailsDataSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  applicantName: z.string(),
  applicantEmail: z.string().email().optional(),
  jobTitle: z.string().optional(),
  stageName: z.string().optional(),
  stageId: z.string().uuid().optional(),
  templateName: z.string().optional(),
  signals: z.array(signalDefinitionSchema),
  participants: z.array(evaluationParticipantSchema),
  status: z.enum(['pending', 'in_progress', 'completed']),
  createdAt: z.string(),
  updatedAt: z.string(),
  deadline: z.string().nullable().optional(),
});

// API response wrapper - unwraps { data: {...} } envelope
export const evaluationDetailsSchema = z.object({
  data: evaluationDetailsDataSchema,
}).transform((res) => res.data);

export type EvaluationDetails = z.infer<typeof evaluationDetailsDataSchema>;

// ============================================================================
// Pending Evaluation List Item Schema
// ============================================================================

export const pendingEvaluationItemSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  applicantName: z.string(),
  jobTitle: z.string().optional(),
  stageName: z.string().optional(),
  deadline: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type PendingEvaluationItem = z.infer<typeof pendingEvaluationItemSchema>;

export const pendingEvaluationsListDataSchema = z.object({
  evaluations: z.array(pendingEvaluationItemSchema),
  total: z.number(),
});

// API response wrapper
export const pendingEvaluationsListSchema = z.object({
  data: pendingEvaluationsListDataSchema,
}).transform((res) => res.data);

export type PendingEvaluationsList = z.infer<typeof pendingEvaluationsListDataSchema>;

// ============================================================================
// Submit Evaluation Request Schema
// ============================================================================

export const signalResponseSchema = z.object({
  key: z.string(),
  value: z.union([z.boolean(), z.number(), z.string()]),
});

export type SignalResponse = z.infer<typeof signalResponseSchema>;

export const submitEvaluationRequestSchema = z.object({
  responses: z.array(signalResponseSchema),
  notes: z.string().optional(),
});

export type SubmitEvaluationRequest = z.infer<typeof submitEvaluationRequestSchema>;

// API response for submission
export const submitEvaluationResponseDataSchema = z.object({
  success: z.boolean(),
  evaluationId: z.string().uuid(),
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
