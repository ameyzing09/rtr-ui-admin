import Link from "next/link";
import { MaintenanceView } from "../components/maintenance-view";
import { siteConfig } from "../config/site";

export default function Home() {
  if (siteConfig.maintenanceMode) {
    return <MaintenanceView supportEmail={siteConfig.supportEmail} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-[50%] top-[10%] h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[5%] bottom-[15%] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-[10%] bottom-[5%] h-60 w-60 rounded-full bg-slate-800" />
      </div>

      <section className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-8 rounded-3xl border border-white/10 bg-slate-900/70 p-12 text-center shadow-[0_20px_120px_-40px_rgba(15,23,42,0.7)] backdrop-blur-xl">
        <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
          {siteConfig.name}
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold sm:text-5xl">Dashboard is live</h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Welcome back. You are viewing the standard Recrutr UI. Deployments can switch into maintenance mode instantly by toggling the environment flag.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
          >
            Enter Dashboard
          </Link>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-200/60 hover:text-cyan-200"
          >
            Contact Support
          </a>
        </div>
      </section>
    </main>
  );
}
