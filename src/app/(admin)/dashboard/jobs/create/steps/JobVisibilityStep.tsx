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
 * - isPublic (checkbox)
 * - publishAt (date picker)
 * - expireAt (date picker)
 * - externalApplyUrl (URL input)
 */
export function JobVisibilityStep({
  formData,
  updateFormData,
  fieldErrors,
  clearFieldError,
}: JobVisibilityStepProps) {
  const handlePublishDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? new Date(e.target.value) : null;
    updateFormData({ publishAt: value });
    clearFieldError('publishAt');
  };

  const handleExpireDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? new Date(e.target.value) : null;
    updateFormData({ expireAt: value });
    clearFieldError('expireAt');
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
            id="isPublic"
            checked={formData.isPublic ?? true}
            onChange={(e) => {
              updateFormData({ isPublic: e.target.checked });
              clearFieldError('isPublic');
            }}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700">
              Make this job public
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Public jobs are visible to external candidates on your career page
            </p>
          </div>
        </div>

        {/* Publish Date */}
        <div>
          <label htmlFor="publishAt" className="block text-sm font-medium text-gray-700">
            Publish Date (Optional)
          </label>
          <input
            type="datetime-local"
            id="publishAt"
            value={formatDateForInput(formData.publishAt)}
            onChange={handlePublishDateChange}
            className={`mt-1 block w-full rounded-lg border ${
              fieldErrors.publishAt ? 'border-red-300' : 'border-gray-300'
            } px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {fieldErrors.publishAt && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.publishAt}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Schedule when this job should be published (leave empty to publish immediately)
          </p>
        </div>

        {/* Expiration Date */}
        <div>
          <label htmlFor="expireAt" className="block text-sm font-medium text-gray-700">
            Expiration Date (Optional)
          </label>
          <input
            type="datetime-local"
            id="expireAt"
            value={formatDateForInput(formData.expireAt)}
            onChange={handleExpireDateChange}
            className={`mt-1 block w-full rounded-lg border ${
              fieldErrors.expireAt ? 'border-red-300' : 'border-gray-300'
            } px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {fieldErrors.expireAt && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.expireAt}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Automatically close this job after this date (must be after publish date)
          </p>
        </div>

        {/* External Apply URL */}
        <div>
          <label htmlFor="externalApplyUrl" className="block text-sm font-medium text-gray-700">
            External Apply URL (Optional)
          </label>
          <input
            type="url"
            id="externalApplyUrl"
            value={formData.externalApplyUrl || ''}
            onChange={(e) => {
              updateFormData({ externalApplyUrl: e.target.value });
              clearFieldError('externalApplyUrl');
            }}
            placeholder="https://example.com/apply"
            className={`mt-1 block w-full rounded-lg border ${
              fieldErrors.externalApplyUrl ? 'border-red-300' : 'border-gray-300'
            } px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {fieldErrors.externalApplyUrl && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.externalApplyUrl}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Redirect applicants to an external application form (e.g., on your company website)
          </p>
        </div>
      </div>
    </Card>
  );
}
