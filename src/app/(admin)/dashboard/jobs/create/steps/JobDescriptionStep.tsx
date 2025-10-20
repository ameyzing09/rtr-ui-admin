'use client';

import type { CreateJobRequest } from '@/domain/jobs/schemas';
import Card from '@/components/ui/Card';
import { RichTextEditor } from '@/components/shared/RichTextEditor';

interface JobDescriptionStepProps {
  formData: Partial<CreateJobRequest>;
  updateFormData: (updates: Partial<CreateJobRequest>) => void;
  fieldErrors: Record<string, string>;
  clearFieldError: (field: string) => void;
}

/**
 * Step 2: Job Description
 * - Description (rich text)
 */
export function JobDescriptionStep({
  formData,
  updateFormData,
  fieldErrors,
  clearFieldError,
}: JobDescriptionStepProps) {

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Job Description
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Describe the role, responsibilities, and what makes this position exciting
        </p>

        <div className="mt-4">
          <RichTextEditor
            value={formData.description || ''}
            onChange={(value) => {
              updateFormData({ description: value });
              clearFieldError('description');
            }}
            placeholder="Enter the job description..."
            error={fieldErrors.description}
          />
        </div>
      </div>
    </Card>
  );
}
