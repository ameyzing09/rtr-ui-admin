'use client';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ErrorMapper } from '@/lib/errors/mapper';
import type { AppError } from '@/lib/errors/types';

export default function TenantsErrorBoundary({ error }: { error: unknown }) {
  const mapped: AppError = ErrorMapper.mapError(error);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--app-bg)] p-6">
      <div className="w-full max-w-2xl space-y-4">
        {/* Error Banner */}
        <ErrorBanner error={mapped} />

        {/* Reload Button */}
        <div className="flex justify-center">
          <button
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
