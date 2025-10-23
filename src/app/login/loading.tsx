import Spinner from '@/components/ui/Spinner';

/**
 * Login Page Loading State
 * Shows while login page is compiling or loading
 * Matches the login page's dark theme aesthetic
 */
export default function LoginLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      {/* Background decorations matching login page */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-[55%] top-[15%] h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[10%] bottom-[10%] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-[8%] bottom-[12%] h-64 w-64 rounded-full bg-slate-900/80 blur-2xl" />
      </div>

      {/* Loading spinner */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-cyan-400" />
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </main>
  );
}
