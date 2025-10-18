'use client';

import type { CreateJobRequest } from '@/domain/jobs/schemas';
import { Card } from '@/components/ui/Card';
import { CustomFieldsEditor } from '@/components/jobs/CustomFieldsEditor';

interface JobCustomFieldsStepProps {
  formData: Partial<CreateJobRequest>;
  updateFormData: (updates: Partial<CreateJobRequest>) => void;
  fieldErrors: Record<string, string>;
  clearFieldError: (field: string) => void;
}

/**
 * Step 4: Custom Fields (EPIC E)
 * - Key-value pair editor for extra field
 * - Server-side validation with field-level errors
 * - Supports string, number, and boolean types
 */
export function JobCustomFieldsStep({
  formData,
  updateFormData,
  fieldErrors,
  clearFieldError,
}: JobCustomFieldsStepProps) {
  /**
   * Handle custom fields change
   */
  const handleExtraChange = (newExtra: Record<string, unknown>) => {
    updateFormData({ extra: newExtra });

    // Clear field errors for extra fields
    Object.keys(fieldErrors).forEach((key) => {
      if (key.startsWith('extra_') || key === 'extra') {
        clearFieldError(key);
      }
    });
  };

  return (
    <Card className="p-6">
      <CustomFieldsEditor
        value={formData.extra || {}}
        onChange={handleExtraChange}
        errors={fieldErrors}
      />
    </Card>
  );
}
