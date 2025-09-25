/**
 * Feature Flags Configuration
 * 
 * This file centralizes all feature flags and provides typed getters
 * that read from environment variables with sensible defaults.
 */

import { env } from './env';

// Feature flag keys for consistency
export const FEATURE_FLAG_KEYS = {
  // Core features
  MULTI_TENANT_MODE: 'MULTI_TENANT_MODE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  ANALYTICS: 'ANALYTICS',
  
  // Billing and subscription features
  BILLING_ENABLED: 'BILLING_ENABLED',
  STRIPE_INTEGRATION: 'STRIPE_INTEGRATION',
  SUBSCRIPTION_MANAGEMENT: 'SUBSCRIPTION_MANAGEMENT',
  
  // Authentication and security
  SSO_ENABLED: 'SSO_ENABLED',
  TWO_FACTOR_AUTH: 'TWO_FACTOR_AUTH',
  API_KEY_AUTH: 'API_KEY_AUTH',
  
  // User interface features
  DARK_MODE: 'DARK_MODE',
  THEME_CUSTOMIZATION: 'THEME_CUSTOMIZATION',
  ADVANCED_SEARCH: 'ADVANCED_SEARCH',
  BULK_OPERATIONS: 'BULK_OPERATIONS',
  
  // Platform features
  TENANT_IMPERSONATION: 'TENANT_IMPERSONATION',
  AUDIT_LOGGING: 'AUDIT_LOGGING',
  WEBHOOKS: 'WEBHOOKS',
  REAL_TIME_NOTIFICATIONS: 'REAL_TIME_NOTIFICATIONS',
  
  // Integrations
  SLACK_INTEGRATION: 'SLACK_INTEGRATION',
  EMAIL_NOTIFICATIONS: 'EMAIL_NOTIFICATIONS',
  SMS_NOTIFICATIONS: 'SMS_NOTIFICATIONS',
  
  // Advanced features
  AI_FEATURES: 'AI_FEATURES',
  MACHINE_LEARNING: 'MACHINE_LEARNING',
  ADVANCED_ANALYTICS: 'ADVANCED_ANALYTICS',
  
  // Experimental features
  BETA_FEATURES: 'BETA_FEATURES',
  EXPERIMENTAL_UI: 'EXPERIMENTAL_UI',
  NEW_DASHBOARD: 'NEW_DASHBOARD',
  
  // Development and debugging
  DEBUG_MODE: 'DEBUG_MODE',
  DEV_TOOLS: 'DEV_TOOLS',
  MOCK_DATA: 'MOCK_DATA',
} as const;

// Feature flag configuration with defaults
const FEATURE_FLAGS_CONFIG = {
  // Core features - read from environment with defaults
  [FEATURE_FLAG_KEYS.MULTI_TENANT_MODE]: {
    envKey: 'NEXT_PUBLIC_MULTI_TENANT_MODE',
    defaultValue: false,
    description: 'Enable multi-tenant functionality',
  },
  [FEATURE_FLAG_KEYS.MAINTENANCE_MODE]: {
    envKey: 'NEXT_PUBLIC_MAINTENANCE_MODE',
    defaultValue: false,
    description: 'Put application in maintenance mode',
  },
  [FEATURE_FLAG_KEYS.ANALYTICS]: {
    envKey: 'NEXT_PUBLIC_ENABLE_ANALYTICS',
    defaultValue: false,
    description: 'Enable analytics tracking',
  },
  
  // Billing features
  [FEATURE_FLAG_KEYS.BILLING_ENABLED]: {
    envKey: 'NEXT_PUBLIC_ENABLE_BILLING',
    defaultValue: false,
    description: 'Enable billing and subscription features',
  },
  [FEATURE_FLAG_KEYS.STRIPE_INTEGRATION]: {
    envKey: 'NEXT_PUBLIC_ENABLE_STRIPE',
    defaultValue: false,
    description: 'Enable Stripe payment integration',
  },
  [FEATURE_FLAG_KEYS.SUBSCRIPTION_MANAGEMENT]: {
    envKey: 'NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS',
    defaultValue: false,
    description: 'Enable subscription management features',
  },
  
  // Authentication and security
  [FEATURE_FLAG_KEYS.SSO_ENABLED]: {
    envKey: 'NEXT_PUBLIC_ENABLE_SSO',
    defaultValue: false,
    description: 'Enable Single Sign-On functionality',
  },
  [FEATURE_FLAG_KEYS.TWO_FACTOR_AUTH]: {
    envKey: 'NEXT_PUBLIC_ENABLE_2FA',
    defaultValue: false,
    description: 'Enable two-factor authentication',
  },
  [FEATURE_FLAG_KEYS.API_KEY_AUTH]: {
    envKey: 'NEXT_PUBLIC_ENABLE_API_KEYS',
    defaultValue: true,
    description: 'Enable API key authentication',
  },
  
  // UI features
  [FEATURE_FLAG_KEYS.DARK_MODE]: {
    envKey: 'NEXT_PUBLIC_ENABLE_DARK_MODE',
    defaultValue: true,
    description: 'Enable dark mode theme',
  },
  [FEATURE_FLAG_KEYS.THEME_CUSTOMIZATION]: {
    envKey: 'NEXT_PUBLIC_ENABLE_THEME_CUSTOMIZATION',
    defaultValue: true,
    description: 'Enable theme customization features',
  },
  [FEATURE_FLAG_KEYS.ADVANCED_SEARCH]: {
    envKey: 'NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH',
    defaultValue: true,
    description: 'Enable advanced search functionality',
  },
  [FEATURE_FLAG_KEYS.BULK_OPERATIONS]: {
    envKey: 'NEXT_PUBLIC_ENABLE_BULK_OPERATIONS',
    defaultValue: true,
    description: 'Enable bulk operations on data',
  },
  
  // Platform features
  [FEATURE_FLAG_KEYS.TENANT_IMPERSONATION]: {
    envKey: 'NEXT_PUBLIC_ENABLE_IMPERSONATION',
    defaultValue: false,
    description: 'Enable tenant impersonation for admins',
  },
  [FEATURE_FLAG_KEYS.AUDIT_LOGGING]: {
    envKey: 'NEXT_PUBLIC_ENABLE_AUDIT_LOGS',
    defaultValue: true,
    description: 'Enable audit logging',
  },
  [FEATURE_FLAG_KEYS.WEBHOOKS]: {
    envKey: 'NEXT_PUBLIC_ENABLE_WEBHOOKS',
    defaultValue: true,
    description: 'Enable webhook functionality',
  },
  [FEATURE_FLAG_KEYS.REAL_TIME_NOTIFICATIONS]: {
    envKey: 'NEXT_PUBLIC_ENABLE_REAL_TIME',
    defaultValue: false,
    description: 'Enable real-time notifications',
  },
  
  // Integrations
  [FEATURE_FLAG_KEYS.SLACK_INTEGRATION]: {
    envKey: 'NEXT_PUBLIC_ENABLE_SLACK',
    defaultValue: false,
    description: 'Enable Slack integration',
  },
  [FEATURE_FLAG_KEYS.EMAIL_NOTIFICATIONS]: {
    envKey: 'NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS',
    defaultValue: true,
    description: 'Enable email notifications',
  },
  [FEATURE_FLAG_KEYS.SMS_NOTIFICATIONS]: {
    envKey: 'NEXT_PUBLIC_ENABLE_SMS_NOTIFICATIONS',
    defaultValue: false,
    description: 'Enable SMS notifications',
  },
  
  // Advanced features
  [FEATURE_FLAG_KEYS.AI_FEATURES]: {
    envKey: 'NEXT_PUBLIC_ENABLE_AI',
    defaultValue: false,
    description: 'Enable AI-powered features',
  },
  [FEATURE_FLAG_KEYS.MACHINE_LEARNING]: {
    envKey: 'NEXT_PUBLIC_ENABLE_ML',
    defaultValue: false,
    description: 'Enable machine learning features',
  },
  [FEATURE_FLAG_KEYS.ADVANCED_ANALYTICS]: {
    envKey: 'NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS',
    defaultValue: false,
    description: 'Enable advanced analytics and reporting',
  },
  
  // Experimental features
  [FEATURE_FLAG_KEYS.BETA_FEATURES]: {
    envKey: 'NEXT_PUBLIC_ENABLE_BETA',
    defaultValue: false,
    description: 'Enable beta features',
  },
  [FEATURE_FLAG_KEYS.EXPERIMENTAL_UI]: {
    envKey: 'NEXT_PUBLIC_ENABLE_EXPERIMENTAL_UI',
    defaultValue: false,
    description: 'Enable experimental UI components',
  },
  [FEATURE_FLAG_KEYS.NEW_DASHBOARD]: {
    envKey: 'NEXT_PUBLIC_ENABLE_NEW_DASHBOARD',
    defaultValue: false,
    description: 'Enable new dashboard layout',
  },
  
  // Development features
  [FEATURE_FLAG_KEYS.DEBUG_MODE]: {
    envKey: 'NEXT_PUBLIC_DEBUG_MODE',
    defaultValue: env.NODE_ENV === 'development',
    description: 'Enable debug mode',
  },
  [FEATURE_FLAG_KEYS.DEV_TOOLS]: {
    envKey: 'NEXT_PUBLIC_ENABLE_DEV_TOOLS',
    defaultValue: env.NODE_ENV === 'development',
    description: 'Enable development tools',
  },
  [FEATURE_FLAG_KEYS.MOCK_DATA]: {
    envKey: 'NEXT_PUBLIC_USE_MOCK_DATA',
    defaultValue: env.NODE_ENV === 'development',
    description: 'Use mock data instead of real API calls',
  },
} as const;

/**
 * Get the value of a feature flag
 */
function getFeatureFlag(key: keyof typeof FEATURE_FLAGS_CONFIG): boolean {
  const config = FEATURE_FLAGS_CONFIG[key];
  
  // Check if the environment variable exists and is set
  const envValue = process.env[config.envKey];
  
  if (envValue !== undefined) {
    // Convert string to boolean
    return envValue === 'true' || envValue === '1';
  }
  
  // Return default value if env var is not set
  return config.defaultValue;
}

/**
 * Get all feature flags as an object
 */
export function getAllFeatureFlags(): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  
  Object.keys(FEATURE_FLAGS_CONFIG).forEach((key) => {
    flags[key] = getFeatureFlag(key as keyof typeof FEATURE_FLAGS_CONFIG);
  });
  
  return flags;
}

/**
 * Feature flag getters with descriptive names
 */
export const FeatureFlags = {
  // Core features
  isMultiTenantMode: () => getFeatureFlag(FEATURE_FLAG_KEYS.MULTI_TENANT_MODE),
  isMaintenanceMode: () => getFeatureFlag(FEATURE_FLAG_KEYS.MAINTENANCE_MODE),
  isAnalyticsEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.ANALYTICS),
  
  // Billing features
  isBillingEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.BILLING_ENABLED),
  isStripeEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.STRIPE_INTEGRATION),
  isSubscriptionManagementEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.SUBSCRIPTION_MANAGEMENT),
  
  // Authentication and security
  isSSOEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.SSO_ENABLED),
  isTwoFactorAuthEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.TWO_FACTOR_AUTH),
  isApiKeyAuthEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.API_KEY_AUTH),
  
  // UI features
  isDarkModeEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.DARK_MODE),
  isThemeCustomizationEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.THEME_CUSTOMIZATION),
  isAdvancedSearchEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.ADVANCED_SEARCH),
  isBulkOperationsEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.BULK_OPERATIONS),
  
  // Platform features
  isTenantImpersonationEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.TENANT_IMPERSONATION),
  isAuditLoggingEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.AUDIT_LOGGING),
  isWebhooksEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.WEBHOOKS),
  isRealTimeNotificationsEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.REAL_TIME_NOTIFICATIONS),
  
  // Integrations
  isSlackIntegrationEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.SLACK_INTEGRATION),
  isEmailNotificationsEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.EMAIL_NOTIFICATIONS),
  isSmsNotificationsEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.SMS_NOTIFICATIONS),
  
  // Advanced features
  isAIFeaturesEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.AI_FEATURES),
  isMachineLearningEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.MACHINE_LEARNING),
  isAdvancedAnalyticsEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.ADVANCED_ANALYTICS),
  
  // Experimental features
  isBetaFeaturesEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.BETA_FEATURES),
  isExperimentalUIEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.EXPERIMENTAL_UI),
  isNewDashboardEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.NEW_DASHBOARD),
  
  // Development features
  isDebugModeEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.DEBUG_MODE),
  isDevToolsEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.DEV_TOOLS),
  isMockDataEnabled: () => getFeatureFlag(FEATURE_FLAG_KEYS.MOCK_DATA),
} as const;

/**
 * Helper to filter navigation items based on feature flags
 */
export function filterByFeatureFlags<T extends { requiredFlags?: string[] }>(
  items: T[],
  flags: Record<string, boolean> = getAllFeatureFlags()
): T[] {
  return items.filter((item) => {
    if (!item.requiredFlags || item.requiredFlags.length === 0) {
      return true;
    }
    
    // Item is visible if ALL required flags are enabled
    return item.requiredFlags.every((flag) => flags[flag] === true);
  });
}

/**
 * Log feature flags for debugging (development only)
 */
export function logFeatureFlags(): void {
  if (env.NODE_ENV === 'development') {
    console.log('🚩 Feature Flags:');
    const flags = getAllFeatureFlags();
    Object.entries(flags).forEach(([key, value]) => {
      const config = FEATURE_FLAGS_CONFIG[key as keyof typeof FEATURE_FLAGS_CONFIG];
      console.log(`- ${key}: ${value} (${config?.description || 'No description'})`);
    });
  }
}

// Type exports
export type FeatureFlagKey = keyof typeof FEATURE_FLAG_KEYS;
export type FeatureFlagConfig = typeof FEATURE_FLAGS_CONFIG;
export type FeatureFlagValue = boolean;

// Export the configuration for external use
export { FEATURE_FLAGS_CONFIG };
