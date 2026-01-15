import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

/**
 * Tracking status for applications
 */
export const trackingStatusSchema = z.enum([
  'ACTIVE',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
  'ON_HOLD',
]);
export type TrackingStatus = z.infer<typeof trackingStatusSchema>;

/**
 * Terminal statuses - cannot move stages after reaching these
 */
export const TERMINAL_STATUSES: TrackingStatus[] = ['HIRED', 'REJECTED', 'WITHDRAWN'];

/**
 * Check if a status is terminal
 */
export function isTerminalStatus(status: TrackingStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * History action types
 */
export const historyActionSchema = z.enum([
  'MOVE',
  'REJECT',
  'HIRE',
  'WITHDRAW',
  'HOLD',
  'ACTIVATE',
]);
export type HistoryAction = z.infer<typeof historyActionSchema>;

// ============================================================================
// Tracking State
// ============================================================================

/**
 * Current tracking state for an application
 */
export const trackingStateSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  jobId: z.string().uuid(),
  pipelineId: z.string().uuid(),
  currentStageId: z.string().uuid(),
  currentStageName: z.string(),
  currentStageIndex: z.number(),
  status: trackingStatusSchema,
  enteredStageAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TrackingState = z.infer<typeof trackingStateSchema>;

// ============================================================================
// Stage History
// ============================================================================

/**
 * Single history entry for stage transitions
 */
export const stageHistorySchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  pipelineId: z.string().uuid(),
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
// Request DTOs
// ============================================================================

/**
 * Move stage request
 */
export const moveStageRequestSchema = z.object({
  to_stage_id: z.string().uuid(),
  reason: z.string().optional(),
});
export type MoveStageRequest = z.infer<typeof moveStageRequestSchema>;

/**
 * Update status request
 */
export const updateStatusRequestSchema = z.object({
  status: trackingStatusSchema,
  reason: z.string().optional(),
});
export type UpdateStatusRequest = z.infer<typeof updateStatusRequestSchema>;

// ============================================================================
// UI Helpers
// ============================================================================

/**
 * Get status badge styling
 */
export function getTrackingStatusStyle(status: TrackingStatus): {
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
export function getTrackingStatusLabel(status: TrackingStatus): string {
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
      return status;
  }
}

/**
 * Get history action icon name (for lucide-react)
 */
export function getHistoryActionIcon(action: HistoryAction): string {
  switch (action) {
    case 'MOVE':
      return 'ArrowRight';
    case 'HIRE':
      return 'CheckCircle';
    case 'REJECT':
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

/**
 * Check if move is adjacent (only allowed move type)
 */
export function isAdjacentMove(
  currentIndex: number,
  targetIndex: number
): boolean {
  return Math.abs(currentIndex - targetIndex) === 1;
}
