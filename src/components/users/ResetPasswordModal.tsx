'use client';

import React, { useState } from 'react';
import { AlertCircle, Copy, Eye, EyeOff, CheckCircle, Lock, Mail, ShieldAlert } from 'lucide-react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import type { ResetPasswordResponse } from '@/domain/users/schemas';
import { resetPasswordAction } from '@/lib/actions/user';
import { useToastMessages } from '@/components/ui/ToastProvider';

type ResetActionFn = (
  userId: string,
  request: { new_password?: string; force_change: boolean }
) => Promise<{ success: true; data: { temporary_password?: string } } | { success: false; error: string; userMessage?: string }>;

interface ResetPasswordModalProps {
  userId: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
  onSuccess?: (response: ResetPasswordResponse) => void;
  /** Custom reset action — defaults to the superadmin resetPasswordAction */
  resetAction?: ResetActionFn;
}

export default function ResetPasswordModal({
  userId,
  userName,
  userEmail,
  onClose,
  onSuccess,
  resetAction,
}: ResetPasswordModalProps) {
  const [step, setStep] = useState<'confirm' | 'method' | 'loading' | 'success'>('confirm');
  const [passwordMethod, setPasswordMethod] = useState<'auto' | 'custom'>('auto');
  const [customPassword, setCustomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forceChange, setForceChange] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<ResetPasswordResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const { success } = useToastMessages();

  const handleReset = async () => {
    if (passwordMethod === 'custom' && !customPassword) {
      setError('Please enter a password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build request object - only include new_password if custom password was chosen
      // to avoid Next.js Server Actions serializing undefined as "$undefined" string
      const request: { new_password?: string; force_change: boolean } = {
        force_change: forceChange,
      };
      if (passwordMethod === 'custom' && customPassword) {
        request.new_password = customPassword;
      }

      console.log('[ResetPasswordModal] userId:', userId);
      console.log('[ResetPasswordModal] passwordMethod:', passwordMethod);
      console.log('[ResetPasswordModal] Built request:', JSON.stringify(request));
      console.log('[ResetPasswordModal] request keys:', Object.keys(request));

      const actionFn = resetAction || resetPasswordAction;
      const result = await actionFn(userId, request);
      console.log('[ResetPasswordModal] Result:', result.success ? 'success' : result.error);

      if (result.success) {
        // Normalize response data from different action types
        const data = result.data as Record<string, unknown>;
        setSuccessData({
          user_id: (data.user_id as string) || '',
          temporary_password: (data.temporary_password as string) || '',
          must_change_password: (data.must_change_password as boolean) ?? true,
          message: data.message as string | undefined,
        });
        setStep('success');
        // Don't call onSuccess yet - wait for user to explicitly close the success screen
      } else {
        // Use user-friendly message if available, otherwise fall back to technical error
        const failResult = result as { error: string; userMessage?: string };
        setError(failResult.userMessage || failResult.error || 'Failed to reset password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (successData?.temporary_password) {
      try {
        await navigator.clipboard.writeText(successData.temporary_password);
        setCopied(true);
        success('Password Copied', 'Temporary password copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleCloseSuccess = () => {
    // Call onSuccess callback before closing (to trigger parent to reload users)
    if (successData) {
      onSuccess?.(successData);
    }
    // Then close the modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Lock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Reset Password</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {step === 'confirm' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Reset password for:</p>
                  <p>{userName}</p>
                  <p className="text-blue-600">{userEmail}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                This user will need to change their password on their next login if you enable force password change.
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="force-change"
                  checked={forceChange}
                  onChange={(e) => setForceChange(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="force-change" className="text-sm font-medium text-gray-700">
                  Force user to change password on next login
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('method')}
                  disabled={isLoading}
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 'method' && (
            <>
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">How would you like to set the password?</p>

                {/* Auto-generate option */}
                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="method"
                    value="auto"
                    checked={passwordMethod === 'auto'}
                    onChange={(e) => setPasswordMethod(e.target.value as 'auto' | 'custom')}
                    className="w-4 h-4 mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Auto-generate temporary password</p>
                    <p className="text-sm text-gray-500 mt-1">
                      A secure temporary password will be generated. Share it with the user securely.
                    </p>
                  </div>
                </label>

                {/* Custom password option */}
                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="method"
                    value="custom"
                    checked={passwordMethod === 'custom'}
                    onChange={(e) => setPasswordMethod(e.target.value as 'auto' | 'custom')}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Set custom password</p>
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                      Set a specific password (user should still change it after login).
                    </p>
                  </div>
                </label>

                {passwordMethod === 'custom' && (
                  <div className="ml-8 space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        placeholder="Enter password"
                        rightIcon={showPassword ? EyeOff : Eye}
                        onRightIconClick={() => setShowPassword(!showPassword)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Requirements: 8+ characters, uppercase, lowercase, number, special character
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setStep('confirm')} disabled={isLoading}>
                  Back
                </Button>
                <Button
                  onClick={handleReset}
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Reset Password
                </Button>
              </div>
            </>
          )}

          {step === 'success' && successData && (
            <>
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Successfully</h3>
                <p className="text-sm text-gray-600">
                  Password for <strong>{userName}</strong> ({userEmail})
                </p>
              </div>

              {/* Temporary Password Section */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-2">Temporary Password</p>
                  <p className="text-xs text-green-700 mb-3">Copy this password - it will not be shown again</p>
                </div>

                <div className="bg-white p-4 rounded border-2 border-green-300 space-y-2">
                  <code className="block font-mono text-lg font-bold text-gray-900 break-all tracking-wider">
                    {successData.temporary_password}
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
                      <strong>Share securely:</strong> Send the temporary password to {userName} through a secure channel (encrypted email, secure portal, or in-person)
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-200">
                        <span className="text-xs font-bold text-blue-700">2</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-800">
                      <strong>Inform the user:</strong> Remind them to use this password on their next login
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-200">
                        <span className="text-xs font-bold text-blue-700">3</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-800">
                      <strong>Password change required:</strong> They will be required to create a new password on first login
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Best Practices */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-900">Security reminder:</p>
                  <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Never share passwords via plain text email or unencrypted channels</li>
                    <li>Avoid sharing in chat applications or SMS if possible</li>
                    <li>Consider using your organization&apos;s secure password delivery method</li>
                  </ul>
                </div>
              </div>

              {/* Email Integration (Future) */}
              <Button
                disabled
                variant="outline"
                className="w-full opacity-60"
                icon={Mail}
                title="Email notifications feature coming soon"
              >
                Send via Email (Coming Soon)
              </Button>

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
