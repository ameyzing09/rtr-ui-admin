import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

/**
 * 404 Not Found Page for Job Detail
 * B3: Renders when job is not found
 */
export default function JobNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <FileQuestion className="h-10 w-10 text-gray-400" />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">Job Not Found</h1>

        <p className="mt-3 text-base text-gray-600">
          The job you're looking for doesn't exist or has been removed.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View All Jobs
          </Link>

          <Link
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
