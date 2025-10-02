import { z } from 'zod';

// User role schema
export const userRoleSchema = z.enum(['SUPERADMIN', 'ADMIN', 'USER']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Auth user schema
export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema,
  tenant_id: z.string().optional(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

// Login request schema
export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

// Login response schema
export const loginResponseSchema = z.object({
  user: authUserSchema,
  token: z.string(),
  expires_at: z.string().transform((val) => new Date(val)),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;