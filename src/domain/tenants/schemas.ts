import { z } from 'zod';

// Plan configuration
export const PLAN_OPTIONS = [
  { value: 'STARTER', label: 'Starter', description: 'Perfect for small teams getting started' },
  { value: 'GROWTH', label: 'Growth', description: 'Ideal for growing businesses' },
  { value: 'ENTERPRISE', label: 'Enterprise', description: 'Advanced features for large organizations' },
  { value: 'ON_PREM', label: 'On-Premise', description: 'Self-hosted solution with full control' },
  { value: 'BASIC', label: 'Basic', description: 'Essential features for individual users' },
] as const;

export const planSchema = z.enum(['STARTER', 'GROWTH', 'ENTERPRISE', 'ON_PREM', 'BASIC']);
export type Plan = z.infer<typeof planSchema>;

// Tenant status enums
export const tenantStatusSchema = z.enum([
  'PENDING',
  'PROVISIONING', 
  'AWAITING_BRANDING',
  'ACTIVE',
  'SUSPENDED',
  'TERMINATED',
  'FAILED'
]);
export type TenantStatus = z.infer<typeof tenantStatusSchema>;

// Create tenant request schema
export const createTenantRequestSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  domain: z.string()
    .min(1, 'Domain is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z0-9-]*[a-zA-Z0-9]*$/, 'Invalid domain format')
    .max(50, 'Domain must be less than 50 characters'),
  admin_name: z.string().min(1, 'Admin name is required').max(100, 'Admin name must be less than 100 characters'),
  admin_email: z.string().email('Invalid email format').max(255, 'Email must be less than 255 characters'),
  plan: planSchema,
});
export type CreateTenantRequest = z.infer<typeof createTenantRequestSchema>;

// Create tenant response schema
export const createTenantResponseSchema = z.object({
  tenant: z.object({
    id: z.string(),
    name: z.string(),
    domain: z.string(),
    slug: z.string().optional(),
  }),
  temp_password: z.string(),
  status: tenantStatusSchema,
});
export type CreateTenantResponse = z.infer<typeof createTenantResponseSchema>;

// Tenant list item schema - matching actual API response structure
export const tenantListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  slug: z.string().optional(),
  status: tenantStatusSchema,
  plan: planSchema,
  created_by: z.string().optional(),
  admin_email: z.string().email().optional(), // Not always provided by API
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),
  failed_reason: z.string().nullable().optional(),
});
export type TenantListItem = z.infer<typeof tenantListItemSchema>;

// Tenant list response schema - flexible to handle different API formats
export const tenantListResponseSchema = z.union([
  // Format 1: Wrapped in tenants array
  z.object({
    tenants: z.array(tenantListItemSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }),
  // Format 2: Direct array response
  z.array(tenantListItemSchema),
  // Format 3: Data wrapper
  z.object({
    data: z.array(tenantListItemSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }),
]).transform((data) => {
  // Normalize to consistent format
  if (Array.isArray(data)) {
    return {
      tenants: data,
      total: data.length,
    };
  }
  if ('tenants' in data) {
    return {
      tenants: data.tenants,
      total: data.total || data.tenants.length,
      page: data.page,
      limit: data.limit,
    };
  }
  if ('data' in data) {
    return {
      tenants: data.data,
      total: data.total || data.data.length,
      page: data.page,
      limit: data.limit,
    };
  }
  // Fallback
  return {
    tenants: [],
    total: 0,
  };
});

export type TenantListResponse = {
  tenants: TenantListItem[];
  total: number;
  page?: number;
  limit?: number;
};

// Tenant status timeline schema
export const tenantStatusTimelineItemSchema = z.object({
  step: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']),
  timestamp: z.string().transform((val) => new Date(val)).optional(),
  message: z.string().optional(),
});
export type TenantStatusTimelineItem = z.infer<typeof tenantStatusTimelineItemSchema>;

// API returns { status, steps[] } - we transform to match our UI needs
// steps is optional since API may return just status for PENDING state
export const tenantStatusResponseSchema = z.object({
  status: tenantStatusSchema,
  steps: z.array(z.string()).optional().default([]),
}).transform((data) => ({
  tenant_id: '', // Not provided by API, filled by caller if needed
  current_status: data.status,
  timeline: (data.steps || []).map((step, index) => ({
    step,
    status: index < (data.steps?.length || 0) - 1 ? 'COMPLETED' as const : 
            data.status === 'FAILED' ? 'FAILED' as const :
            data.status === 'ACTIVE' ? 'COMPLETED' as const : 'IN_PROGRESS' as const,
    timestamp: undefined,
    message: undefined,
  })),
}));
export type TenantStatusResponse = {
  tenant_id: string;
  current_status: TenantStatus;
  timeline: TenantStatusTimelineItem[];
};

// Subscription status enums
export const subscriptionStatusSchema = z.enum([
  'INACTIVE',
  'ACTIVE',
  'SUSPENDED',
  'CANCELLED',
  'TRIAL',
  'EXPIRED'
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

// Subscription schema
export const subscriptionSchema = z.object({
  id: z.string().optional(),
  status: subscriptionStatusSchema,
  plan: planSchema,
  trial_ends_at: z.string().transform((val) => new Date(val)).nullable().optional(),
  current_period_start: z.string().transform((val) => new Date(val)).nullable().optional(),
  current_period_end: z.string().transform((val) => new Date(val)).nullable().optional(),
  created_at: z.string().transform((val) => new Date(val)).optional(),
  updated_at: z.string().transform((val) => new Date(val)).optional(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;

// Tenant detail schema (for individual tenant GET)
export const tenantDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  slug: z.string().optional(),
  status: tenantStatusSchema,
  plan: planSchema,
  admin_name: z.string().optional(),
  admin_email: z.string().email().optional(),
  created_by: z.string().optional(),
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),
  failed_reason: z.string().nullable().optional(),
  subscription: subscriptionSchema.optional(),
});
export type TenantDetail = z.infer<typeof tenantDetailSchema>;

// Update tenant request schema
export const updateTenantRequestSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters').optional(),
  domain: z.string()
    .min(1, 'Domain is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z0-9-]*[a-zA-Z0-9]*$/, 'Invalid domain format')
    .max(50, 'Domain must be less than 50 characters')
    .optional(),
  plan: planSchema.optional(),
});
export type UpdateTenantRequest = z.infer<typeof updateTenantRequestSchema>;

// Form step schemas for wizard
export const companyStepSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  domain: z.string()
    .min(1, 'Domain is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z0-9-]*[a-zA-Z0-9]*$/, 'Invalid domain format')
    .max(50),
});
export type CompanyStep = z.infer<typeof companyStepSchema>;

export const ownerStepSchema = z.object({
  admin_name: z.string().min(1, 'Admin name is required').max(100),
  admin_email: z.string().email('Invalid email format').max(255),
});
export type OwnerStep = z.infer<typeof ownerStepSchema>;

export const planStepSchema = z.object({
  plan: planSchema,
});
export type PlanStep = z.infer<typeof planStepSchema>;

// New subscription step schema
export const subscriptionStepSchema = z.object({
  start_immediately: z.boolean().default(true),
  trial_days: z.number().min(0).max(365).optional(),
  notes: z.string().max(500).optional(),
});
export type SubscriptionStep = z.infer<typeof subscriptionStepSchema>;

// Combined form data including subscription
export const tenantFormDataSchema = companyStepSchema
  .merge(ownerStepSchema)
  .merge(planStepSchema)
  .merge(subscriptionStepSchema);
export type TenantFormData = z.infer<typeof tenantFormDataSchema>;

// Query parameters for tenant list
export const tenantListParamsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  status: tenantStatusSchema.optional(),
  plan: planSchema.optional(),
  search: z.string().optional(),
});
export type TenantListParams = z.infer<typeof tenantListParamsSchema>;