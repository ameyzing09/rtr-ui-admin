'use client';

import React, { useState } from 'react';
import { Lock, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { changePasswordAction } from '@/lib/actions/user';
import { validatePasswordStrength, PASSWORD_REQUIREMENTS } from '@/domain/users/schemas';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function ChangePasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { strength, requirements } = validatePasswordStrength(newPassword) as unknown as { strength: 'weak' | 'medium' | 'strong'; requirements: PasswordRequirements };

  const isFormValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    Object.values(requirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Please fill in all required fields and meet all password requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStep('loading');
    setError(null);

    try {
      const result = await changePasswordAction({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (result.success) {
        setStep('success');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.replace('/dashboard');
        }, 2000);
      } else {
        setStep('form');
        setError(result.error || 'Failed to change password');
      }
    } catch (err) {
      setStep('form');
      setError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Changed Successfully</h2>
        <p className="text-gray-600 mb-6">Your password has been updated. Redirecting to dashboard...</p>
        <div className="inline-block">
          <div className="inline-flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      {/* Current Password */}
      <div>
        <Input
          label="Current Password"
          type={showCurrentPassword ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter your current password"
          rightIcon={showCurrentPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowCurrentPassword(!showCurrentPassword)}
          required
          disabled={step === 'loading'}
          leftIcon={Lock}
        />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">New Password</span>
        </div>
      </div>

      {/* New Password */}
      <div>
        <Input
          label="New Password"
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          rightIcon={showNewPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowNewPassword(!showNewPassword)}
          required
          disabled={step === 'loading'}
          leftIcon={Lock}
        />
      </div>

      {/* Password Strength Indicator */}
      {newPassword && (
        <PasswordStrengthIndicator strength={strength} requirements={requirements} />
      )}

      {/* Confirm Password */}
      <div>
        <Input
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          rightIcon={showConfirmPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          required
          disabled={step === 'loading'}
          leftIcon={Lock}
        />
        {newPassword && confirmPassword && newPassword === confirmPassword && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Passwords match
          </p>
        )}
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Passwords do not match
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-900 mb-3">Password Requirements:</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-xs text-blue-700">
            <div className={`w-2 h-2 rounded-full ${requirements.minLength ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            At least {PASSWORD_REQUIREMENTS.minLength} characters
          </li>
          <li className="flex items-center gap-2 text-xs text-blue-700">
            <div className={`w-2 h-2 rounded-full ${requirements.hasUppercase ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            At least one uppercase letter (A-Z)
          </li>
          <li className="flex items-center gap-2 text-xs text-blue-700">
            <div className={`w-2 h-2 rounded-full ${requirements.hasLowercase ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            At least one lowercase letter (a-z)
          </li>
          <li className="flex items-center gap-2 text-xs text-blue-700">
            <div className={`w-2 h-2 rounded-full ${requirements.hasNumber ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            At least one number (0-9)
          </li>
          <li className="flex items-center gap-2 text-xs text-blue-700">
            <div className={`w-2 h-2 rounded-full ${requirements.hasSpecialChar ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            At least one special character (!@#$%^&*)
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={step === 'loading'}
        disabled={step === 'loading' || !isFormValid}
      >
        {step === 'loading' ? 'Changing Password...' : 'Change Password'}
      </Button>
    </form>
  );
}
