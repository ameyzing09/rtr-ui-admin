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
    openings: undefined, // Client-side only, not stored

    // Step 2: Description
    description: job.description || '',
    requirements: job.requirements || '',
    attachments: job.attachments || [],

    // Step 3: Visibility
    is_public: job.is_public,
    publish_at: job.publish_at || null,
    expire_at: job.expire_at || null,
    external_apply_url: job.external_apply_url || '',

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
   */
  const validateStep2 = (): boolean => {
    return true;
  };

  /**
   * Validate Step 3: Visibility
   */
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate expire_at > publish_at
    if (formData.publish_at && formData.expire_at) {
      if (formData.expire_at <= formData.publish_at) {
        errors.expire_at = 'Expiration date must be after publish date';
      }
    }

    // Validate external_apply_url format
    if (formData.external_apply_url && formData.external_apply_url.trim() !== '') {
      try {
        new URL(formData.external_apply_url);
      } catch {
        errors.external_apply_url = 'Must be a valid URL';
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
        updates[field as keyof UpdateJobRequest] = formData[field as keyof UpdateJobRequest];
      });

      // If no fields modified, just redirect back
      if (Object.keys(updates).length === 0) {
        toast({
          title: 'No changes detected',
          description: 'No fields were modified.',
          variant: 'default',
        });
        router.push(`/dashboard/jobs/${job.id}`);
        return;
      }

      // Validate with Zod schema
      const validatedData = updateJobRequestSchema.parse(updates);

      // Submit to server action
      const result = await updateJobAction(job.id, validatedData);

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
          setFieldErrors(result.fieldErrors);
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
