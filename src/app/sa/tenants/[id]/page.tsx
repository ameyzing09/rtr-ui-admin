import TenantDetailClient from './TenantDetailClient';

/**
 * Tenant Detail Page (Superadmin)
 *
 * Route protection handled by /sa/layout.tsx (checks SUPERADMIN role via sessionStorage)
 */
export default function TenantDetailPage() {
  return <TenantDetailClient />;
}
