'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Building,
  User,
  Activity,
  CreditCard,
  Edit,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

import Button from '@/components/atoms/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useTenant } from '@/hooks/useTenantActions';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

import {
  getTenantStatusAction,
  retryTenantAction,
  getSubscriptionAction,
  activateSubscriptionAction,
  suspendSubscriptionAction,
  resumeSubscriptionAction,
  cancelSubscriptionAction
} from '@/lib/actions/tenant';
import {
  type TenantDetail,
  type TenantStatusResponse,
  type Subscription,
  type TenantStatus,
  type SubscriptionStatus
} from '@/domain/tenants/schemas';
import { formatLongDate, formatShortDate, formatRelativeTime } from '@/lib/utils/date';

interface TenantHeaderProps {
  tenant: TenantDetail;
  onEdit: () => void;
}

function TenantHeader({ tenant, onEdit }: TenantHeaderProps) {
  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/30';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'PROVISIONING':
        return 'text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30';
      case 'AWAITING_BRANDING':
        return 'text-purple-700 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30';
      case 'FAILED':
        return 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/30';
      case 'SUSPENDED':
        return 'text-orange-700 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30';
      case 'TERMINATED':
        return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6 text-[var(--primary-foreground)]" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[var(--app-fg)]">{tenant.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(tenant.status)}`}>
                {tenant.status.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                {tenant.plan}
              </span>
            </div>

            <div className="space-y-1 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-4">
                <span>Domain: {tenant.domain}</span>
                <span>•</span>
                <span>Created: {formatRelativeTime(tenant.created_at)}</span>
              </div>
              {tenant.admin_email && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Admin: {tenant.admin_email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          icon={Edit}
          onClick={onEdit}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}

interface TabButtonProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, icon: Icon, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
        ${active
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
          : 'text-[var(--muted-foreground)] hover:text-[var(--app-fg)] hover:bg-[var(--muted)]'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

interface OverviewTabProps {
  tenant: TenantDetail;
}

function OverviewTab({ tenant }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="font-semibold text-[var(--app-fg)] mb-4">Basic Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Tenant ID:</span>
            <code className="text-sm bg-[var(--muted)] px-2 py-1 rounded">{tenant.id}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Company Name:</span>
            <span className="text-[var(--app-fg)]">{tenant.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Domain:</span>
            <span className="text-[var(--app-fg)]">{tenant.domain}</span>
          </div>
          {tenant.slug && (
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Slug:</span>
              <span className="text-[var(--app-fg)]">{tenant.slug}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Plan:</span>
            <span className="text-[var(--app-fg)]">{tenant.plan}</span>
          </div>
        </div>
      </div>

      {/* Admin Information */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="font-semibold text-[var(--app-fg)] mb-4">Administrator</h3>
        <div className="space-y-3">
          {tenant.admin_name && (
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Name:</span>
              <span className="text-[var(--app-fg)]">{tenant.admin_name}</span>
            </div>
          )}
          {tenant.admin_email && (
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Email:</span>
              <span className="text-[var(--app-fg)]">{tenant.admin_email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 lg:col-span-2">
        <h3 className="font-semibold text-[var(--app-fg)] mb-4">Timestamps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[var(--muted-foreground)] text-sm">Created:</span>
            <p className="text-[var(--app-fg)] font-medium">{formatRelativeTime(tenant.created_at)}</p>
            <p className="text-[var(--muted-foreground)] text-xs mt-1">{formatLongDate(tenant.created_at)}</p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)] text-sm">Last Updated:</span>
            <p className="text-[var(--app-fg)] font-medium">{formatRelativeTime(tenant.updated_at)}</p>
            <p className="text-[var(--muted-foreground)] text-xs mt-1">{formatLongDate(tenant.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* Error Information */}
      {tenant.failed_reason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 lg:col-span-2">
          <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
          <p className="text-red-800">{tenant.failed_reason}</p>
        </div>
      )}
    </div>
  );
}

interface StatusTabProps {
  tenantId: string;
}

function StatusTab({ tenantId }: StatusTabProps) {
  const [status, setStatus] = useState<TenantStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  // Load status data on mount and when tenantId changes
  useEffect(() => {
    const loadStatusData = async () => {
      setIsLoading(true);
      try {
        const result = await getTenantStatusAction(tenantId);
        if (result.success) {
          setStatus(result.data);
        } else {
          console.warn('Failed to load status:', result.error);
          // Provide mock status data for demo
          setStatus({
            tenant_id: tenantId,
            current_status: 'ACTIVE',
            timeline: [
              { step: 'Infrastructure Setup', status: 'COMPLETED', timestamp: new Date(), message: 'Server provisioned successfully' },
              { step: 'Database Creation', status: 'COMPLETED', timestamp: new Date(), message: 'Database initialized' },
              { step: 'Application Deployment', status: 'COMPLETED', timestamp: new Date(), message: 'Application deployed and running' }
            ]
          });
        }
      } catch (err) {
        console.warn('API not available, using mock status data:', err);
        // Provide mock status data for demo
        setStatus({
          tenant_id: tenantId,
          current_status: 'ACTIVE',
          timeline: [
            { step: 'Infrastructure Setup', status: 'COMPLETED', timestamp: new Date(), message: 'Server provisioned successfully' },
            { step: 'Database Creation', status: 'COMPLETED', timestamp: new Date(), message: 'Database initialized' },
            { step: 'Application Deployment', status: 'COMPLETED', timestamp: new Date(), message: 'Application deployed and running' }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadStatusData();
  }, [tenantId]);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getTenantStatusAction(tenantId);
      if (result.success) {
        setStatus(result.data);
      } else {
        console.warn('Failed to load status:', result.error);
        // Provide mock status data for demo
        setStatus({
          tenant_id: tenantId,
          current_status: 'ACTIVE',
          timeline: [
            { step: 'Infrastructure Setup', status: 'COMPLETED', timestamp: new Date(), message: 'Server provisioned successfully' },
            { step: 'Database Creation', status: 'COMPLETED', timestamp: new Date(), message: 'Database initialized' },
            { step: 'Application Deployment', status: 'COMPLETED', timestamp: new Date(), message: 'Application deployed and running' }
          ]
        });
      }
    } catch (err) {
      console.warn('API not available, using mock status data:', err);
      // Provide mock status data for demo
      setStatus({
        tenant_id: tenantId,
        current_status: 'ACTIVE',
        timeline: [
          { step: 'Infrastructure Setup', status: 'COMPLETED', timestamp: new Date(), message: 'Server provisioned successfully' },
          { step: 'Database Creation', status: 'COMPLETED', timestamp: new Date(), message: 'Database initialized' },
          { step: 'Application Deployment', status: 'COMPLETED', timestamp: new Date(), message: 'Application deployed and running' }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      const result = await retryTenantAction(tenantId);
      if (result.success) {
        console.log('Retry initiated: Tenant provisioning has been restarted.');
        await refreshStatus(); // Reload status
      } else {
        console.warn('Failed to retry:', result.error);
      }
    } catch (err) {
      console.warn('Failed to retry:', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRetrying(false);
    }
  }, [tenantId, refreshStatus]);

  if (isLoading) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <Skeleton width="200px" height="24px" className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton width="24px" height="24px" variant="circular" />
              <Skeleton width="300px" height="20px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
        <p className="text-[var(--muted-foreground)]">Unable to load status information</p>
        <Button variant="outline" onClick={refreshStatus} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-[var(--app-fg)]">Provisioning Status</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={refreshStatus}
              size="sm"
            >
              Refresh
            </Button>
            {status.current_status === 'FAILED' && (
              <Button
                variant="outline"
                onClick={handleRetry}
                isLoading={isRetrying}
                size="sm"
              >
                Retry
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {(status.timeline || []).map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              {getStepIcon(step.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--app-fg)]">{step.step}</span>
                  {step.timestamp && (
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {new Intl.DateTimeFormat('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(step.timestamp)}
                    </span>
                  )}
                </div>
                {step.message && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">{step.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SubscriptionTabProps {
  tenantId: string;
}

function SubscriptionTab({ tenantId }: SubscriptionTabProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load subscription on mount and tenantId change
  useEffect(() => {
    const loadSubscription = async () => {
      setIsLoading(true);
      try {
        const result = await getSubscriptionAction(tenantId);
        if (result.success) {
          setSubscription(result.data);
        } else {
          console.warn('Failed to load subscription:', result.error);
          // Provide mock subscription data for demo
          setSubscription({
            id: `sub_${tenantId}`,
            plan: 'ENTERPRISE',
            status: 'ACTIVE',
            created_at: new Date(),
            updated_at: new Date(),
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          });
        }
      } catch (err) {
        console.warn('API not available, using mock subscription data:', err);
        // Provide mock subscription data for demo
        setSubscription({
          id: `sub_${tenantId}`,
          plan: 'ENTERPRISE',
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date(),
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, [tenantId]);

  const handleSubscriptionAction = useCallback(async (action: 'activate' | 'suspend' | 'resume' | 'cancel') => {
    setActionLoading(action);
    try {
      let result;
      switch (action) {
        case 'activate':
          result = await activateSubscriptionAction(tenantId);
          break;
        case 'suspend':
          result = await suspendSubscriptionAction(tenantId);
          break;
        case 'resume':
          result = await resumeSubscriptionAction(tenantId);
          break;
        case 'cancel':
          result = await cancelSubscriptionAction(tenantId);
          break;
      }

      if (result.success) {
        setSubscription(result.data);
        console.log(`Subscription updated: Subscription has been ${action}d successfully.`);
      } else {
        console.warn(`Failed to ${action} subscription:`, result.error);
      }
    } catch (err) {
      console.warn(`Failed to ${action} subscription:`, err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setActionLoading(null);
    }
  }, [tenantId]);



  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'TRIAL':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'SUSPENDED':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'INACTIVE':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <Skeleton width="200px" height="24px" className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton width="100%" height="80px" />
          <Skeleton width="100%" height="80px" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 text-center">
        <CreditCard className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
        <p className="text-[var(--muted-foreground)]">No subscription information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Details */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="font-semibold text-[var(--app-fg)] mb-4">Subscription Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <span className="text-[var(--muted-foreground)] text-sm">Status:</span>
            <div className="mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[var(--muted-foreground)] text-sm">Plan:</span>
            <p className="text-[var(--app-fg)] font-medium">{subscription.plan}</p>
          </div>

          {subscription.trial_ends_at && (
            <div>
              <span className="text-[var(--muted-foreground)] text-sm">Trial Ends:</span>
              <p className="text-[var(--app-fg)]">{formatShortDate(subscription.trial_ends_at)}</p>
            </div>
          )}

          {subscription.current_period_start && (
            <div>
              <span className="text-[var(--muted-foreground)] text-sm">Current Period Start:</span>
              <p className="text-[var(--app-fg)]">{formatShortDate(subscription.current_period_start)}</p>
            </div>
          )}

          {subscription.current_period_end && (
            <div>
              <span className="text-[var(--muted-foreground)] text-sm">Current Period End:</span>
              <p className="text-[var(--app-fg)]">{formatShortDate(subscription.current_period_end)}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {subscription.status === 'INACTIVE' && (
            <Button
              onClick={() => handleSubscriptionAction('activate')}
              isLoading={actionLoading === 'activate'}
              disabled={actionLoading !== null}
            >
              Activate
            </Button>
          )}

          {subscription.status === 'ACTIVE' && (
            <Button
              variant="outline"
              onClick={() => handleSubscriptionAction('suspend')}
              isLoading={actionLoading === 'suspend'}
              disabled={actionLoading !== null}
            >
              Suspend
            </Button>
          )}

          {subscription.status === 'SUSPENDED' && (
            <Button
              onClick={() => handleSubscriptionAction('resume')}
              isLoading={actionLoading === 'resume'}
              disabled={actionLoading !== null}
            >
              Resume
            </Button>
          )}

          {['ACTIVE', 'SUSPENDED', 'TRIAL'].includes(subscription.status) && (
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
                  handleSubscriptionAction('cancel');
                }
              }}
              isLoading={actionLoading === 'cancel'}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TenantDetailClient() {
  const { id } = useParams();
  const router = useRouter();

  // Use Server Actions (BFF) - no HTTP hop, direct server-side call
  const {
    data: tenant,
    loading: isLoading,
    error,
    refetch
  } = useTenant(typeof id === 'string' ? id : null);

  const initialTab = useSearchParams().get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton width="200px" height="32px" />
        <Skeleton width="100%" height="120px" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton width="100%" height="200px" />
          <Skeleton width="100%" height="200px" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorBanner error={{ code: 'SERVER', retryable: true, details: { message: error }, userMessage: { title: 'Error', message: error } }} onRetry={refetch} />;
  }

  if (!tenant) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--app-fg)] mb-2">Tenant Not Found</h1>
          <p className="text-[var(--muted-foreground)] mb-4">
            The requested tenant could not be found.
          </p>
          <Button onClick={() => router.push('/sa/tenants')}>
            Back to Tenants
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'status', label: 'Status', icon: Activity },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        icon={ArrowLeft}
        onClick={() => router.push('/sa/tenants')}
      >
        Back to Tenants
      </Button>

      {/* Header */}
      <TenantHeader tenant={tenant} onEdit={() => router.push(`/sa/tenants/${tenant.id}/edit`)} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab tenant={tenant} />}
          {activeTab === 'status' && <StatusTab tenantId={tenant.id} />}
          {activeTab === 'subscription' && <SubscriptionTab tenantId={tenant.id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
