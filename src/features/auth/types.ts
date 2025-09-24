import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'manager']),
  tenantId: z.string(),
  avatar: z.string().url().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  tenantId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Session schema
export const sessionSchema = z.object({
  user: userSchema,
  token: z.string(),
  refreshToken: z.string(),
  expiresAt: z.date(),
});

// Types
export type User = z.infer<typeof userSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type Session = z.infer<typeof sessionSchema>;

// Permission types
export type Permission = 
  | 'admin'
  | 'user:read'
  | 'user:write'
  | 'user:delete'
  | 'tenant:read'
  | 'tenant:write'
  | 'tenant:admin';

export type Role = 'admin' | 'user' | 'manager';

// Auth state
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}
