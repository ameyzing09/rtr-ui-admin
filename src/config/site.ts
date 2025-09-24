import { env, isMaintenanceMode } from './env';

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  supportEmail: "contact@recrutr.in",
  maintenanceMode: isMaintenanceMode,
  appUrl: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  defaultTenant: env.NEXT_PUBLIC_DEFAULT_TENANT,
  multiTenantMode: env.NEXT_PUBLIC_MULTI_TENANT_MODE,
} as const;
