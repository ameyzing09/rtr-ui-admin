'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  CheckCircle,
  Building,
  User,
  Package,
  FileCheck,
  Calendar
} from 'lucide-react';
import { ZodError } from 'zod';

import { Wizard, WizardStep } from '@/components/wizard';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/ui/Select';
import Form, { FormField, FormActions } from '@/components/ui/Form';
import { useToastMessages } from '@/components/ui/ToastProvider';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useCreateTenant } from '@/hooks/useTenantActions';

import {
  PLAN_OPTIONS,
  companyStepSchema,
  ownerStepSchema,
  planStepSchema,
  subscriptionStepSchema,
  type TenantFormData,
  type CreateTenantResponse
} from '@/domain/tenants/schemas';

const STEPS = [
  {
    id: 'company',
    title: 'Company Information',
    description: 'Enter the basic details for the new tenant',
    icon: Building,
  },
  {
    id: 'owner',
    title: 'Admin User',
    description: 'Set up the tenant administrator account',
    icon: User,
  },
  {
    id: 'plan',
    title: 'Select Plan',
    description: 'Choose the appropriate subscription plan',
    icon: Package,
  },
  {
    id: 'subscription',
    title: 'Subscription Details',
    description: 'Configure subscription settings',
    icon: Calendar,
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Confirm the details and create the tenant',
    icon: FileCheck,
  },
];

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

export default function CreateTenantClient() {
  const router = useRouter();
  const { success, error: showToastError } = useToastMessages();

  const [currentStep, setCurrentStep] = useState('company');
  const [createdTenant, setCreatedTenant] = useState<CreateTenantResponse | null>(null);

  // Use Server Actions (BFF) - no HTTP hop, direct server-side call
  const { createTenant, loading: isSubmitting, error: apiError } = useCreateTenant();

  const [formData, setFormData] = useState<Partial<TenantFormData>>({
    name: '',
    domain: '',
    admin_name: '',
    admin_email: '',
    plan: undefined,
    start_immediately: true,
    trial_days: 0,
    notes: '',
  });

  const [stepErrors, setStepErrors] = useState<Record<string, Record<string, string>>>({});

  const updateFormData = (updates: Partial<TenantFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (stepId: string): boolean => {
    setStepErrors(prev => ({ ...prev, [stepId]: {} }));

    try {
      switch (stepId) {
        case 'company':
          companyStepSchema.parse({
            name: formData.name,
            domain: formData.domain,
          });
          break;
        case 'owner':
          ownerStepSchema.parse({
            admin_name: formData.admin_name,
            admin_email: formData.admin_email,
          });
          break;
        case 'plan':
          planStepSchema.parse({
            plan: formData.plan,
          });
          break;
        case 'subscription':
          subscriptionStepSchema.parse({
            start_immediately: formData.start_immediately,
            trial_days: formData.trial_days,
            notes: formData.notes,
          });
          break;
      }
      return true;
    } catch (err: unknown) {
      const errors = formatZodErrors(err);
      setStepErrors(prev => ({ ...prev, [stepId]: errors }));
      return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    const allSteps = ['company', 'owner', 'plan', 'subscription'];
    const validations = allSteps.map(stepId => validateStep(stepId));
    if (!validations.every(Boolean)) {
      showToastError('Validation failed', 'Please fix the errors in the form before submitting.');
      return;
    }

    try {
      const result = await createTenant(formData as TenantFormData);

      if (result.success) {
        setCreatedTenant(result.data);
        success('Tenant created successfully!', 'The tenant has been created and is being provisioned.');
      } else {
        showToastError('Failed to create tenant', result.error);
      }
    } catch (err) {
      console.error('Failed to create tenant:', err);
      showToastError('Failed to create tenant', err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied!', 'Text copied to clipboard');
  };

  const getPlanDetails = (planValue: string) => {
    return PLAN_OPTIONS.find(p => p.value === planValue);
  };

  // Success screen
  if (createdTenant) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-[var(--app-fg)] mb-2">
              Tenant Created Successfully!
            </h1>
            <p className="text-[var(--muted-foreground)] mb-8">
              The tenant has been created and is now being provisioned.
            </p>

            <div className="bg-[var(--muted)] rounded-lg p-6 space-y-4 text-left mb-8">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[var(--app-fg)]">Tenant ID:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-[var(--card)] px-2 py-1 rounded text-sm">
                    {createdTenant.tenant.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Copy}
                    onClick={() => copyToClipboard(createdTenant.tenant.id)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-[var(--app-fg)]">Company:</span>
                <span>{createdTenant.tenant.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-[var(--app-fg)]">Domain:</span>
                <span>{createdTenant.tenant.domain}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-[var(--app-fg)]">Status:</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {createdTenant.status}
                </span>
              </div>

              {createdTenant.temp_password && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--app-fg)]">Temp Password:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-[var(--card)] px-2 py-1 rounded text-sm">
                      {createdTenant.temp_password}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                      onClick={() => copyToClipboard(createdTenant.temp_password)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/sa/tenants')}
              >
                Back to Tenants
              </Button>
              <Button
                onClick={() => router.push(`/sa/tenants/${createdTenant.tenant.id}`)}
              >
                View Tenant Details
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => router.push('/sa/tenants')}
            className="mb-4"
          >
            Back to Tenants
          </Button>
          <h1 className="text-2xl font-bold text-[var(--app-fg)]">Create New Tenant</h1>
          <p className="text-[var(--muted-foreground)]">
            Set up a new tenant with company details, administrator, and subscription plan.
          </p>
        </div>

        {/* Wizard */}
        {apiError && <ErrorBanner error={{ code: 'SERVER', retryable: true, details: { message: apiError }, userMessage: { title: 'Error', message: apiError } }} onRetry={handleSubmit} />}
        <Wizard steps={STEPS} currentStepId={currentStep}>
          <AnimatePresence mode="wait">
            {/* Company Step */}
            {currentStep === 'company' && (
              <WizardStep key="company" stepId="company" title="Company Information">
                <Form>
                  <FormField>
                    <Input
                      label="Company Name"
                      placeholder="Acme Corporation"
                      value={formData.name || ''}
                      onChange={(e) => updateFormData({ name: e.target.value })}
                      error={stepErrors.company?.name}
                      required
                    />
                  </FormField>

                  <FormField>
                    <Input
                      label="Domain"
                      placeholder="acme-corp"
                      value={formData.domain || ''}
                      onChange={(e) => updateFormData({ domain: e.target.value })}
                      error={stepErrors.company?.domain}
                      helpText="This will be used to create the tenant's subdomain"
                      required
                    />
                  </FormField>

                  <FormActions>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </FormActions>
                </Form>
              </WizardStep>
            )}

            {/* Owner Step */}
            {currentStep === 'owner' && (
              <WizardStep key="owner" stepId="owner" title="Administrator Details">
                <Form>
                  <FormField>
                    <Input
                      label="Admin Name"
                      placeholder="John Doe"
                      value={formData.admin_name || ''}
                      onChange={(e) => updateFormData({ admin_name: e.target.value })}
                      error={stepErrors.owner?.admin_name}
                      required
                    />
                  </FormField>

                  <FormField>
                    <Input
                      label="Admin Email"
                      type="email"
                      placeholder="john@acme-corp.com"
                      value={formData.admin_email || ''}
                      onChange={(e) => updateFormData({ admin_email: e.target.value })}
                      error={stepErrors.owner?.admin_email}
                      helpText="This will be the login email for the tenant administrator"
                      required
                    />
                  </FormField>

                  <FormActions>
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </FormActions>
                </Form>
              </WizardStep>
            )}

            {/* Plan Step */}
            {currentStep === 'plan' && (
              <WizardStep key="plan" stepId="plan" title="Select Subscription Plan">
                <Form>
                  <FormField>
                    <Select
                      label="Subscription Plan"
                      placeholder="Choose a plan..."
                      value={formData.plan || ''}
                      onValueChange={(value) => updateFormData({ plan: value as 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'ON_PREM' | 'BASIC' })}
                      options={[...PLAN_OPTIONS]}
                      error={stepErrors.plan?.plan}
                    />
                  </FormField>

                  {formData.plan && (
                    <div className="bg-[var(--muted)] rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-[var(--app-fg)] mb-1">
                        {getPlanDetails(formData.plan)?.label}
                      </h4>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {getPlanDetails(formData.plan)?.description}
                      </p>
                    </div>
                  )}

                  <FormActions>
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </FormActions>
                </Form>
              </WizardStep>
            )}

            {/* Subscription Step */}
            {currentStep === 'subscription' && (
              <WizardStep key="subscription" stepId="subscription" title="Subscription Configuration">
                <Form>
                  <FormField>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.start_immediately || false}
                          onChange={(e) => updateFormData({ start_immediately: e.target.checked })}
                          className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                        />
                        <div>
                          <span className="font-medium text-[var(--app-fg)]">Start Immediately</span>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            Activate the subscription as soon as the tenant is created
                          </p>
                        </div>
                      </label>
                    </div>
                  </FormField>

                  <FormField>
                    <Input
                      label="Trial Period (Days)"
                      type="number"
                      min="0"
                      max="365"
                      placeholder="0"
                      value={formData.trial_days?.toString() || '0'}
                      onChange={(e) => updateFormData({ trial_days: parseInt(e.target.value) || 0 })}
                      error={stepErrors.subscription?.trial_days}
                      helpText="Number of days for free trial period (0 for no trial)"
                    />
                  </FormField>

                  <FormField>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--app-fg)]">
                        Notes
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--app-fg)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                        rows={3}
                        placeholder="Additional notes about this tenant setup..."
                        value={formData.notes || ''}
                        onChange={(e) => updateFormData({ notes: e.target.value })}
                        maxLength={500}
                      />
                      {stepErrors.subscription?.notes && (
                        <p className="text-sm text-red-600">{stepErrors.subscription.notes}</p>
                      )}
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {(formData.notes || '').length}/500 characters
                      </p>
                    </div>
                  </FormField>

                  <FormActions>
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Review
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </FormActions>
                </Form>
              </WizardStep>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <WizardStep key="review" stepId="review" title="Review & Create">
                <div className="space-y-6">
                  {/* Company Details */}
                  <div className="bg-[var(--muted)] rounded-lg p-4">
                    <h4 className="font-medium text-[var(--app-fg)] mb-3">Company Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Company Name:</span>
                        <span className="text-[var(--app-fg)]">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Domain:</span>
                        <span className="text-[var(--app-fg)]">{formData.domain}</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Details */}
                  <div className="bg-[var(--muted)] rounded-lg p-4">
                    <h4 className="font-medium text-[var(--app-fg)] mb-3">Administrator</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Name:</span>
                        <span className="text-[var(--app-fg)]">{formData.admin_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Email:</span>
                        <span className="text-[var(--app-fg)]">{formData.admin_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan & Subscription */}
                  <div className="bg-[var(--muted)] rounded-lg p-4">
                    <h4 className="font-medium text-[var(--app-fg)] mb-3">Subscription</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Plan:</span>
                        <span className="text-[var(--app-fg)]">
                          {getPlanDetails(formData.plan!)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Start Immediately:</span>
                        <span className="text-[var(--app-fg)]">
                          {formData.start_immediately ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Trial Days:</span>
                        <span className="text-[var(--app-fg)]">{formData.trial_days || 0}</span>
                      </div>
                      {formData.notes && (
                        <div className="pt-2 border-t border-[var(--border)]">
                          <span className="text-[var(--muted-foreground)]">Notes:</span>
                          <p className="text-[var(--app-fg)] mt-1">{formData.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <FormActions>
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating Tenant...' : 'Create Tenant'}
                    </Button>
                  </FormActions>
                </div>
              </WizardStep>
            )}
          </AnimatePresence>
        </Wizard>
      </div>
    </div>
  );
}
