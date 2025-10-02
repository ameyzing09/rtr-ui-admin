'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, X, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

import Button from '@/components/atoms/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useToastMessages } from '@/components/ui/ToastProvider';
import { FeatureFlags } from '@/config/featureFlags';

import { listTenantsAction, getTenantStatusAction } from '@/lib/actions/tenant';
import { 
  type TenantListItem, 
  type TenantStatusTimelineItem,
  type TenantStatus,
  type TenantStatusResponse
} from '@/lib/schemas/tenant';

const ONBOARDING_STATUSES: TenantStatus[] = ['PENDING', 'PROVISIONING', 'AWAITING_BRANDING'];

export default function TenantOnboardingPage() {
  const isFeatureEnabled = FeatureFlags.isTenantOnboardingQueueEnabled();
  const { error } = useToastMessages();
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [tenantStatus, setTenantStatus] = useState<TenantStatusResponse | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Filter to only show onboarding tenants
  const onboardingTenants = tenants.filter(tenant => 
    ONBOARDING_STATUSES.includes(tenant.status)
  );

  const loadTenants = React.useCallback(async () => {
    setIsLoading(true);
    setTenants([]); // Clear existing tenants
    
    try {
      console.log('🔄 Loading onboarding tenants...');
      const result = await listTenantsAction({ limit: 50 });
      
      if (result.success) {
        console.log('✅ Successfully loaded tenants for onboarding queue:', result.data.tenants?.length || 0);
        setTenants(result.data.tenants || []);
      } else {
        console.log('❌ Failed to load tenants for onboarding:', result.error);
        setTenants([]); // Set empty array on failure
      }
    } catch (err) {
      console.log('❌ Loading failed with exception:', err);
      setTenants([]); // Set empty array on failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTenantStatus = React.useCallback(async (tenantId: string) => {
    setIsLoadingStatus(true);
    try {
      const result = await getTenantStatusAction(tenantId);
      
      if (result.success) {
        setTenantStatus(result.data);
        
        // If tenant is now active, remove from list with animation
        if (result.data.current_status === 'ACTIVE') {
          setTimeout(() => {
            setTenants(prev => prev.filter(t => t.id !== tenantId));
            setSelectedTenant(null);
            setTenantStatus(null);
          }, 2000);
        }
      } else {
        error('Failed to load status', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to load tenant status';
      error('Status failed', errorMessage);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [error]);

  // Load tenants on mount
  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleViewStatus = (tenantId: string) => {
    setSelectedTenant(tenantId);
    loadTenantStatus(tenantId);
  };

  const handleCloseStatus = () => {
    setSelectedTenant(null);
  };

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'PROVISIONING':
        return 'text-blue-600 bg-blue-100';
      case 'AWAITING_BRANDING':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimelineStepIcon = (step: TenantStatusTimelineItem) => {
    switch (step.status) {
      case 'COMPLETED':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'IN_PROGRESS':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'FAILED':  
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };



  // Show disabled message if feature flag is off
  if (!isFeatureEnabled) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--app-fg)] mb-2">
            Feature Disabled
          </h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            The Tenant Onboarding Queue feature is currently disabled. 
            Please enable the <code className="px-2 py-1 bg-[var(--muted)] rounded text-sm">NEXT_PUBLIC_ENABLE_TENANT_ONBOARDING_QUEUE</code> environment variable to access this feature.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/sa/tenants'}
          >
            Go to All Tenants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className={`flex-1 p-8 transition-all duration-300 ${selectedTenant ? 'mr-96' : ''}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--app-fg)] mb-2">
              Onboarding Queue
            </h1>
            <p className="text-[var(--muted-foreground)]">
              Monitor tenant provisioning and onboarding status
            </p>
          </div>
          
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => loadTenants()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton width="200px" height="20px" className="mb-2" />
                    <Skeleton width="150px" height="16px" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton width="100px" height="24px" />
                    <Skeleton width="80px" height="32px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : onboardingTenants.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--app-fg)] mb-2">
              No tenants in onboarding queue
            </h3>
            <p className="text-[var(--muted-foreground)]">
              All tenants have completed the onboarding process.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {onboardingTenants.map((tenant) => (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--app-fg)] mb-1">
                        {tenant.name}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] mb-2">
                        {tenant.domain} • {tenant.admin_email}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Created {tenant.created_at.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tenant.status)}`}>
                        {tenant.status.replace('_', ' ')}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewStatus(tenant.id)}
                      >
                        View Status
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Status panel */}
      <AnimatePresence>
        {selectedTenant && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-[var(--card)] border-l border-[var(--border)] shadow-xl z-50"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold text-[var(--app-fg)]">
                  Provisioning Status
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={handleCloseStatus}
                />
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingStatus ? (
                  <div className="space-y-4">
                    <Skeleton height="60px" />
                    <Skeleton height="200px" />
                  </div>
                ) : tenantStatus ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="font-medium text-[var(--app-fg)] mb-2">
                        {onboardingTenants.find(t => t.id === selectedTenant)?.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tenantStatus.current_status)}`}>
                        {tenantStatus.current_status.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-[var(--app-fg)] mb-4">
                        Provisioning Timeline
                      </h4>
                      
                      <div className="space-y-4">
                        {tenantStatus.timeline.map((step: TenantStatusTimelineItem, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
                              {getTimelineStepIcon(step)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--app-fg)] text-sm">
                                {step.step}
                              </p>
                              {step.message && (
                                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                                  {step.message}
                                </p>
                              )}
                              {step.timestamp && (
                                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                  {step.timestamp.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                    <p className="text-[var(--muted-foreground)]">
                      Unable to load status information
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}