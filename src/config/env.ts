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
  
  // API Configuration
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:8082'),
  AUTH_API_BASE: z.string().url().optional(),
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
  NEXT_PUBLIC_TENANT_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_TENANT_SECRET: z.string().optional(),
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

// Generate current UTC Unix timestamp in minutes (as expected by backend middleware)
function generateTenantTimestamp(): string {
  const timestamp = Math.floor(Date.now() / 1000 / 60); // Convert to Unix timestamp in minutes
  return timestamp.toString();
}

// Generate HMAC-SHA256 signature
async function generateTenantSignature(tenantId: string, domain: string, timestamp: string, secret: string): Promise<string> {
  // Verify secret has no stray spaces/newlines
  const hasSpaces = secret.includes(' ');
  const hasNewlines = secret.includes('\n') || secret.includes('\r');
  const hasTabs = secret.includes('\t');
  if (hasSpaces || hasNewlines || hasTabs) {
    console.warn('⚠️ Secret contains whitespace characters!');
  }
  
  // Build payload string exactly as middleware expects
  const message = domain ? `${tenantId}.${domain}.${timestamp}` : `${tenantId}..${timestamp}`;
  
  // Import crypto dynamically to avoid SSR issues
  const crypto = await import('crypto');
  
  // Try different approaches for the secret
  let hmac;
  try {
    // First try: use secret as-is (string)
    hmac = crypto.createHmac('sha256', secret);
  } catch {
    try {
      // Second try: decode secret as base64
      const decodedSecret = Buffer.from(secret, 'base64');
      hmac = crypto.createHmac('sha256', decodedSecret);
    } catch {
      hmac = crypto.createHmac('sha256', secret);
    }
  }
  
  hmac.update(message);
  const signature = hmac.digest('base64');
  
  // Convert base64 to base64url format (RawURLEncoding equivalent)
  const base64urlSignature = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  // Validate the signature format
  const isValid = validateBase64urlSignature(base64urlSignature);
  if (!isValid) {
    console.error('❌ Invalid base64url signature format!');
  }
  
  return base64urlSignature;
}

// Validate base64url signature format
function validateBase64urlSignature(signature: string): boolean {
  const hasInvalidChars = /[+\/=]/.test(signature);
  const isValidLength = signature.length > 0;
  return !hasInvalidChars && isValidLength;
}


// Get tenant headers for local environment
export async function getTenantHeaders(): Promise<{ 'X-Tenant-ID'?: string; 'X-Tenant-Ts'?: string; 'X-Tenant-Sig'?: string }> {
  const isLocalEnv = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';
  
  if (isLocalEnv) {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    const domain = process.env.NEXT_PUBLIC_TENANT_DOMAIN;
    const secret = process.env.NEXT_PUBLIC_TENANT_SECRET;
    
    if (!tenantId || !secret) {
      console.warn('Missing tenant configuration for local mode:', {
        tenantId: !!tenantId,
        domain: domain || '(empty/undefined - this is OK)',
        secret: !!secret
      });
      return {};
    }
    
    const timestamp = generateTenantTimestamp();
    const domainToUse = domain || '';
    const signature = await generateTenantSignature(tenantId, domainToUse, timestamp, secret);
    
    const headers = {
      'X-Tenant-ID': tenantId,
      'X-Tenant-Ts': timestamp,
      'X-Tenant-Sig': signature
    };
    
    return headers;
  }
  
  return {};
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

