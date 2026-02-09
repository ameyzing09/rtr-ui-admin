'use client';

import { AlertTriangle } from 'lucide-react';

export default function ApplicationStatusError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500" />
      <h2 className="mt-4 text-xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-gray-600">
        We were unable to load your application status. Please try again later.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
