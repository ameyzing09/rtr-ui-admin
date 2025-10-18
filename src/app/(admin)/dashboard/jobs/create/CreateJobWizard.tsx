'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJobAction } from '@/lib/actions/job';
import { FormWizard, type WizardStep } from '@/components/shared/FormWizard';
import { JobBasicsStep } from './steps/JobBasicsStep';
import { JobDescriptionStep } from './steps/JobDescriptionStep';
import { JobVisibilityStep } from './steps/JobVisibilityStep';
import { JobCustomFieldsStep } from './steps/JobCustomFieldsStep';
import { createJobRequestSchema, type CreateJobRequest } from '@/domain/jobs/schemas';
import { toast } from '@/components/ui/ToastProvider';

/**
 * Create Job Wizard Component
 * B2: Multi-step form for creating a new job
 */
export function CreateJobWizard() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for all steps
  const [formData, setFormData] = useState<Partial<CreateJobRequest>>({
    // Step 1: Basics
    title: '',
    department: '',
    location: '',

    // Step 2: Description
    description: '',

    // Step 3: Visibility
    isPublic: true,
    publishAt: null,
    expireAt: null,
    externalApplyUrl: '',

    // Step 4: Custom Fields (EPIC E)
    extra: {},
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Update form data for a specific field
   */
  const updateFormData = (updates: Partial<CreateJobRequest>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Set error for a specific field
   */
  const setFieldError = (field: string, error: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  /**
   * Clear error for a specific field
   */
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  /**
   * Validate Step 1: Basics
   */
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Job title is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Validate Step 2: Description
   * (No required fields in this step)
   */
  const validateStep2 = (): boolean => {
    return true;
  };

  /**
   * Validate Step 3: Visibility
   */
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate expireAt > publishAt
    if (formData.publishAt && formData.expireAt) {
      if (formData.expireAt <= formData.publishAt) {
        errors.expireAt = 'Expiration date must be after publish date';
      }
    }

    // Validate externalApplyUrl format
    if (formData.externalApplyUrl && formData.externalApplyUrl.trim() !== '') {
      try {
        new URL(formData.externalApplyUrl);
      } catch {
        errors.externalApplyUrl = 'Must be a valid URL';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Validate Step 4: Custom Fields
   * (No validation needed for now)
   */
  const validateStep4 = (): boolean => {
    return true;
  };

  /**
   * Handle wizard completion - submit form
   */
  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // Final validation with Zod schema
      const validatedData = createJobRequestSchema.parse(formData);

      // Submit to server action
      const result = await createJobAction(validatedData);

      if (result.success) {
        // Show success toast
        toast({
          title: 'Job created successfully!',
          description: `${result.data.title} has been created.`,
          variant: 'success',
        });

        // Redirect to job detail page
        router.push(`/dashboard/jobs/${result.data.id}`);
      } else {
        // Handle server-side errors
        if (result.fieldErrors) {
          // Convert fieldErrors from Record<string, string[]> to Record<string, string>
          const convertedErrors: Record<string, string> = {};
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            convertedErrors[field] = Array.isArray(errors) ? errors.join(', ') : errors;
          });
          setFieldErrors(convertedErrors);
        }

        toast({
          title: 'Failed to create job',
          description: result.error,
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Form validation error:', error);

      toast({
        title: 'Validation error',
        description: 'Please check the form for errors',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle wizard cancellation
   */
  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push('/dashboard/jobs');
    }
  };

  // Define wizard steps
  const steps: WizardStep[] = [
    {
      id: 'basics',
      title: 'Basic Information',
      description: 'Job title, department, and location',
      content: (
        <JobBasicsStep
          formData={formData}
          updateFormData={updateFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
        />
      ),
      validate: validateStep1,
    },
    {
      id: 'description',
      title: 'Description & Requirements',
      description: 'Job details and attachments',
      content: (
        <JobDescriptionStep
          formData={formData}
          updateFormData={updateFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
        />
      ),
      validate: validateStep2,
    },
    {
      id: 'visibility',
      title: 'Visibility & Publishing',
      description: 'When and where to publish',
      content: (
        <JobVisibilityStep
          formData={formData}
          updateFormData={updateFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
        />
      ),
      validate: validateStep3,
    },
    {
      id: 'custom-fields',
      title: 'Custom Fields',
      description: 'Additional information (optional)',
      content: (
        <JobCustomFieldsStep
          formData={formData}
          updateFormData={updateFormData}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
        />
      ),
      validate: validateStep4,
    },
  ];

  return (
    <FormWizard
      steps={steps}
      onComplete={handleComplete}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      className="h-full"
    />
  );
}
