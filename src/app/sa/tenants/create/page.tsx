import CreateTenantClient from './CreateTenantClient';

/**
 * Create Tenant Page (Superadmin)
 *
 * Route protection handled by /sa/layout.tsx (checks SUPERADMIN role via sessionStorage)
 */
export default function CreateTenantPage() {
  return <CreateTenantClient />;
}
