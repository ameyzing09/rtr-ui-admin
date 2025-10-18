'use client';

import type { CreateJobRequest } from '@/domain/jobs/schemas';
import { Card } from '@/components/ui/Card';

interface JobVisibilityStepProps {
  formData: Partial<CreateJobRequest>;
  updateFormData: (updates: Partial<CreateJobRequest>) => void;
  fieldErrors: Record<string, string>;
  clearFieldError: (field: string) => void;
}

/**
 * Step 3: Visibility & Publishing
 * - is_public (checkbox)
 * - publish_at (date picker)
 * - expire_at (date picker)
 * - external_apply_url (URL input)
 */
export function JobVisibilityStep({
  formData,
  updateFormData,
  fieldErrors,
  clearFieldError,
}: JobVisibilityStepProps) {
  const handlePublishDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? new Date(e.target.value) : null;
    updateFormData({ publish_at: value });
    clearFieldError('publish_at');
  };

  const handleExpireDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? new Date(e.target.value) : null;
    updateFormData({ expire_at: value });
    clearFieldError('expire_at');
  };

  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Is Public Toggle */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="is_public"
            checked={formData.is_public ?? true}
            onChange={(e) => {
              updateFormData({ is_public: e.target.checked });
              clearFieldError('is_public');
            }}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <label htmlFor="is_public" className="block text-sm font-medium text-gray-700">
              Make this job public
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Public jobs are visible to external candidates on your career page
            </p>
          </div>
        </div>

        {/* Publish Date */}
        <div>
          <label htmlFor="publish_at" className="block text-sm font-medium text-gray-700">
            Publish Date (Optional)
          </label>
          <input
            type="datetime-local"
            id="publish_at"
            value={formatDateForInput(formData.publish_at)}
            onChange={handlePublishDateChange}
            className={`mt-1 block w-full rounded-lg border ${
              fieldErrors.publish_at ? 'border-red-300' : 'border-gray-300'
            } px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {fieldErrors.publish_at && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.publish_at}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Schedule when this job should be published (leave empty to publish immediately)
          </p>
        </div>

        {/* Expiration Date */}
        <div>
          <label htmlFor="expire_at" className="block text-sm font-medium text-gray-700">
            Expiration Date (Optional)
          </label>
          <input
            type="datetime-local"
            id="expire_at"
            value={formatDateForInput(formData.expire_at)}
            onChange={handleExpireDateChange}
            className={`mt-1 block w-full rounded-lg border ${
              fieldErrors.expire_at ? 'border-red-300' : 'border-gray-300'
            } px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {fieldErrors.expire_at && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.expire_at}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Automatically close this job after this date (must be after publish date)
          </p>
        </div>

        {/* External Apply URL */}
        <div>
          <label htmlFor="external_apply_url" className="block text-sm font-medium text-gray-700">
            External Apply URL (Optional)
          </label>
          <input
            type="url"
            id="external_apply_url"
            value={formData.external_apply_url || ''}
            onChange={(e) => {
              updateFormData({ external_apply_url: e.target.value });
              clearFieldError('external_apply_url');
            }}
            placeholder="https://example.com/apply"
            className={`mt-1 block w-full rounded-lg border ${
              fieldErrors.external_apply_url ? 'border-red-300' : 'border-gray-300'
            } px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {fieldErrors.external_apply_url && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.external_apply_url}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Redirect applicants to an external application form (e.g., on your company website)
          </p>
        </div>
      </div>
    </Card>
  );
}
