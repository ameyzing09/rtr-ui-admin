import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['local', 'development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().default('RTR Admin'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_MAINTENANCE_MODE: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_BILLING: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_STRIPE: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_SSO: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_2FA: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_API_KEYS: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_DARK_MODE: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_THEME_CUSTOMIZATION: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_BULK_OPERATIONS: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_IMPERSONATION: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_AUDIT_LOGS: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_WEBHOOKS: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_REAL_TIME: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_SLACK: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_SMS_NOTIFICATIONS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_AI: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_ML: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_BETA: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_EXPERIMENTAL_UI: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_NEW_DASHBOARD: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_DEBUG_MODE: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_DEV_TOOLS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_USE_MOCK_DATA: z.string().default('false').transform(val => val === 'true'),
  
  // API Configuration - Microservices
  // Job-Application service (client + server)
  NEXT_PUBLIC_JOB_API_BASE_URL: z.string().url().optional(),
  // User-Auth service (client + server) - needed for browser login + server tenant ops
  NEXT_PUBLIC_USER_AUTH_API_BASE_URL: z.string().url().optional(),
  // Pipeline-Engine service (client + server) - handles interview pipelines
  NEXT_PUBLIC_PIPELINE_API_BASE_URL: z.string().url().optional(),
  // Tracking service (client + server) - handles application tracking, stage history
  NEXT_PUBLIC_TRACKING_API_BASE_URL: z.string().url().optional(),
  // Evaluation service (Supabase edge function) - handles evaluation forms and responses
  NEXT_PUBLIC_EVALUATION_API_BASE_URL: z.string().url().optional(),
  // Interview service (Supabase edge function) - handles interview scheduling and assignments
  NEXT_PUBLIC_INTERVIEW_API_BASE_URL: z.string().url().optional(),
  // Application Detail service (Supabase edge function) - aggregated application view
  NEXT_PUBLIC_APPLICATION_DETAIL_API_BASE_URL: z.string().url().optional(),

  // Deprecated: Use NEXT_PUBLIC_JOB_API_BASE_URL and NEXT_PUBLIC_USER_AUTH_API_BASE_URL instead
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  AUTH_API_BASE: z.string().url().optional(),
  USER_AUTH_API_BASE_URL: z.string().url().optional(),

  API_SECRET_KEY: z.string().optional(),
  
  // Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  
  // External Services
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  
  // Tenant Configuration
  NEXT_PUBLIC_DEFAULT_TENANT: z.string().default('default'),
  NEXT_PUBLIC_TENANT_ID: z.string().optional(),
  NEXT_PUBLIC_TENANT_SUBDOMAIN: z.string().optional(), // For public career site (optional, defaults to TENANT_ID)
  NEXT_PUBLIC_TENANT_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_MULTI_TENANT_MODE: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_LOCAL_MODE: z.string().default('false').transform(val => val === 'true'),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
});

// Parse and validate environment variables
function createEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  
  return parsed.data;
}

// Export validated environment variables
export const env = createEnv();

// Type for environment variables
export type Environment = z.infer<typeof envSchema>;

// Helper functions
export const isDevelopment = env.NODE_ENV === 'local';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Check if we're in local environment (using custom flag or development mode)
export const isLocal = env.NEXT_PUBLIC_LOCAL_MODE || env.NODE_ENV === 'development';

// Get tenant ID based on environment
export function getTenantId(): string | undefined {
  // In local environment, use NEXT_PUBLIC_TENANT_ID if available
  // Use process.env directly to ensure we get the browser environment variables
  const isLocalEnv = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  
  if (isLocalEnv && tenantId) {
    return tenantId;
  }
  
  // In production, tenant ID should come from user session/auth
  return undefined;
}

// Get local tenant ID for development mode
// This sends a simple X-Tenant-ID header (no signatures) for local testing convenience
// In production, tenant context comes from JWT automatically
export function getLocalTenantId(): string | undefined {
  const isLocalEnv = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';

  if (isLocalEnv && process.env.NEXT_PUBLIC_TENANT_ID) {
    return process.env.NEXT_PUBLIC_TENANT_ID;
  }

  return undefined;
}

// Get local tenant subdomain for development mode (public career site)
// This provides the subdomain for Host header in public API requests
// Falls back to TENANT_ID if TENANT_SUBDOMAIN is not explicitly set
// In production, subdomain is extracted from actual hostname
export function getLocalTenantSubdomain(): string | undefined {
  const isLocalEnv = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';

  if (isLocalEnv) {
    // Prefer explicit subdomain, fall back to tenant ID
    return process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN || process.env.NEXT_PUBLIC_TENANT_ID;
  }

  return undefined;
}

// Feature flags
export const isMaintenanceMode = env.NEXT_PUBLIC_MAINTENANCE_MODE;
export const isMultiTenantMode = env.NEXT_PUBLIC_MULTI_TENANT_MODE;
export const isAnalyticsEnabled = env.NEXT_PUBLIC_ENABLE_ANALYTICS;

// Logging function for development
export function logEnvInfo() {
  if (isDevelopment) {
    console.log('🔧 Environment Configuration:');
    console.log(`- NODE_ENV: ${env.NODE_ENV}`);
    console.log(`- App Name: ${env.NEXT_PUBLIC_APP_NAME}`);
    console.log(`- Maintenance Mode: ${isMaintenanceMode}`);
    console.log(`- Multi-tenant Mode: ${isMultiTenantMode}`);
    console.log(`- Analytics: ${isAnalyticsEnabled}`);
  }
}

