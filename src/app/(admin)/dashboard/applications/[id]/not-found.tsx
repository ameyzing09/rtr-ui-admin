import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function ApplicationNotFound() {
  return (
    <div data-testid="app-detail-not-found" className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <FileQuestion className="h-10 w-10 text-gray-400" />
        </div>

        <h1 data-testid="app-detail-not-found-title" className="mt-6 text-3xl font-bold text-gray-900">
          Application Not Found
        </h1>

        <p className="mt-3 text-base text-gray-600">
          The application you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            data-testid="app-detail-not-found-view-all"
            href="/dashboard/applications"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View All Applications
          </Link>

          <Link
            data-testid="app-detail-not-found-back-dashboard"
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
