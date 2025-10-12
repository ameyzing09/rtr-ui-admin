import TenantsListClient from './TenantsListClient';

/**
 * All Tenants Page (Superadmin)
 *
 * Route protection is handled by the /sa/layout.tsx wrapper which:
 * - Checks if user is authenticated (via sessionStorage)
 * - Verifies user has SUPERADMIN role
 * - Redirects to /login if not authorized
 *
 * Note: No server-side guards here because we use sessionStorage (client-only).
 * The layout component is the authentication boundary.
 */
export default function AllTenantsPage() {
  return <TenantsListClient />;
}
