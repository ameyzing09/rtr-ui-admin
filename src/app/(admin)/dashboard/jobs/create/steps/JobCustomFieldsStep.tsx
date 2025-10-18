'use client';

import type { CreateJobRequest } from '@/domain/jobs/schemas';
import { Card } from '@/components/ui/Card';
import { Info } from 'lucide-react';

interface JobCustomFieldsStepProps {
  formData: Partial<CreateJobRequest>;
  updateFormData: (updates: Partial<CreateJobRequest>) => void;
  fieldErrors: Record<string, string>;
  clearFieldError: (field: string) => void;
}

/**
 * Step 4: Custom Fields (EPIC E Placeholder)
 * - Dynamic fields based on tenant schema
 * - For now, just a placeholder with info message
 */
export function JobCustomFieldsStep({
  formData,
  updateFormData,
  fieldErrors,
  clearFieldError,
}: JobCustomFieldsStepProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Custom Fields Coming Soon</h3>
          <p className="mt-1 text-sm text-blue-700">
            This section will allow you to add custom fields specific to your organization's
            job posting requirements. Custom fields will be configured in EPIC E and driven
            by your tenant's schema.
          </p>
          <p className="mt-2 text-sm text-blue-700">
            For now, you can proceed to create the job with the standard fields.
          </p>
        </div>
      </div>

      {/* Placeholder: Example of what custom fields might look like */}
      <div className="mt-6 space-y-4 opacity-50">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Example: Salary Range
          </label>
          <input
            type="text"
            disabled
            placeholder="e.g. $100,000 - $150,000"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Custom fields will be dynamically generated based on your configuration
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Example: Employment Type
          </label>
          <select
            disabled
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm cursor-not-allowed"
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
