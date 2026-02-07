import { z } from 'zod';

// ============================================================================
// Enums & Types
// ============================================================================

/**
 * Outcome type for tracking actions
 */
export const outcomeTypeSchema = z.enum(['ACTIVE', 'HOLD', 'SUCCESS', 'FAILURE', 'NEUTRAL']);
export type OutcomeType = z.infer<typeof outcomeTypeSchema>;

/**
 * Tracking status for applications (tenant-configurable, loosened to string)
 */
export const trackingStatusSchema = z.string();
export type TrackingStatus = z.infer<typeof trackingStatusSchema>;

/**
 * History action types (tenant-configurable, loosened to string)
 */
export const historyActionSchema = z.string();
export type HistoryAction = z.infer<typeof historyActionSchema>;

// ============================================================================
// Tracking State
// ============================================================================

/**
 * Current tracking state for an application (inner data)
 */
export const trackingStateDataSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  jobId: z.string().uuid(),
  pipelineId: z.string(), // Not strict UUID - backend may use test/seed IDs like 00000000-0000-0000-0000-000000000100
  currentStageId: z.string().uuid(),
  currentStageName: z.string(),
  currentStageIndex: z.number(),
  status: trackingStatusSchema,
  outcomeType: outcomeTypeSchema,
  isTerminal: z.boolean(),
  enteredStageAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * API response wrapper - extracts data from { data: {...} } envelope
 */
export const trackingStateSchema = z.object({
  data: trackingStateDataSchema,
}).transform((res) => res.data);

export type TrackingState = z.infer<typeof trackingStateDataSchema>;

// ============================================================================
// Stage History
// ============================================================================

/**
 * Single history entry for stage transitions
 */
export const stageHistorySchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  pipelineId: z.string(), // Not strict UUID - backend may use test/seed IDs
  fromStageId: z.string().uuid().nullable(),
  fromStageName: z.string().nullable(),
  toStageId: z.string().uuid().nullable(),
  toStageName: z.string().nullable(),
  action: historyActionSchema,
  changedBy: z.string().uuid().nullable(),
  changedAt: z.string(),
  reason: z.string().nullable(),
});
export type StageHistory = z.infer<typeof stageHistorySchema>;

/**
 * Paginated history response
 */
export const stageHistoryResponseSchema = z.object({
  data: z.array(stageHistorySchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
});
export type StageHistoryResponse = z.infer<typeof stageHistoryResponseSchema>;

// ============================================================================
// Pipeline Board (Kanban)
// ============================================================================

/**
 * Pipeline stage definition
 */
export const pipelineStageSchema = z.object({
  id: z.string().uuid(),
  stageName: z.string(),
  stageType: z.string(),
  conductedBy: z.string(),
  orderIndex: z.number(),
});
export type PipelineStage = z.infer<typeof pipelineStageSchema>;

/**
 * Application card for board display
 */
export const boardApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  applicantName: z.string(),
  applicantEmail: z.string(),
  status: trackingStatusSchema,
  outcomeType: outcomeTypeSchema.optional(),
  isTerminal: z.boolean().optional(),
  enteredStageAt: z.string(),
});
export type BoardApplication = z.infer<typeof boardApplicationSchema>;

/**
 * Board stage with applications
 */
export const boardStageSchema = z.object({
  stage: pipelineStageSchema,
  applications: z.array(boardApplicationSchema),
  count: z.number(),
});
export type BoardStage = z.infer<typeof boardStageSchema>;

/**
 * Pipeline board data
 */
export const pipelineBoardDataSchema = z.object({
  pipelineId: z.string(), // Not strict UUID - backend may use test/seed IDs
  pipelineName: z.string(),
  stages: z.array(boardStageSchema),
  totalApplications: z.number(),
});
export type PipelineBoard = z.infer<typeof pipelineBoardDataSchema>;

/**
 * Complete pipeline board API response (with data envelope)
 */
export const pipelineBoardSchema = z.object({
  data: pipelineBoardDataSchema,
}).transform((res) => res.data);

// ============================================================================
// V2 Action Engine Schemas
// ============================================================================

/**
 * Available action from GET /tracking/applications/:id/actions
 */
export const availableActionSchema = z.object({
  actionCode: z.string(),
  displayName: z.string(),
  outcomeType: outcomeTypeSchema.nullable(), // Can be null
  isTerminal: z.boolean(),
  requiresFeedback: z.boolean(),
  requiresNotes: z.boolean(),
  feedbackSubmitted: z.boolean(),
  signalConditions: z.unknown().nullable().optional(), // Backend extra field
  signalsMet: z.boolean().optional(), // Backend extra field
});
export type AvailableAction = z.infer<typeof availableActionSchema>;

/**
 * Full response from GET /tracking/applications/:id/actions
 * Backend returns { availableActions: [...] } directly (no data envelope)
 */
export const availableActionsResponseSchema = z.object({
  availableActions: z.array(availableActionSchema),
});
export type AvailableActionsResponse = z.infer<typeof availableActionsResponseSchema>;

/**
 * Request for POST /applications/:id/act
 */
export const executeActionRequestSchema = z.object({
  action: z.string(),
  notes: z.string().optional(),
});
export type ExecuteActionRequest = z.infer<typeof executeActionRequestSchema>;

// ============================================================================
// UI Helpers
// ============================================================================

/**
 * Get outcome-type-based badge styling
 */
export function getOutcomeTypeStyle(outcomeType: OutcomeType): {
  bg: string;
  text: string;
  border: string;
} {
  switch (outcomeType) {
    case 'ACTIVE':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
    case 'HOLD':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
      };
    case 'SUCCESS':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
      };
    case 'FAILURE':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
      };
    case 'NEUTRAL':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
      };
  }
}

/**
 * Get status badge styling (fallback for board cards without outcomeType)
 */
export function getTrackingStatusStyle(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'ACTIVE':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
    case 'ON_HOLD':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
      };
    case 'HIRED':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
      };
    case 'REJECTED':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
      };
    case 'WITHDRAWN':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
      };
  }
}

/**
 * Get human-readable status label
 */
export function getTrackingStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'ON_HOLD':
      return 'On Hold';
    case 'HIRED':
      return 'Hired';
    case 'REJECTED':
      return 'Rejected';
    case 'WITHDRAWN':
      return 'Withdrawn';
    default:
      // Title-case pass-through for custom statuses
      return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
}

/**
 * Get history action icon name (for lucide-react)
 */
export function getHistoryActionIcon(action: string): string {
  switch (action) {
    case 'MOVE':
    case 'COMPLETE':
      return 'ArrowRight';
    case 'HIRE':
      return 'CheckCircle';
    case 'REJECT':
    case 'FAIL':
      return 'XCircle';
    case 'WITHDRAW':
      return 'LogOut';
    case 'HOLD':
      return 'Pause';
    case 'ACTIVATE':
      return 'Play';
    default:
      return 'Circle';
  }
}
