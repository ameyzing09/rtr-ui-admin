'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateJobAction } from '@/lib/actions/job';
import { FormWizard, type WizardStep } from '@/components/shared/FormWizard';
import { JobBasicsStep } from '../../create/steps/JobBasicsStep';
import { JobDescriptionStep } from '../../create/steps/JobDescriptionStep';
import { JobVisibilityStep } from '../../create/steps/JobVisibilityStep';
import { JobCustomFieldsStep } from '../../create/steps/JobCustomFieldsStep';
import { updateJobRequestSchema, type Job, type UpdateJobRequest } from '@/domain/jobs/schemas';
import { toast } from '@/components/ui/ToastProvider';

interface EditJobWizardProps {
  job: Job;
}

/**
 * Edit Job Wizard Component
 * B4: Reuses create wizard with pre-filled data
 */
export function EditJobWizard({ job }: EditJobWizardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data with existing job data
  const [formData, setFormData] = useState<Partial<UpdateJobRequest>>({
    // Step 1: Basics
    title: job.title,
    department: job.department || '',
    location: job.location || '',

    // Step 2: Description
    description: job.description || '',

    // Step 3: Visibility
    isPublic: job.isPublic,
    publishAt: job.publishAt || null,
    expireAt: job.expireAt || null,
    externalApplyUrl: job.externalApplyUrl || '',

    // Step 4: Custom Fields (EPIC E)
    extra: job.extra || {},
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Track which fields have been modified
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  /**
   * Update form data and track modified fields
   */
  const updateFormData = (updates: Partial<UpdateJobRequest>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    // Track modified fields
    Object.keys(updates).forEach((field) => {
      setModifiedFields((prev) => new Set(prev).add(field));
    });
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
      // Only send modified fields (partial update)
      const updates: Partial<UpdateJobRequest> = {};
      modifiedFields.forEach((field) => {
        const value = formData[field as keyof UpdateJobRequest];
        if (value !== undefined) {
          (updates as Record<string, unknown>)[field] = value;
        }
      });

      // If no fields modified, just redirect back
      if (Object.keys(updates).length === 0) {
        toast({
          title: 'No changes detected',
          description: 'No fields were modified.',
          variant: 'info',
        });
        router.push(`/dashboard/jobs/${job.id}`);
        return;
      }

      // Validate with Zod schema
      const validatedData = updateJobRequestSchema.parse(updates);

      // Submit to server action
      const result = await updateJobAction(job.id, validatedData);
      console.log('Update job result:', result);
      if (result.success) {
        // Show success toast
        toast({
          title: 'Job updated successfully!',
          description: `${result.data.title} has been updated.`,
          variant: 'success',
        });

        // Redirect to job detail page
        router.push(`/dashboard/jobs/${job.id}`);
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
          title: 'Failed to update job',
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
    if (modifiedFields.size > 0) {
      if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
        router.push(`/dashboard/jobs/${job.id}`);
      }
    } else {
      router.push(`/dashboard/jobs/${job.id}`);
    }
  };

  // Define wizard steps (same as create, but with pre-filled data)
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
