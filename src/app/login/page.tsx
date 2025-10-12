'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import type { LoginAudience } from '@/lib/auth/types';
import { useAuth } from '@/components/auth';
import { siteConfig } from '@/config/site';

const loginModes: { id: LoginAudience; title: string; description: string }[] = [
  {
    id: 'tenant',
    title: 'Tenant access',
    description: 'Admins, HR, interviewers, candidates',
  },
  {
    id: 'platform',
    title: 'Platform super admin',
    description: 'RTR control plane access for platform operators',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const [audience, setAudience] = React.useState<LoginAudience>('tenant');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setFormError(null);
    setSubmitting(true);

    try {
      await login({ email, password, rememberMe, audience });
      // All users redirect to /dashboard, which shows role-appropriate content
      router.replace('/dashboard');
    } catch (cause) {
      if (cause instanceof Error && cause.message) {
        setFormError(cause.message);
      } else if (error) {
        setFormError(error);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const feedback = formError || (!submitting && error ? error : null);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-[55%] top-[15%] h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[10%] bottom-[10%] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-[8%] bottom-[12%] h-64 w-64 rounded-full bg-slate-900/80 blur-2xl" />
      </div>

      <section className="relative z-10 w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between text-sm text-slate-400">
            <Link href="/" className="flex items-center gap-2 transition hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" />
            Back to landing
            </Link>
          <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cyan-200/90">
            {siteConfig.name}
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-10 shadow-[0_20px_120px_-40px_rgba(15,23,42,0.7)] backdrop-blur-xl">
          <div className="mb-8 space-y-3 text-center">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Welcome back</h1>
            <p className="text-sm text-slate-300">
              Sign in to access the {siteConfig.name} control plane.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {loginModes.map((mode) => {
              const isActive = audience === mode.id;
              const buttonClasses = isActive
                ? 'flex-col items-start gap-1 text-left transition'
                : 'flex-col items-start gap-1 text-left transition bg-[var(--card)] text-slate-200 hover:text-slate-100';
              return (
                <Button
                  key={mode.id}
                  type="button"
                  variant={isActive ? 'primary' : 'outline'}
                  size="md"
                  fullWidth
                  aria-pressed={isActive}
                  className={buttonClasses}
                  onClick={() => setAudience(mode.id)}
                >
                  <span className="text-sm font-semibold leading-tight">{mode.title}</span>
                  <span className="text-xs opacity-80">{mode.description}</span>
                </Button>
              );
            })}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Work email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              leftIcon={Mail}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              required
              autoComplete="current-password"
              leftIcon={Lock}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                />
                Remember me
              </label>
              <Link href="#" className="text-sm text-cyan-200 transition hover:text-cyan-100">
                Forgot password?
              </Link>
            </div>

            {feedback && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {feedback}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting || (isLoading && !isAuthenticated)}
              fullWidth
              disabled={submitting || (isLoading && !isAuthenticated)}
              className="uppercase tracking-[0.2em]"
            >
              Sign in
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
