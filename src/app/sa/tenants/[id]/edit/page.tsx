import EditTenantClient from './EditTenantClient';

/**
 * Edit Tenant Page (Superadmin)
 *
 * Route protection handled by /sa/layout.tsx (checks SUPERADMIN role via sessionStorage)
 */
export default function EditTenantPage() {
  return <EditTenantClient />;
}
