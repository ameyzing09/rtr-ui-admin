'use client';

import React, { useState, useCallback } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/ui/Select';
import TenantTable from '@/components/tenants/TenantTable';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useApiRequest } from '@/hooks/useApiRequest';
import { PLAN_OPTIONS, type TenantListItem } from '@/lib/schemas/tenant';

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

export default function AllTenantsPage() {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');

  // Centralized fetch with useApiRequest
  const {
    data: tenants,
    loading: isLoading,
    error,
    refetch
  } = useApiRequest<TenantListItem[]>(
    '/api/tenants?limit=100'
      + (statusFilter ? `&status=${statusFilter}` : '')
      + (planFilter ? `&plan=${planFilter}` : '')
      + (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''),
    {
      immediate: true,
      deps: [searchTerm, statusFilter, planFilter]
    }
  );

  const handleDelete = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleStatusClick = useCallback((tenantId: string) => {
    router.push(`/sa/tenants/${tenantId}?tab=status`);
  }, [router]);

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
            onValueChange={(value) => setStatusFilter(value as string)}
            options={STATUS_OPTIONS}
          />
          <Select
            placeholder="Filter by plan"
            value={planFilter}
            onValueChange={(value) => setPlanFilter(value as string)}
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
      {error && <ErrorBanner error={error} onRetry={refetch} />}

      {/* Tenant Table */}
      <TenantTable
        tenants={tenants || []}
        isLoading={isLoading}
        onDelete={handleDelete}
        onStatusClick={handleStatusClick}
      />
    </div>
  );
}