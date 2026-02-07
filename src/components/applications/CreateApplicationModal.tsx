'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Upload } from 'lucide-react';
import { createApplicationAction } from '@/lib/actions/application';
import { applicationStatusSchema, type CreateApplicationRequest } from '@/domain/applications/schemas';
import { toast } from '@/components/ui/ToastProvider';
import { FileUploadButton } from '@/components/shared/FileUploadButton';
import type { JobListItem } from '@/domain/jobs/schemas';

interface CreateApplicationModalProps {
  jobs: JobListItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedJobId?: string;
}

/**
 * Create Application Modal Component
 * C1: Create a new job application
 */
export function CreateApplicationModal({
  jobs,
  isOpen,
  onClose,
  onSuccess,
  preselectedJobId,
}: CreateApplicationModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateApplicationRequest>>({
    jobId: preselectedJobId || '',
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    resumeUrl: '',
    coverLetter: '',
    status: 'PENDING',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Update form field
   */
  const updateField = (field: keyof CreateApplicationRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.jobId) {
      errors.jobId = 'Job selection is required';
    }
    if (!formData.applicantName || formData.applicantName.trim() === '') {
      errors.applicantName = 'Applicant name is required';
    }
    if (!formData.applicantEmail || formData.applicantEmail.trim() === '') {
      errors.applicantEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.applicantEmail)) {
      errors.applicantEmail = 'Invalid email address';
    }
    if (!formData.applicantPhone || formData.applicantPhone.trim() === '') {
      errors.applicantPhone = 'Phone number is required';
    }
    // resumeUrl is optional - backend allows null resume_url
    if (!formData.status) {
      errors.status = 'Status is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createApplicationAction(formData as CreateApplicationRequest);

      if (result.success) {
        // Show success toast
        toast({
          title: 'Application created successfully',
          description: `Application from ${formData.applicantName} has been created.`,
          variant: 'success',
        });

        // Reset form
        setFormData({
          jobId: preselectedJobId || '',
          applicantName: '',
          applicantEmail: '',
          applicantPhone: '',
          resumeUrl: '',
          coverLetter: '',
          status: 'PENDING',
        });
        setFieldErrors({});

        // Close modal
        onClose();

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Default: refresh the page
          router.refresh();
        }
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
          title: 'Failed to create application',
          description: result.error,
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Create error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Create Application</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Job Selection */}
              <div>
                <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">
                  Job <span className="text-red-500">*</span>
                </label>
                <select
                  id="jobId"
                  value={formData.jobId}
                  onChange={(e) => updateField('jobId', e.target.value)}
                  disabled={!!preselectedJobId || isSubmitting}
                  className={`mt-1 block w-full rounded-lg border ${
                    fieldErrors.jobId ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  <option value="">Select a job...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} {job.department && `- ${job.department}`}
                    </option>
                  ))}
                </select>
                {fieldErrors.jobId && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.jobId}</p>
                )}
              </div>

              {/* Applicant Name */}
              <div>
                <label htmlFor="applicantName" className="block text-sm font-medium text-gray-700">
                  Applicant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="applicantName"
                  value={formData.applicantName}
                  onChange={(e) => updateField('applicantName', e.target.value)}
                  disabled={isSubmitting}
                  className={`mt-1 block w-full rounded-lg border ${
                    fieldErrors.applicantName ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="John Doe"
                />
                {fieldErrors.applicantName && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.applicantName}</p>
                )}
              </div>

              {/* Applicant Email */}
              <div>
                <label htmlFor="applicantEmail" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="applicantEmail"
                  value={formData.applicantEmail}
                  onChange={(e) => updateField('applicantEmail', e.target.value)}
                  disabled={isSubmitting}
                  className={`mt-1 block w-full rounded-lg border ${
                    fieldErrors.applicantEmail ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="john.doe@example.com"
                />
                {fieldErrors.applicantEmail && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.applicantEmail}</p>
                )}
              </div>

              {/* Applicant Phone */}
              <div>
                <label htmlFor="applicantPhone" className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="applicantPhone"
                  value={formData.applicantPhone}
                  onChange={(e) => updateField('applicantPhone', e.target.value)}
                  disabled={isSubmitting}
                  className={`mt-1 block w-full rounded-lg border ${
                    fieldErrors.applicantPhone ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="+1-555-0100"
                />
                {fieldErrors.applicantPhone && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.applicantPhone}</p>
                )}
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Resume (Optional)
                </label>
                <div className="mt-1">
                  <FileUploadButton
                    accept=".pdf,.doc,.docx"
                    onUploadComplete={(url) => updateField('resumeUrl', url)}
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {formData.resumeUrl ? 'Change Resume' : 'Upload Resume'}
                  </FileUploadButton>
                  {formData.resumeUrl && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Resume uploaded
                    </p>
                  )}
                  {fieldErrors.resumeUrl && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.resumeUrl}</p>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                  Cover Letter (Optional)
                </label>
                <textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={(e) => updateField('coverLetter', e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="I am excited to apply for this position..."
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  disabled={isSubmitting}
                  className={`mt-1 block w-full rounded-lg border ${
                    fieldErrors.status ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  {applicationStatusSchema.options.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {fieldErrors.status && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.status}</p>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Application'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
