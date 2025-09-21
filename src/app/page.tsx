export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-[-25%] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/30 blur-3xl" />
        <div className="absolute right-[-10%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-[8%] bottom-[-18%] h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <section className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10 rounded-3xl border border-white/10 bg-slate-900/70 p-10 text-center shadow-[0_20px_120px_-40px_rgba(15,23,42,0.7)] backdrop-blur-xl">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-cyan-400/50 bg-slate-900/80">
          <svg viewBox="0 0 64 64" className="maintenance-gear maintenance-gear--primary">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M32 6l5.2 3.8 6-1.2 1.8 5.9 5 3.4-1.3 6.1 3.8 5.1-3.8 5.1 1.3 6.1-5 3.4-1.8 5.9-6-1.2L32 58l-5.2-3.8-6 1.2-1.8-5.9-5-3.4 1.3-6.1-3.8-5.1 3.8-5.1-1.3-6.1 5-3.4 1.8-5.9 6 1.2L32 6zm0 18a8 8 0 1 1 0 16 8 8 0 0 1 0-16z"
            />
          </svg>
          <svg viewBox="0 0 64 64" className="maintenance-gear maintenance-gear--secondary">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M32 10l4 2.9 4.6-0.9 1.4 4.4 3.8 2.6-1 4.6 2.9 4-2.9 4 1 4.6-3.8 2.6-1.4 4.4-4.6-0.9L32 54l-4-2.9-4.6 0.9-1.4-4.4-3.8-2.6 1-4.6-2.9-4 2.9-4-1-4.6 3.8-2.6 1.4-4.4 4.6 0.9L32 10zm0 15a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"
            />
          </svg>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
            Scheduled Maintenance
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">We&apos;re tuning things up</h1>
          <p className="text-sm text-slate-300 sm:text-base">
            The RTR Admin dashboard is currently offline while we apply a few improvements. Please check back soon or reach out if you need assistance right away.
          </p>
        </div>

        <div className="w-full space-y-4 text-left">
          <div className="maintenance-tape rounded-xl">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-yellow-50">
              <span className="text-sm font-semibold tracking-wide sm:text-base">Maintenance window in progress</span>
              <span className="text-xs uppercase tracking-[0.25em] text-yellow-200/80 sm:text-[0.7rem]">Sit tight</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-sm text-slate-300 sm:text-base">
            <div className="flex items-start gap-3">
              <span className="maintenance-pulse mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" aria-hidden />
              <div>
                <p className="font-medium text-slate-100">Status</p>
                <p>The admin panel will be back online as soon as the upgrade completes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-400/80" aria-hidden />
              <div>
                <p className="font-medium text-slate-100">Need support?</p>
                <p>
                  Reach the team at
                  <a className="ml-1 text-cyan-300 transition hover:text-cyan-200" href="mailto:contact@recrutr.in">
                    contact@recrutr.in
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

