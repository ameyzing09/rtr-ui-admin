'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/ui/Select';
import TenantTable from '@/components/tenants/TenantTable';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useTenantList } from '@/hooks/useTenantActions';
import { PLAN_OPTIONS, type TenantStatus, type Plan } from '@/domain/tenants/schemas';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROVISIONING', label: 'Provisioning' },
  { value: 'AWAITING_BRANDING', label: 'Awaiting Branding' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'TERMINATED', label: 'Terminated' },
];

const PLAN_FILTER_OPTIONS = [
  { value: '', label: 'All Plans' },
  ...PLAN_OPTIONS.map(plan => ({ value: plan.value, label: plan.label })),
];

export default function TenantsListClient() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | ''>('');
  const [planFilter, setPlanFilter] = useState<Plan | ''>('');

  // Fetch all tenants - filtering is done client-side since backend doesn't support filter params
  const fetchParams = useMemo(() => ({ limit: 100 }), []);
  const {
    tenants: allTenants,
    loading: isLoading,
    error,
    refetch
  } = useTenantList(fetchParams);

  // Client-side filtering since backend doesn't support filter params
  const tenants = useMemo(() => {
    return allTenants.filter(tenant => {
      if (statusFilter && tenant.status !== statusFilter) return false;
      if (planFilter && tenant.plan !== planFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = tenant.name.toLowerCase().includes(search);
        const matchesDomain = tenant.domain.toLowerCase().includes(search);
        const matchesEmail = tenant.admin_email?.toLowerCase().includes(search) ?? false;
        if (!matchesName && !matchesDomain && !matchesEmail) return false;
      }
      return true;
    });
  }, [allTenants, statusFilter, planFilter, searchTerm]);

  const handleDelete = async () => {
    await refetch();
  };

  const handleStatusClick = (tenantId: string) => {
    router.push(`/sa/tenants/${tenantId}?tab=status`);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-fg)]">All Tenants</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage and monitor all tenant accounts across the platform.
          </p>
        </div>
        <Button
          onClick={() => router.push('/sa/tenants/create')}
          icon={Plus}
        >
          Create Tenant
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={Search}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as TenantStatus | '')}
            options={STATUS_OPTIONS}
          />
          <Select
            placeholder="Filter by plan"
            value={planFilter}
            onValueChange={(value) => setPlanFilter(value as Plan | '')}
            options={PLAN_FILTER_OPTIONS}
          />
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setPlanFilter('');
              refetch();
            }}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner error={{ code: 'SERVER', retryable: true, details: { message: error }, userMessage: { title: 'Error', message: error } }} onRetry={refetch} />}

      {/* Tenant Table */}
      <TenantTable
        tenants={tenants}
        isLoading={isLoading}
        onDelete={handleDelete}
        onStatusClick={handleStatusClick}
      />
    </div>
  );
}
