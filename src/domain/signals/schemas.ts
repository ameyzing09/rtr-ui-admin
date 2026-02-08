import { z } from 'zod';

// ============================================================================
// Signal Source Types
// ============================================================================

export const signalSourceSchema = z.enum(['AGGREGATED', 'MANUAL', 'SYSTEM', 'EVALUATION']);
export type SignalSource = z.infer<typeof signalSourceSchema>;

// ============================================================================
// Application Signal Schema
// ============================================================================

export const applicationSignalSchema = z.object({
  key: z.string(),
  type: z.enum(['boolean', 'numeric', 'text']),
  value: z.union([z.boolean(), z.number(), z.string(), z.null()]),
  source: signalSourceSchema,
  setAt: z.string(),
  setBy: z.string().nullable().optional(),
  setByName: z.string().nullable().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ApplicationSignal = z.infer<typeof applicationSignalSchema>;

export const applicationSignalsDataSchema = z.object({
  signals: z.array(applicationSignalSchema),
  applicationId: z.string().uuid(),
});

// API response wrapper
export const applicationSignalsSchema = z.object({
  data: applicationSignalsDataSchema,
}).transform((res) => res.data);

export type ApplicationSignals = z.infer<typeof applicationSignalsDataSchema>;

// ============================================================================
// Signal History Schema
// ============================================================================

export const signalHistoryEntrySchema = z.object({
  key: z.string(),
  value: z.union([z.boolean(), z.number(), z.string(), z.null()]),
  source: signalSourceSchema,
  setAt: z.string(),
  setBy: z.string().nullable().optional(),
  setByName: z.string().nullable().optional(),
  previousValue: z.union([z.boolean(), z.number(), z.string(), z.null()]).optional(),
});

export type SignalHistoryEntry = z.infer<typeof signalHistoryEntrySchema>;

export const signalHistoryDataSchema = z.object({
  history: z.array(signalHistoryEntrySchema),
  signalKey: z.string(),
});

export const signalHistorySchema = z.object({
  data: signalHistoryDataSchema,
}).transform((res) => res.data);

export type SignalHistory = z.infer<typeof signalHistoryDataSchema>;

// ============================================================================
// Signal Condition Schema (for Action Prerequisites)
// ============================================================================

export const conditionOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'greater_than_or_equals',
  'less_than_or_equals',
  'exists',
  'not_exists',
  'contains',
]);

export type ConditionOperator = z.infer<typeof conditionOperatorSchema>;

export const signalConditionSchema = z.object({
  signalKey: z.string(),
  operator: conditionOperatorSchema,
  expectedValue: z.union([z.boolean(), z.number(), z.string(), z.null()]).optional(),
  currentValue: z.union([z.boolean(), z.number(), z.string(), z.null()]).optional(),
  met: z.boolean(),
  reason: z.string().optional(),
});

export type SignalCondition = z.infer<typeof signalConditionSchema>;

// ============================================================================
// Available Action with Signals Schema
// ============================================================================

export const availableActionWithSignalsSchema = z.object({
  actionCode: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  outcomeType: z.enum(['ACTIVE', 'HOLD', 'SUCCESS', 'FAILURE', 'NEUTRAL']),
  isTerminal: z.boolean(),
  signalConditions: z.array(signalConditionSchema),
  signalsMet: z.boolean(),
  requiresNotes: z.boolean().optional(),
  requiresFeedback: z.boolean().optional(),
  feedbackSubmitted: z.boolean().optional(),
});

export type AvailableActionWithSignals = z.infer<typeof availableActionWithSignalsSchema>;

export const actionsWithSignalsDataSchema = z.object({
  actions: z.array(availableActionWithSignalsSchema),
  applicationId: z.string().uuid(),
});

// API response wrapper
export const actionsWithSignalsSchema = z.object({
  data: actionsWithSignalsDataSchema,
}).transform((res) => res.data);

export type ActionsWithSignals = z.infer<typeof actionsWithSignalsDataSchema>;

// ============================================================================
// Set Manual Signal Request Schema
// ============================================================================

export const setManualSignalRequestSchema = z.object({
  key: z.string().min(1, 'Signal key is required'),
  value: z.union([z.boolean(), z.number(), z.string()]),
  reason: z.string().optional(),
});

export type SetManualSignalRequest = z.infer<typeof setManualSignalRequestSchema>;

// API response for setting signal
export const setManualSignalResponseDataSchema = z.object({
  success: z.boolean(),
  signal: applicationSignalSchema,
});

export const setManualSignalResponseSchema = z.object({
  data: setManualSignalResponseDataSchema,
}).transform((res) => res.data);

export type SetManualSignalResponse = z.infer<typeof setManualSignalResponseDataSchema>;

// ============================================================================
// UI Helper Functions
// ============================================================================

export function getSourceBadgeStyle(source: SignalSource): {
  bg: string;
  text: string;
  border: string;
} {
  switch (source) {
    case 'AGGREGATED':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
      };
    case 'MANUAL':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
    case 'SYSTEM':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
      };
    case 'EVALUATION':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
      };
  }
}

export function getConditionStatusStyle(met: boolean): {
  bg: string;
  text: string;
  icon: 'check' | 'x' | 'warning';
} {
  if (met) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: 'check',
    };
  }
  return {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'x',
  };
}

export function formatOperator(operator: ConditionOperator): string {
  switch (operator) {
    case 'equals':
      return '=';
    case 'not_equals':
      return '≠';
    case 'greater_than':
      return '>';
    case 'less_than':
      return '<';
    case 'greater_than_or_equals':
      return '≥';
    case 'less_than_or_equals':
      return '≤';
    case 'exists':
      return 'exists';
    case 'not_exists':
      return 'not set';
    case 'contains':
      return 'contains';
    default:
      return operator;
  }
}

export function formatSignalValue(value: boolean | number | string | null): string {
  if (value === null) {
    return 'Not set';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}
