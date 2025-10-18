'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, Upload } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CaptchaWidget } from './CaptchaWidget';
import { FileUploadButton } from '@/components/shared/FileUploadButton';
import type { ApplicationFormData } from '@/domain/public/schemas';
import { transformApplicationFormToApi } from '@/domain/public/schemas';

interface PublicApplicationFormProps {
  jobId: string;
  jobTitle: string;
}

/**
 * D3: Public Application Form
 * Handles public application submission with CAPTCHA
 */
export function PublicApplicationForm({ jobId, jobTitle }: PublicApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ApplicationFormData>>({
    jobId,
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    resumeUrl: '',
    coverLetter: '',
    captchaToken: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Check if CAPTCHA is enabled
  const captchaEnabled = !!process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;

  /**
   * Update form field
   */
  const updateField = (field: keyof ApplicationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Clear general error
    if (error) setError(null);
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.applicantName || formData.applicantName.trim() === '') {
      errors.applicantName = 'Name is required';
    }
    if (!formData.applicantEmail || formData.applicantEmail.trim() === '') {
      errors.applicantEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.applicantEmail)) {
      errors.applicantEmail = 'Invalid email address';
    }
    if (captchaEnabled && (!formData.captchaToken || formData.captchaToken.trim() === '')) {
      errors.captchaToken = 'Please complete the CAPTCHA verification';
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
    setError(null);

    try {
      // Transform camelCase to snake_case
      const apiPayload = transformApplicationFormToApi(formData as ApplicationFormData);

      // Submit to our API route handler
      const response = await fetch('/api/public/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 429) {
          setError('Too many applications submitted. Please try again later.');
        } else if (response.status === 400) {
          // Handle validation errors
          if (Array.isArray(result.message)) {
            setError(result.message.join(', '));
          } else {
            setError(result.message || 'Please check your form and try again');
          }
        } else {
          setError(result.message || 'Failed to submit application. Please try again.');
        }
        return;
      }

      // Success!
      setSubmitted(true);
    } catch (err) {
      console.error('Application submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
        <h3 className="mt-4 text-xl font-semibold text-gray-900">
          Application Submitted!
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Thank you for applying to {jobTitle}. We've received your application and will review it shortly.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => router.push('/careers')}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Jobs
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                jobId,
                applicantName: '',
                applicantEmail: '',
                applicantPhone: '',
                resumeUrl: '',
                coverLetter: '',
                captchaToken: '',
              });
            }}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Submit Another
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h3 className="text-xl font-semibold text-gray-900">Apply for this Position</h3>
      <p className="mt-2 text-sm text-gray-600">
        Fill out the form below to submit your application
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label htmlFor="applicantName" className="block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
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

        {/* Email */}
        <div>
          <label htmlFor="applicantEmail" className="block text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
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

        {/* Phone */}
        <div>
          <label htmlFor="applicantPhone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="applicantPhone"
            value={formData.applicantPhone}
            onChange={(e) => updateField('applicantPhone', e.target.value)}
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="+1-555-0100"
          />
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Resume
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
          </div>
        </div>

        {/* Cover Letter */}
        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
            Cover Letter
          </label>
          <textarea
            id="coverLetter"
            value={formData.coverLetter}
            onChange={(e) => updateField('coverLetter', e.target.value)}
            disabled={isSubmitting}
            rows={6}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Tell us why you're a great fit for this position..."
          />
        </div>

        {/* CAPTCHA */}
        {captchaEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification <span className="text-red-500">*</span>
            </label>
            <CaptchaWidget
              onVerify={(token) => updateField('captchaToken', token)}
              onError={() => setError('CAPTCHA verification failed. Please try again.')}
              onExpire={() => updateField('captchaToken', '')}
            />
            {fieldErrors.captchaToken && (
              <p className="mt-2 text-sm text-red-600">{fieldErrors.captchaToken}</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </Card>
  );
}
