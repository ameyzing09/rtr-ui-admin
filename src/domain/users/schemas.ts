import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['SUPERADMIN', 'ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schema - representing a single user
export const userSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  must_change_password: z.boolean().default(false),
  created_at: z.string().transform((val) => new Date(val)),
  last_login: z.union([z.string().transform((val) => new Date(val)), z.null()]).optional(),
  updated_at: z.string().transform((val) => new Date(val)).optional(),
});
export type User = z.infer<typeof userSchema>;

// List users response schema
export const userListResponseSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
});
export type UserListResponse = z.infer<typeof userListResponseSchema>;

// Get single user response
export const userDetailResponseSchema = userSchema;
export type UserDetailResponse = z.infer<typeof userDetailResponseSchema>;

// Reset password request schema
export const resetPasswordRequestSchema = z.object({
  new_password: z.string().optional().describe('If not provided, backend will generate temporary password'),
  force_change: z.boolean().default(true).describe('Force user to change password on next login'),
});
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

// Reset password response schema
export const resetPasswordResponseSchema = z.object({
  user_id: z.string(),
  temporary_password: z.string().describe('Generated temporary password (if no password was provided)'),
  must_change_password: z.boolean(),
  message: z.string().optional(),
});
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;

// Change password request schema (user-facing)
export const changePasswordRequestSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

// List users query params
export const listUsersParamsSchema = z.object({
  tenant_id: z.string().uuid().optional().describe('Filter by tenant'),
  role: userRoleSchema.optional().describe('Filter by user role'),
  search: z.string().optional().describe('Search by name or email'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});
export type ListUsersParams = z.infer<typeof listUsersParamsSchema>;

// Password strength enum
export const passwordStrengthSchema = z.enum(['weak', 'medium', 'strong']);
export type PasswordStrength = z.infer<typeof passwordStrengthSchema>;

// Password requirements validation
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: true,
  hasLowercase: true,
  hasNumber: true,
  hasSpecialChar: true,
};

export function validatePasswordStrength(password: string): {
  strength: PasswordStrength;
  requirements: Record<string, boolean>;
} {
  const requirements = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  const strength: PasswordStrength = metCount <= 2 ? 'weak' : metCount <= 4 ? 'medium' : 'strong';

  return { strength, requirements };
}
