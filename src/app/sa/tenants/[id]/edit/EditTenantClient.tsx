'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { ZodError } from 'zod';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/ui/Select';
import Form, { FormField, FormActions } from '@/components/ui/Form';
import Skeleton from '@/components/ui/Skeleton';
import { useTenant, useUpdateTenant } from '@/hooks/useTenantActions';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { type UpdateTenantRequest, updateTenantRequestSchema, PLAN_OPTIONS } from '@/domain/tenants/schemas';

/**
 * Formats Zod validation errors into a simple key-value object
 */
const formatZodErrors = (error: unknown): Record<string, string> => {
  if (error instanceof ZodError) {
    const errors: Record<string, string> = {};
    error.issues.forEach((issue) => {
      const fieldName = issue.path[0] as string;
      if (fieldName) {
        errors[fieldName] = issue.message;
      }
    });
    return errors;
  }
  return {};
};

export default function EditTenantClient() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  // Use Server Actions (BFF) - no HTTP hop, direct server-side call
  const {
    data: tenant,
    loading: isLoading,
    error: loadError,
    refetch
  } = useTenant(tenantId || null);

  // Use Server Actions for update
  const {
    updateTenant,
    loading: isSaving,
    error: saveError
  } = useUpdateTenant();

  const [formData, setFormData] = useState<UpdateTenantRequest>({
    name: '',
    domain: '',
    plan: undefined,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        domain: tenant.domain,
        plan: tenant.plan,
      });
    }
  }, [tenant]);

  const updateFormData = (updates: Partial<UpdateTenantRequest>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    if (updatedFields.length > 0) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        updatedFields.forEach(field => delete newErrors[field]);
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    setFormErrors({});

    try {
      updateTenantRequestSchema.parse(formData);
      return true;
    } catch (err: unknown) {
      const errors = formatZodErrors(err);
      setFormErrors(errors);
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      console.warn('Validation failed: Please fix the errors in the form.');
      return;
    }

    const result = await updateTenant(tenantId, formData);
    if (result.success) {
      router.push(`/sa/tenants/${tenantId}`);
    }
  };

  const handleCancel = () => {
    router.push(`/sa/tenants/${tenantId}`);
  };

  const getPlanDetails = (planValue: string) => {
    return PLAN_OPTIONS.find(p => p.value === planValue);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton width="32px" height="32px" />
          <div>
            <Skeleton width="200px" height="32px" className="mb-2" />
            <Skeleton width="300px" height="20px" />
          </div>
        </div>

        <div className="max-w-2xl">
          <Skeleton width="100%" height="400px" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return <ErrorBanner error={{ code: 'SERVER', retryable: true, details: { message: loadError }, userMessage: { title: 'Error', message: loadError } }} onRetry={refetch} />;
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

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Error Banner for save errors */}
        {saveError && (
          <ErrorBanner error={{ code: 'SERVER', retryable: true, details: { message: saveError }, userMessage: { title: 'Error', message: saveError } }} onRetry={handleSave} />
        )}

        {/* Header */}
        <div>
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={handleCancel}
            className="mb-4"
          >
            Back to Tenant Details
          </Button>
          <h1 className="text-2xl font-bold text-[var(--app-fg)]">Edit Tenant</h1>
          <p className="text-[var(--muted-foreground)]">
            Update the tenant information and settings.
          </p>
        </div>

        {/* Current Status Info */}
        <div className="bg-[var(--muted)] rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Current Status:</span>
            <span className="font-medium text-[var(--app-fg)]">{tenant.status}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-[var(--muted-foreground)]">Tenant ID:</span>
            <code className="text-xs bg-[var(--card)] px-2 py-1 rounded">{tenant.id}</code>
          </div>
        </div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6"
        >
          <Form>
            <FormField>
              <Input
                label="Company Name"
                placeholder="Acme Corporation"
                value={formData.name || ''}
                onChange={(e) => updateFormData({ name: e.target.value })}
                error={formErrors.name}
                helpText="The display name for this tenant"
              />
            </FormField>

            <FormField>
              <Input
                label="Domain"
                placeholder="acme-corp"
                value={formData.domain || ''}
                onChange={(e) => updateFormData({ domain: e.target.value })}
                error={formErrors.domain}
                helpText="Used for tenant subdomain and identification"
              />
            </FormField>

            <FormField>
              <Select
                label="Subscription Plan"
                placeholder="Choose a plan..."
                value={formData.plan || ''}
                onValueChange={(value) => updateFormData({ plan: value as 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'ON_PREM' | 'BASIC' })}
                options={[...PLAN_OPTIONS]}
                error={formErrors.plan}
                helpText="The subscription plan for this tenant"
              />
            </FormField>

            {formData.plan && (
              <div className="bg-[var(--muted)] rounded-lg p-4">
                <h4 className="font-medium text-[var(--app-fg)] mb-1">
                  {getPlanDetails(formData.plan)?.label}
                </h4>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {getPlanDetails(formData.plan)?.description}
                </p>
              </div>
            )}

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={isSaving}
                icon={isSaving ? Loader2 : Save}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </FormActions>
          </Form>
        </motion.div>

        {/* Warning Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Notes
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Changes to the domain may affect tenant access and should be coordinated with users.</li>
                  <li>Plan changes may affect billing and available features.</li>
                  <li>Some changes may require tenant restart to take effect.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
