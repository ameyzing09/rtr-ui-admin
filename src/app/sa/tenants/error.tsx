'use client';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ErrorMapper } from '@/lib/errors/mapper';
import type { AppError } from '@/lib/errors/types';

export default function TenantsErrorBoundary({ error }: { error: unknown }) {
  const mapped: AppError = ErrorMapper.mapError(error);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorBanner error={mapped} />
      <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );
}
