import { z } from 'zod';

// Tenant schema
export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  domain: z.string().optional(),
  logo: z.string().url().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean(),
  plan: z.enum(['free', 'pro', 'enterprise']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Tenant settings schema
export const tenantSettingsSchema = z.object({
  allowRegistration: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(true),
  maxUsers: z.number().positive().optional(),
  features: z.array(z.string()).default([]),
  customDomain: z.string().optional(),
  branding: z.object({
    logo: z.string().url().optional(),
    favicon: z.string().url().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    customCss: z.string().optional(),
  }).optional(),
});

// Tenant creation schema
export const createTenantSchema = z.object({
  name: z.string().min(2, 'Tenant name must be at least 2 characters'),
  slug: z.string().min(2, 'Tenant slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  domain: z.string().optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
});

// Types
export type Tenant = z.infer<typeof tenantSchema>;
export type TenantSettings = z.infer<typeof tenantSettingsSchema>;
export type CreateTenantData = z.infer<typeof createTenantSchema>;

// Tenant context
export interface TenantContext {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}
