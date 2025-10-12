'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { useAuth } from '@/components/auth';

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout, user } = useAuth();

  const reason = searchParams.get('reason') || 'unknown';
  const required = searchParams.get('required');

  const getMessage = () => {
    switch (reason) {
      case 'role':
        return {
          title: 'Access Denied: Insufficient Role',
          description: 'Your current role does not have access to this resource. This area is restricted to administrators only.',
        };
      case 'permission':
        return {
          title: 'Access Denied: Missing Permission',
          description: required
            ? `You need the "${required}" permission to access this resource.`
            : 'You do not have the required permission to access this resource.',
        };
      case 'permissions':
        return {
          title: 'Access Denied: Missing Permissions',
          description: required
            ? `You need the following permissions: ${required.split(',').join(', ')}`
            : 'You do not have the required permissions to access this resource.',
        };
      default:
        return {
          title: 'Access Denied',
          description: 'You do not have permission to access this resource.',
        };
    }
  };

  const { title, description } = getMessage();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="max-w-md w-full">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[var(--app-fg)] mb-2">
              {title}
            </h1>
            <p className="text-[var(--muted-foreground)]">
              {description}
            </p>

            {user && (
              <div className="mt-4 p-3 bg-[var(--muted)] rounded-md">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Logged in as: <span className="font-medium text-[var(--app-fg)]">{user.email}</span>
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Role: <span className="font-medium text-[var(--app-fg)]">{user.role}</span>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              icon={ArrowLeft}
              onClick={() => router.back()}
            >
              Go Back
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              fullWidth
              icon={LogOut}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-center text-[var(--muted-foreground)]">
              If you believe you should have access to this resource,
              please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
