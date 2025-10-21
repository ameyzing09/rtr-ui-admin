import { z } from 'zod';

/**
 * Stage schema - represents a single stage in a pipeline
 */
export const stageSchema = z.object({
  stage: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  conducted_by: z.string().min(1).max(50),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Pipeline schema - represents the raw pipeline response from API
 * Note: stages field is a JSON string that needs to be parsed
 */
export const pipelineSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(3).max(255),
  description: z.string().max(1000),
  stages: z.string(), // JSON string, needs parsing
  is_active: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),
});

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
  pipeline_id: z.string().uuid('Invalid pipeline ID'),
  job_id: z.string().uuid('Invalid job ID'),
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
 * Pipeline with parsed stages
 */
export type PipelineWithStages = Omit<Pipeline, 'stages'> & {
  stages: Stage[];
};

/**
 * Parse pipeline stages from JSON string
 * Safely parses the stages field and returns a pipeline with typed stages
 *
 * @param pipeline - The raw pipeline from API
 * @returns Pipeline with parsed stages array
 * @throws Error if stages JSON is invalid
 */
export function parsePipelineStages(pipeline: Pipeline): PipelineWithStages {
  try {
    const stagesData = JSON.parse(pipeline.stages);
    const stages = z.array(stageSchema).parse(stagesData);

    return {
      ...pipeline,
      stages,
    };
  } catch (error) {
    console.error('Failed to parse pipeline stages:', error);
    throw new Error('Invalid pipeline stages format');
  }
}

/**
 * Helper to safely get stage count without parsing full stages
 * Useful for list views where you only need the count
 *
 * @param pipeline - The raw pipeline from API
 * @returns Number of stages or 0 if parsing fails
 */
export function getStageCount(pipeline: Pipeline): number {
  try {
    const stagesData = JSON.parse(pipeline.stages);
    return Array.isArray(stagesData) ? stagesData.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Pipeline list response type
 */
export type PipelineListResponse = Pipeline[];

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
