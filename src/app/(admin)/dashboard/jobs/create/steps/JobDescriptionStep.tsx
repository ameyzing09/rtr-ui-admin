'use client';

import type { CreateJobRequest } from '@/domain/jobs/schemas';
import { Card } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { FileUploadButton } from '@/components/shared/FileUploadButton';

interface JobDescriptionStepProps {
  formData: Partial<CreateJobRequest>;
  updateFormData: (updates: Partial<CreateJobRequest>) => void;
  fieldErrors: Record<string, string>;
  clearFieldError: (field: string) => void;
}

/**
 * Step 2: Job Description & Requirements
 * - Description (rich text)
 * - Requirements (rich text)
 * - Attachments (file upload)
 */
export function JobDescriptionStep({
  formData,
  updateFormData,
  fieldErrors,
  clearFieldError,
}: JobDescriptionStepProps) {
  const handleFileUpload = (fileUrl: string) => {
    const currentAttachments = formData.attachments || [];
    updateFormData({ attachments: [...currentAttachments, fileUrl] });
  };

  const handleFileRemove = (fileUrl: string) => {
    const currentAttachments = formData.attachments || [];
    updateFormData({
      attachments: currentAttachments.filter((url) => url !== fileUrl),
    });
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <Card className="p-6">
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
      </Card>

      {/* Requirements */}
      <Card className="p-6">
        <label className="block text-sm font-medium text-gray-700">
          Requirements & Qualifications
        </label>
        <p className="mt-1 text-xs text-gray-500">
          List the skills, experience, and qualifications needed for this role
        </p>

        <div className="mt-4">
          <RichTextEditor
            value={formData.requirements || ''}
            onChange={(value) => {
              updateFormData({ requirements: value });
              clearFieldError('requirements');
            }}
            placeholder="Enter the requirements..."
            error={fieldErrors.requirements}
          />
        </div>
      </Card>

      {/* Attachments */}
      <Card className="p-6">
        <label className="block text-sm font-medium text-gray-700">
          Attachments
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Upload additional documents like job descriptions, benefits info, etc.
        </p>

        <div className="mt-4">
          <FileUploadButton
            onUpload={handleFileUpload}
            onRemove={handleFileRemove}
            uploadedFiles={formData.attachments || []}
            maxFiles={5}
            acceptedTypes={['.pdf', '.doc', '.docx']}
          />
        </div>
      </Card>
    </div>
  );
}
