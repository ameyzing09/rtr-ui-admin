'use client';
import { Clock, RefreshCw } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { FeatureFlags } from '@/config/featureFlags';
import TenantTable from '@/components/tenants/TenantTable';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useTenantList } from '@/hooks/useTenantActions';
import { type TenantStatus } from '@/domain/tenants/schemas';

const ONBOARDING_STATUSES: TenantStatus[] = ['PENDING', 'PROVISIONING', 'AWAITING_BRANDING'];

export default function OnboardingClient() {
  const isFeatureEnabled = FeatureFlags.isTenantOnboardingQueueEnabled();

  // Use Server Actions (BFF) - no HTTP hop, direct server-side call
  const {
    tenants,
    loading: isLoading,
    error,
    refetch
  } = useTenantList({
    limit: 50
  });

  const onboardingTenants = tenants.filter(tenant =>
    ONBOARDING_STATUSES.includes(tenant.status)
  );

  if (!isFeatureEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md">
          <Clock className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Feature Not Available</h2>
          <p className="text-[var(--muted-foreground)]">
            The Tenant Onboarding Queue feature is currently disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenant Onboarding Queue</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Monitor tenants currently in the onboarding process ({onboardingTenants.length} in queue)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      <div className="glass-panel">
        {error && <ErrorBanner error={{ code: 'SERVER', retryable: true, details: { message: error }, userMessage: { title: 'Error', message: error } }} onRetry={refetch} />}
        {onboardingTenants.length === 0 && !isLoading && !error ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tenants in Queue</h3>
            <p className="text-[var(--muted-foreground)]">
              All tenants have completed the onboarding process
            </p>
          </div>
        ) : (
          <TenantTable
            tenants={onboardingTenants}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
