'use client';

import type { CreateJobRequest } from '@/domain/jobs/schemas';
import { Card } from '@/components/ui/Card';

interface JobBasicsStepProps {
  formData: Partial<CreateJobRequest>;
  updateFormData: (updates: Partial<CreateJobRequest>) => void;
  fieldErrors: Record<string, string>;
  clearFieldError: (field: string) => void;
}

/**
 * Step 1: Job Basics
 * - Title (required)
 * - Department
 * - Location
 * - Number of openings (client-side only)
 */
export function JobBasicsStep({
  formData,
  updateFormData,
  fieldErrors,
  clearFieldError,
}: JobBasicsStepProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Title (Required) */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title || ''}
            onChange={(e) => {
              updateFormData({ title: e.target.value });
              clearFieldError('title');
            }}
            placeholder="e.g. Senior Software Engineer"
            className={`mt-1 block w-full rounded-lg border ${
              fieldErrors.title ? 'border-red-300' : 'border-gray-300'
            } px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This will be the main title shown to candidates
          </p>
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <input
            type="text"
            id="department"
            value={formData.department || ''}
            onChange={(e) => {
              updateFormData({ department: e.target.value });
              clearFieldError('department');
            }}
            placeholder="e.g. Engineering"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {fieldErrors.department && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.department}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={formData.location || ''}
            onChange={(e) => {
              updateFormData({ location: e.target.value });
              clearFieldError('location');
            }}
            placeholder="e.g. San Francisco, CA (Remote)"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {fieldErrors.location && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>
          )}
        </div>

        {/* Number of Openings (Client-side only) */}
        <div>
          <label htmlFor="openings" className="block text-sm font-medium text-gray-700">
            Number of Openings
          </label>
          <input
            type="number"
            id="openings"
            min="1"
            value={formData.openings || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : undefined;
              updateFormData({ openings: value });
              clearFieldError('openings');
            }}
            placeholder="1"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {fieldErrors.openings && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.openings}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            How many positions are available for this role
          </p>
        </div>
      </div>
    </Card>
  );
}
