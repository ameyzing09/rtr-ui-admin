'use client';

import React from 'react';
import type { PasswordStrength } from '@/domain/users/schemas';
import { PASSWORD_REQUIREMENTS } from '@/domain/users/schemas';

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  requirements: PasswordRequirements;
  showRequirements?: boolean;
}

export default function PasswordStrengthIndicator({
  strength,
  requirements,
  showRequirements = false,
}: PasswordStrengthIndicatorProps) {
  const getStrengthColor = (level: PasswordStrength) => {
    switch (level) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
    }
  };

  const getStrengthLabel = (level: PasswordStrength) => {
    switch (level) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
    }
  };

  const getStrengthTextColor = (level: PasswordStrength) => {
    switch (level) {
      case 'weak':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'strong':
        return 'text-green-600';
    }
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const totalRequirements = Object.keys(requirements).length;
  const progress = (metRequirements / totalRequirements) * 100;

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">Password Strength</label>
          <span className={`text-xs font-semibold ${getStrengthTextColor(strength)}`}>
            {getStrengthLabel(strength)}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getStrengthColor(strength)} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Requirements list */}
      {showRequirements && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-gray-600">Requirements:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <div className={`w-3 h-3 rounded-sm ${requirements.minLength ? 'bg-green-500' : 'bg-gray-300'}`} />
              Minimum {PASSWORD_REQUIREMENTS.minLength} characters
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <div className={`w-3 h-3 rounded-sm ${requirements.hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`} />
              Uppercase letter (A-Z)
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <div className={`w-3 h-3 rounded-sm ${requirements.hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`} />
              Lowercase letter (a-z)
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <div className={`w-3 h-3 rounded-sm ${requirements.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
              Number (0-9)
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <div className={`w-3 h-3 rounded-sm ${requirements.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`} />
              Special character (!@#$%^&*)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
