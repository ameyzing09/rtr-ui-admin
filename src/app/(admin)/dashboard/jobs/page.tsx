import { Suspense } from 'react';
import { listJobsAction } from '@/lib/actions/job';
import { JobListClient } from './JobListClient';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata = {
  title: 'Job Postings | Dashboard',
  description: 'Manage job postings and openings',
};

/**
 * Job List Page (Server Component)
 * B1: List Jobs - GET /job
 *
 * Features:
 * - Search by title
 * - Filter by department, location
 * - Sort by created_at desc (default)
 * - Shows only current tenant's jobs
 * - Empty state + shimmer loaders
 */
export default async function JobsPage() {
  // Initial data fetch (server-side)
  const result = await listJobsAction({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 50,
  });

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Failed to load jobs</h3>
          <p className="mt-1 text-sm text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage job openings and track applications
            </p>
          </div>
        </div>
      </div>

      {/* Job List Client Component */}
      <Suspense fallback={<JobListSkeleton />}>
        <JobListClient initialData={result.data} />
      </Suspense>
    </div>
  );
}

/**
 * Loading skeleton for job list
 */
function JobListSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
