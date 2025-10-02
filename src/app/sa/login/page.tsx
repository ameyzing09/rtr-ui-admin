'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Form, { FormField, FormActions } from '@/components/ui/Form';
import { useToastMessages } from '@/components/ui/ToastProvider';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const { success, error } = useToastMessages();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Import auth client dynamically to avoid SSR issues
      const { AuthClient } = await import('@/lib/api/authClient');
      const authClient = new AuthClient();
      
      // Attempt real API login
      const session = await authClient.login({
        email: formData.email,
        password: formData.password,
        audience: 'platform' // Use platform audience for superadmin
      });
      
      // Store user info
      localStorage.setItem('user_role', session.user.role);
      localStorage.setItem('user_email', session.user.email);
      localStorage.setItem('user_name', session.user.name);
      
      success('Welcome back!', `Successfully signed in as ${session.user.role}`);
      router.push('/sa/tenants');
    } catch (loginError: unknown) {
      console.error('Login failed:', loginError);
      const errorMessage = loginError instanceof Error 
        ? loginError.message 
        : 'Please check your credentials and ensure the API server is running';
      error('Login failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-[var(--primary-foreground)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--app-fg)] mb-2">
              Superadmin Portal
            </h1>
            <p className="text-[var(--muted-foreground)]">
              Sign in to manage tenants and system settings
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            <FormField>
              <Input
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </FormField>

            <FormField>
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
              />
            </FormField>

            <FormActions>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={!formData.email || !formData.password}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </FormActions>
          </Form>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              Demo credentials: admin@example.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}