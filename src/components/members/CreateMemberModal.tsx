'use client';

import React, { useState } from 'react';
import { AlertCircle, Copy, CheckCircle, UserPlus, ShieldAlert } from 'lucide-react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { createMemberAction } from '@/lib/actions/members';
import { useToastMessages } from '@/components/ui/ToastProvider';

interface CreateMemberModalProps {
  onClose: () => void;
  onMemberCreated: () => void;
}

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin', description: 'Full access to all tenant features' },
  { value: 'HR', label: 'HR', description: 'Manage jobs, applications, pipeline, and members' },
  { value: 'INTERVIEWER', label: 'Interviewer', description: 'Manage interviews and view applications' },
];

export default function CreateMemberModal({
  onClose,
  onMemberCreated,
}: CreateMemberModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('HR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const { success } = useToastMessages();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createMemberAction({ name: name.trim(), email: email.trim(), role });

      if (result.success) {
        setTemporaryPassword(result.data.temporary_password);
        setStep('success');
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (temporaryPassword) {
      try {
        await navigator.clipboard.writeText(temporaryPassword);
        setCopied(true);
        success('Password Copied', 'Temporary password copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleCloseSuccess = () => {
    onMemberCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                error={fieldErrors.name?.[0]}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                error={fieldErrors.email?.[0]}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="space-y-3">
                  {ROLE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        role === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={role === option.value}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-4 h-4 mt-0.5"
                        disabled={isLoading}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                  Create Member
                </Button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <>
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Member Created Successfully
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>{name}</strong> ({email}) has been added as{' '}
                  <strong>{role}</strong>
                </p>
              </div>

              {/* Temporary Password Section */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    Temporary Password
                  </p>
                  <p className="text-xs text-green-700 mb-3">
                    Copy this password - it will not be shown again
                  </p>
                </div>

                <div className="bg-white p-4 rounded border-2 border-green-300 space-y-2">
                  <code className="block font-mono text-lg font-bold text-gray-900 break-all tracking-wider">
                    {temporaryPassword}
                  </code>
                </div>

                <Button
                  onClick={copyToClipboard}
                  className="w-full"
                  icon={copied ? CheckCircle : Copy}
                  variant={copied ? 'outline' : 'primary'}
                >
                  {copied ? 'Password Copied to Clipboard' : 'Copy Password to Clipboard'}
                </Button>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-blue-900">What to do next:</h4>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-200">
                        <span className="text-xs font-bold text-blue-700">1</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-800">
                      <strong>Share securely:</strong> Send the temporary password to {name} through a secure channel
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-200">
                        <span className="text-xs font-bold text-blue-700">2</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-800">
                      <strong>First login:</strong> They will use this password to sign in and must change it immediately
                    </p>
                  </div>
                </div>
              </div>

              {/* Security reminder */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Security reminder:</p>
                  <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside mt-1">
                    <li>Never share passwords via plain text email or unencrypted channels</li>
                    <li>Consider using your organization&apos;s secure password delivery method</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={handleCloseSuccess}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
