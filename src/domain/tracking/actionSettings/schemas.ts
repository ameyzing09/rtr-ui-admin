import { z } from 'zod';
import { outcomeTypeSchema } from '../schemas';

// ============================================================================
// Stage Action Schemas
// ============================================================================

/**
 * Stage action from GET /settings/actions
 */
export const stageActionSchema = z.object({
  id: z.string().uuid(),
  stageId: z.string().uuid(),
  stageName: z.string(),
  stageType: z.string(),
  stageOrderIndex: z.number(),
  pipelineId: z.string(), // Not strict UUID - backend may use test/seed IDs
  actionCode: z.string(),
  displayName: z.string(),
  outcomeType: outcomeTypeSchema.nullable(),
  movesToNextStage: z.boolean(),
  isTerminal: z.boolean(),
  requiresFeedback: z.boolean(),
  requiresNotes: z.boolean(),
  requiredCapability: z.string(),
  sortOrder: z.number(),
});
export type StageAction = z.infer<typeof stageActionSchema>;

/**
 * List response schema for stage actions
 */
export const stageActionListResponseSchema = z.object({
  data: z.array(stageActionSchema),
});
export type StageActionListResponse = z.infer<typeof stageActionListResponseSchema>;

// ============================================================================
// Role Capability Schemas
// ============================================================================

/**
 * Role capability from GET /settings/capabilities
 */
export const roleCapabilitySchema = z.object({
  roleName: z.string(),
  capabilities: z.array(z.string()),
});
export type RoleCapability = z.infer<typeof roleCapabilitySchema>;

/**
 * List response schema for role capabilities
 */
export const roleCapabilityListResponseSchema = z.object({
  data: z.array(roleCapabilitySchema),
});
export type RoleCapabilityListResponse = z.infer<typeof roleCapabilityListResponseSchema>;
