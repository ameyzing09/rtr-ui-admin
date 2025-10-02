'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Copy, CheckCircle, Building, User, Package, FileCheck } from 'lucide-react';

import { Wizard, WizardStep } from '@/components/wizard';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/ui/Select';
import Form, { FormField, FormActions } from '@/components/ui/Form';
import { useToastMessages } from '@/components/ui/ToastProvider';
import { FeatureFlags } from '@/config/featureFlags';

import { createTenantAction } from '@/lib/actions/tenant';
import { 
  PLAN_OPTIONS,
  companyStepSchema,
  ownerStepSchema,
  planStepSchema,
  type TenantFormData,
  type CreateTenantResponse
} from '@/lib/schemas/tenant';

const STEPS = [
  {
    id: 'company',
    title: 'Company Details',
    description: 'Basic information',
    icon: Building,
  },
  {
    id: 'owner',
    title: 'Admin User',
    description: 'Owner details',
    icon: User,
  },
  {
    id: 'plan',
    title: 'Select Plan',
    description: 'Choose subscription',
    icon: Package,
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Confirm details',
    icon: FileCheck,
  },
];

export default function CreateTenantPage() {
  const router = useRouter();
  const { success, error } = useToastMessages();
  
  const [currentStep, setCurrentStep] = useState('company');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTenant, setCreatedTenant] = useState<CreateTenantResponse | null>(null);
  
  const [formData, setFormData] = useState<Partial<TenantFormData>>({
    name: '',
    domain: '',
    admin_name: '',
    admin_email: '',
    plan: undefined,
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
      }
      return true;
    } catch (err: unknown) {
      const errors: Record<string, string> = {};
      if (err && typeof err === 'object' && 'errors' in err && Array.isArray((err as { errors: unknown[] }).errors)) {
        (err as { errors: { path: string[]; message: string }[] }).errors.forEach((error) => {
          errors[error.path[0]] = error.message;
        });
      }
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
    if (!validateStep('plan')) return;

    setIsSubmitting(true);
    try {
      const result = await createTenantAction(formData as TenantFormData);
      
      if (result.success) {
        setCreatedTenant(result.data);
        success('Tenant created successfully!', 'The tenant has been created and is being provisioned.');
      } else {
        error('Failed to create tenant', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while creating the tenant.';
      error('Failed to create tenant', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied!', 'Text copied to clipboard');
  };

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
                <span className="font-medium text-[var(--app-fg)]">Admin User ID:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-[var(--card)] px-2 py-1 rounded text-sm">
                    {createdTenant.admin_user_id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Copy}
                    onClick={() => copyToClipboard(createdTenant.admin_user_id)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-[var(--app-fg)]">Temporary Password:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-[var(--card)] px-2 py-1 rounded text-sm font-mono">
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
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/sa/tenants')}
              >
                View All Tenants
              </Button>
              {FeatureFlags.isTenantOnboardingQueueEnabled() && (
                <Button
                  variant="primary"
                  onClick={() => router.push('/sa/tenants/onboarding')}
                >
                  Monitor Provisioning
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--app-fg)] mb-2">
          Create New Tenant
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Set up a new tenant with company details, admin user, and subscription plan.
        </p>
      </div>

      <Wizard steps={STEPS} currentStepId={currentStep}>
        <AnimatePresence mode="wait">
          {currentStep === 'company' && (
            <WizardStep
              key="company"
              stepId="company"
              title="Company Information"
              description="Enter the basic details about the company or organization."
            >
              <Form>
                <FormField>
                  <Input
                    label="Company Name"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder="Acme Corporation"
                    error={stepErrors.company?.name}
                    required
                  />
                </FormField>

                <FormField>
                  <Input
                    label="Domain"
                    value={formData.domain || ''}
                    onChange={(e) => updateFormData({ domain: e.target.value })}
                    placeholder="acme"
                    helpText="This will be used for tenant identification and routing"
                    error={stepErrors.company?.domain}
                    required
                  />
                </FormField>
              </Form>
            </WizardStep>
          )}

          {currentStep === 'owner' && (
            <WizardStep
              key="owner"
              stepId="owner"
              title="Admin User Details"
              description="Create the primary administrator account for this tenant."
            >
              <Form>
                <FormField>
                  <Input
                    label="Admin Name"
                    value={formData.admin_name || ''}
                    onChange={(e) => updateFormData({ admin_name: e.target.value })}
                    placeholder="John Doe"
                    error={stepErrors.owner?.admin_name}
                    required
                  />
                </FormField>

                <FormField>
                  <Input
                    type="email"
                    label="Admin Email"
                    value={formData.admin_email || ''}
                    onChange={(e) => updateFormData({ admin_email: e.target.value })}
                    placeholder="john.doe@acme.com"
                    helpText="This will be the login email for the tenant administrator"
                    error={stepErrors.owner?.admin_email}
                    required
                  />
                </FormField>
              </Form>
            </WizardStep>
          )}

          {currentStep === 'plan' && (
            <WizardStep
              key="plan"
              stepId="plan"
              title="Choose Subscription Plan"
              description="Select the appropriate plan for this tenant's needs."
            >
              <Form>
                <FormField>
                  <Select
                    label="Subscription Plan"
                    value={formData.plan || ''}
                    onValueChange={(value: string | number) => updateFormData({ plan: value as TenantFormData['plan'] })}
                    options={PLAN_OPTIONS.map(option => ({ value: option.value, label: option.label, disabled: false }))}
                    placeholder="Select a plan..."
                    error={stepErrors.plan?.plan}
                  />
                </FormField>
              </Form>
            </WizardStep>
          )}

          {currentStep === 'review' && (
            <WizardStep
              key="review"
              stepId="review"
              title="Review & Confirm"
              description="Please review the information before creating the tenant."
            >
              <div className="space-y-6">
                <div className="bg-[var(--muted)] rounded-lg p-6">
                  <h3 className="font-semibold text-[var(--app-fg)] mb-4">Company Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Company Name</p>
                      <p className="font-medium text-[var(--app-fg)]">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Domain</p>
                      <p className="font-medium text-[var(--app-fg)]">{formData.domain}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--muted)] rounded-lg p-6">
                  <h3 className="font-semibold text-[var(--app-fg)] mb-4">Admin User</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Name</p>
                      <p className="font-medium text-[var(--app-fg)]">{formData.admin_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Email</p>
                      <p className="font-medium text-[var(--app-fg)]">{formData.admin_email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--muted)] rounded-lg p-6">
                  <h3 className="font-semibold text-[var(--app-fg)] mb-4">Subscription Plan</h3>
                  <div>
                    <p className="font-medium text-[var(--app-fg)]">
                      {PLAN_OPTIONS.find(p => p.value === formData.plan)?.label}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {PLAN_OPTIONS.find(p => p.value === formData.plan)?.description}
                    </p>
                  </div>
                </div>
              </div>
            </WizardStep>
          )}
        </AnimatePresence>

        <FormActions className="mt-8 pt-6 border-t border-[var(--border)]">
          {currentStep !== 'company' && (
            <Button
              type="button"
              variant="outline"
              icon={ArrowLeft}
              iconPosition="left"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              Previous
            </Button>
          )}
          
          <div className="flex-1" />
          
          {currentStep !== 'review' ? (
            <Button
              type="button"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Tenant...' : 'Create Tenant'}
            </Button>
          )}
        </FormActions>
      </Wizard>
    </div>
  );
}