import { z } from 'zod';

// ============================================================================
// Member Schema (from GET /users array and nested in POST/PATCH responses)
// ============================================================================

export const memberSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  role: z.string(),
  is_active: z.boolean().optional().default(true),
  force_password_reset: z.boolean().default(false),
  created_at: z.string().transform((d) => new Date(d)),
  updated_at: z.string().transform((d) => new Date(d)).optional(),
  deleted_at: z.string().nullable().optional(),
  permissions: z.array(z.string()).optional(),
});
export type Member = z.infer<typeof memberSchema>;

// ============================================================================
// GET /users — flat array, no pagination
// ============================================================================

export const memberListResponseSchema = z.array(memberSchema);
export type MemberListResponse = z.infer<typeof memberListResponseSchema>;

// ============================================================================
// POST /users — create member
// ============================================================================

export const createMemberRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.string(),
});
export type CreateMemberRequest = z.infer<typeof createMemberRequestSchema>;

export const createMemberResponseSchema = z.object({
  user: memberSchema,
  temporary_password: z.string(),
});
export type CreateMemberResponse = z.infer<typeof createMemberResponseSchema>;

// ============================================================================
// PATCH /users/:id — update role/active
// ============================================================================

export const updateMemberRequestSchema = z
  .object({
    role: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((d) => d.role !== undefined || d.is_active !== undefined, {
    message: 'At least one of role or is_active must be provided',
  });
export type UpdateMemberRequest = z.infer<typeof updateMemberRequestSchema>;

export const updateMemberResponseSchema = z.object({
  user: memberSchema,
});
export type UpdateMemberResponse = z.infer<typeof updateMemberResponseSchema>;

// ============================================================================
// POST /users/:id/reset-password
// ============================================================================

export const resetMemberPasswordRequestSchema = z.object({
  new_password: z.string().optional(),
  force_change: z.boolean(),
});
export type ResetMemberPasswordRequest = z.infer<typeof resetMemberPasswordRequestSchema>;

export const resetMemberPasswordResponseSchema = z.object({
  user_id: z.string(),
  temporary_password: z.string(),
  force_password_reset: z.boolean(),
  message: z.string().optional(),
});
export type ResetMemberPasswordResponse = z.infer<typeof resetMemberPasswordResponseSchema>;

// ============================================================================
// API error shape
// ============================================================================

export const memberApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});
export type MemberApiErrorShape = z.infer<typeof memberApiErrorSchema>;
