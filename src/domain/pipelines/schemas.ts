import { z } from 'zod';

// Lenient UUID pattern that accepts any UUID-like format (including non-standard IDs)
const uuidLike = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  'Invalid UUID format'
);

/**
 * Stage schema - represents a single stage in a pipeline
 * API may return PascalCase or snake_case depending on the context
 */
export const stageSchema = z.object({
  stage: z.string().min(1).max(100).optional(),
  Stage: z.string().min(1).max(100).optional(),
  type: z.string().min(1).max(50).optional(),
  Type: z.string().min(1).max(50).optional(),
  conducted_by: z.string().min(1).max(50).optional(),
  ConductedBy: z.string().min(1).max(50).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  Metadata: z.record(z.string(), z.unknown()).optional(),
}).transform((data) => ({
  // Normalize to snake_case, preferring snake_case if both exist
  stage: data.stage ?? data.Stage ?? '',
  type: data.type ?? data.Type ?? '',
  conducted_by: data.conducted_by ?? data.ConductedBy ?? '',
  metadata: data.metadata ?? data.Metadata,
}));

/**
 * Pipeline schema - represents the raw pipeline response from API
 * Note: API returns PascalCase field names
 */
export const pipelineSchema = z.object({
  ID: uuidLike,
  TenantID: uuidLike.nullable(),
  Name: z.string().min(3).max(255),
  Description: z.string().max(1000),
  Stages: z.array(stageSchema), // Array of stages (not JSON string)
  IsActive: z.boolean(),
  IsDeleted: z.boolean(),
  CreatedBy: uuidLike.nullable().optional(),
  CreatedAt: z.string().transform((val) => new Date(val)),
  UpdatedAt: z.string().transform((val) => new Date(val)),
}).transform((data) => ({
  // Transform to snake_case for internal use
  id: data.ID,
  tenant_id: data.TenantID,
  name: data.Name,
  description: data.Description,
  stages: data.Stages,
  is_active: data.IsActive,
  is_deleted: data.IsDeleted,
  created_by: data.CreatedBy,
  created_at: data.CreatedAt,
  updated_at: data.UpdatedAt,
}));

/**
 * Create pipeline request schema
 */
export const createPipelineSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255, 'Name must be at most 255 characters'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional().default(''),
  stages: z.array(stageSchema).min(1, 'At least one stage is required'),
});

/**
 * Update pipeline request schema
 * Supports partial updates - all fields are optional
 */
export const updatePipelineSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255, 'Name must be at most 255 characters').optional(),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  stages: z.array(stageSchema).min(1, 'At least one stage is required').optional(),
});

/**
 * Assign pipeline request schema
 */
export const assignPipelineSchema = z.object({
  pipeline_id: uuidLike,
  job_id: uuidLike,
});

/**
 * Type exports
 */
export type Stage = z.infer<typeof stageSchema>;
export type Pipeline = z.infer<typeof pipelineSchema>;
export type CreatePipelineRequest = z.infer<typeof createPipelineSchema>;
export type UpdatePipelineRequest = z.infer<typeof updatePipelineSchema>;
export type AssignPipelineRequest = z.infer<typeof assignPipelineSchema>;

/**
 * Pipeline with parsed stages (alias for Pipeline since stages is already parsed)
 * @deprecated Stages are now automatically parsed in the schema transform
 */
export type PipelineWithStages = Pipeline;

/**
 * Parse pipeline stages - no longer needed as schema handles this
 * @deprecated Stages are now automatically parsed in the schema transform
 */
export function parsePipelineStages(pipeline: Pipeline): PipelineWithStages {
  // Stages are already parsed by the schema transform
  return pipeline;
}

/**
 * Helper to safely get stage count
 * @param pipeline - The pipeline from API (stages already parsed as array)
 * @returns Number of stages
 */
export function getStageCount(pipeline: Pipeline): number {
  return Array.isArray(pipeline.stages) ? pipeline.stages.length : 0;
}

/**
 * Pipeline list response type
 */
export type PipelineListResponse = Pipeline[];

/**
 * Pipeline wrapped response schema (for endpoints that return { data: Pipeline })
 */
export const pipelineWrappedResponseSchema = z.object({
  data: pipelineSchema,
});

export type PipelineWrappedResponse = z.infer<typeof pipelineWrappedResponseSchema>;

/**
 * Pipeline error response from API
 * Note: Pipeline API uses different format than NestJS services
 */
export const pipelineErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  status_code: z.number(),
  details: z.string().optional(),
});

export type PipelineErrorResponse = z.infer<typeof pipelineErrorResponseSchema>;

/**
 * Form-specific types for pipeline creation
 * Used in the create pipeline form before conversion to API payload
 */

/**
 * Stage form data - represents a stage in the creation form
 * Metadata is stored as simple Record<string, string> in the form
 */
export type StageFormData = {
  stage: string;
  type: string;
  conducted_by: string;
  metadata?: Record<string, string>; // Form uses simple string-to-string mapping
};

/**
 * Create pipeline form data - represents the form state
 */
export type CreatePipelineFormData = {
  name: string;
  description?: string;
  stages: StageFormData[];
};

/**
 * Convert form data to API payload
 * Transforms metadata from Record<string, string> to Record<string, unknown>
 * and handles empty metadata objects
 *
 * @param formData - The form data from CreatePipelineForm
 * @returns API-compatible CreatePipelineRequest
 */
export function convertFormToPayload(
  formData: CreatePipelineFormData
): CreatePipelineRequest {
  return {
    name: formData.name,
    description: formData.description || '',
    stages: formData.stages.map((s) => ({
      stage: s.stage,
      type: s.type,
      conducted_by: s.conducted_by,
      // Only include metadata if it has entries
      metadata:
        s.metadata && Object.keys(s.metadata).length > 0 ? s.metadata : undefined,
    })),
  };
}
