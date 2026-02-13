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
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  signalKey: z.string(),
  signalType: z.enum(['boolean', 'integer', 'float', 'text']),
  value: z.union([z.boolean(), z.number(), z.string(), z.null()]),
  sourceType: signalSourceSchema,
  sourceId: z.string().uuid().nullable(),
  setBy: z.string().uuid().nullable(),
  setAt: z.string(),
});

export type ApplicationSignal = z.infer<typeof applicationSignalSchema>;

// API response wrapper — backend returns { data: [...] } (flat array)
export const applicationSignalsSchema = z.object({
  data: z.array(applicationSignalSchema),
}).transform((res) => res.data);

export type ApplicationSignals = ApplicationSignal[];

// ============================================================================
// Signal History Schema
// ============================================================================

export const signalHistoryEntrySchema = applicationSignalSchema.extend({
  supersededAt: z.string().nullable().optional(),
  supersededBy: z.string().uuid().nullable().optional(),
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

export const signalConditionSchema = z.object({
  signal: z.string(),
  operator: z.string(), // backend uses symbols like "=", "!=", ">", "<"
  value: z.union([z.string(), z.null()]).optional(),
  onMissing: z.string().optional(),
  currentValue: z.union([z.string(), z.null()]).optional(),
  met: z.boolean(),
});

export type SignalCondition = z.infer<typeof signalConditionSchema>;

// Backend nests conditions under { logic, conditions }
export const signalConditionsWrapperSchema = z.object({
  logic: z.string(),
  conditions: z.array(signalConditionSchema),
}).nullable().optional();

// ============================================================================
// Available Action with Signals Schema
// ============================================================================

export const availableActionWithSignalsSchema = z.object({
  actionCode: z.string(),
  displayName: z.string(),
  outcomeType: z.enum(['ACTIVE', 'HOLD', 'SUCCESS', 'FAILURE', 'NEUTRAL']).nullable(),
  isTerminal: z.boolean(),
  signalConditions: signalConditionsWrapperSchema,
  signalsMet: z.boolean().optional(),
  requiresNotes: z.boolean().optional(),
  requiresFeedback: z.boolean().optional(),
  feedbackSubmitted: z.boolean().optional(),
});

export type AvailableActionWithSignals = z.infer<typeof availableActionWithSignalsSchema>;

export const actionsWithSignalsDataSchema = z.object({
  availableActions: z.array(availableActionWithSignalsSchema),
});

// API response wrapper
export const actionsWithSignalsSchema = z.object({
  data: actionsWithSignalsDataSchema,
}).transform((res) => res.data);

export type ActionsWithSignals = z.infer<typeof actionsWithSignalsDataSchema>;

// ============================================================================
// Set Manual Signal Request Schema
// ============================================================================

// Backend-facing request schema (what gets sent over the wire)
export const setManualSignalRequestSchema = z.object({
  signal_key: z.string().min(1, 'Signal key is required'),
  signal_type: z.enum(['boolean', 'integer', 'float', 'text']),
  value: z.string(), // always string representation ("true", "42", etc.)
  note: z.string().optional(),
});

export type SetManualSignalRequest = z.infer<typeof setManualSignalRequestSchema>;

// API response for setting signal — backend returns { data: { ...signal } }
export const setManualSignalResponseSchema = z.object({
  data: applicationSignalSchema,
}).transform((res) => res.data);

export type SetManualSignalResponse = ApplicationSignal;

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

export function formatOperator(operator: string): string {
  switch (operator) {
    case '=':
      return '=';
    case '!=':
      return '\u2260';
    case '>':
      return '>';
    case '<':
      return '<';
    case '>=':
      return '\u2265';
    case '<=':
      return '\u2264';
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
