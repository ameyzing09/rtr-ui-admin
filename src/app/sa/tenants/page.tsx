'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Users, Eye, RefreshCw } from 'lucide-react';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';

import { listTenantsAction } from '@/lib/actions/tenant';
import { 
  type TenantListItem, 
  type TenantStatus,
  type Plan,
  PLAN_OPTIONS
} from '@/lib/schemas/tenant';

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
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');

  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null); // Clear any previous errors
    setTenants([]); // Clear existing tenants to prevent stale data
    
    try {
      const params: { limit: number; status?: TenantStatus; plan?: Plan; search?: string } = { limit: 100 };
      if (statusFilter) params.status = statusFilter as TenantStatus;
      if (planFilter) params.plan = planFilter as Plan;
      if (searchTerm) params.search = searchTerm;

      console.log('🔄 Loading tenants with params:', params);
      const result = await listTenantsAction(params);
      
      if (result.success) {
        console.log('✅ Successfully loaded tenants:', result.data.tenants?.length || 0);
        setTenants(result.data.tenants || []);
        setErrorMessage(null); // Clear error on success
      } else {
        console.log('❌ Failed to load tenants:', result.error);
        setTenants([]); // Set empty array on failure
        setErrorMessage(result.error || 'Failed to load tenants');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to load tenants';
      console.log('❌ Loading failed with exception:', err);
      setTenants([]); // Set empty array on failure
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, planFilter, searchTerm]);

  // Load tenants on mount and when filters change
  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTenants();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadTenants]);

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'PROVISIONING':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'AWAITING_BRANDING':
        return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'FAILED':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'SUSPENDED':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'TERMINATED':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getPlanColor = (plan: Plan) => {
    switch (plan) {
      case 'ENTERPRISE':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'GROWTH':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'STARTER':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'ON_PREM':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--app-fg)] mb-2">
          All Tenants
        </h1>
        <p className="text-[var(--muted-foreground)]">
          View and manage all tenants in the system
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-[var(--muted-foreground)]" />
          <h3 className="font-medium text-[var(--app-fg)]">Filters</h3>
        </div>
        
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
            onClick={() => loadTenants()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--muted-foreground)]" />
              <span className="font-medium text-[var(--app-fg)]">
                {isLoading ? 'Loading...' : `${tenants.length} tenant${tenants.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div className="flex-1">
                    <Skeleton width="200px" height="20px" className="mb-2" />
                    <Skeleton width="300px" height="16px" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton width="80px" height="24px" />
                    <Skeleton width="100px" height="24px" />
                    <Skeleton width="120px" height="16px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : errorMessage ? (
          <div className="p-12 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Tenants</h3>
              <p className="text-red-700 mb-4">{errorMessage}</p>
              <button
                onClick={loadTenants}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--app-fg)] mb-2">
              No tenants found
            </h3>
            <p className="text-[var(--muted-foreground)]">
              {searchTerm || statusFilter || planFilter
                ? 'Try adjusting your filters to see more results.'
                : 'No tenants have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-6 hover:bg-[var(--muted)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[var(--app-fg)] truncate">
                        {tenant.name}
                      </h3>
                      <span className={`px-2 py-1 border rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                        {tenant.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 border rounded-full text-xs font-medium ${getPlanColor(tenant.plan)}`}>
                        {tenant.plan}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <span>Domain: {tenant.domain}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Admin: {tenant.admin_email}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Created: {formatDate(tenant.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}