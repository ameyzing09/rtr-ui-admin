import { Lock } from 'lucide-react';
import ChangePasswordForm from './ChangePasswordForm';
import { siteConfig } from '@/config/site';

/**
 * Change Password Page
 *
 * This page is shown to users when they have the mustChangePassword flag set.
 * Users MUST change their password before they can access the application.
 *
 * This page is intentionally simple and focused on the password change task.
 */
export const metadata = {
  title: 'Change Password',
  description: 'Change your password',
};

export default function ChangePasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-[55%] top-[15%] h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[10%] bottom-[10%] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-[8%] bottom-[12%] h-64 w-64 rounded-full bg-slate-900/80 blur-2xl" />
      </div>

      {/* Content */}
      <section className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/40">
              <Lock className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Change Your Password</h1>
          <p className="text-slate-400 text-sm">
            Your administrator has requested that you change your password before continuing.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 sm:p-10 shadow-[0_20px_120px_-40px_rgba(15,23,42,0.7)] backdrop-blur-xl">
          <ChangePasswordForm />

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
            <p>
              Your password will help keep your {siteConfig.name} account secure.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
