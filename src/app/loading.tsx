import Spinner from '@/components/ui/Spinner';

/**
 * Root Loading State (Fallback)
 * Shows for any route without a specific loading.tsx
 * Provides a generic loading indicator for the entire app
 */
export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-blue-600" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
