import OnboardingClient from './OnboardingClient';

/**
 * Tenant Onboarding Queue Page (Superadmin)
 *
 * Route protection handled by /sa/layout.tsx (checks SUPERADMIN role via sessionStorage)
 */
export default function TenantOnboardingPage() {
  return <OnboardingClient />;
}
