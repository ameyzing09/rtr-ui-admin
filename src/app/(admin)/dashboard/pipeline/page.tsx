import { Suspense } from 'react';
import { listPipelinesAction } from '@/lib/actions/pipeline';
import { PipelineListClient } from './PipelineListClient';
import Skeleton from '@/components/ui/Skeleton';

export const metadata = {
  title: 'Interview Pipelines | Dashboard',
  description: 'Manage interview pipelines and stages',
};

/**
 * Pipeline List Page (Server Component)
 * GET /pipeline
 *
 * Features:
 * - Search by name
 * - Shows pipeline name, stage count, and last updated time
 * - Create and Edit actions (permission-based)
 * - Empty state + shimmer loaders
 */
export default async function PipelinesPage() {
  // Initial data fetch (server-side)
  const result = await listPipelinesAction();

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Failed to load pipelines</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">Interview Pipelines</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage interview pipelines and stages for your organization
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline List Client Component */}
      <Suspense fallback={<PipelineListSkeleton />}>
        <PipelineListClient initialData={result.data} />
      </Suspense>
    </div>
  );
}

/**
 * Loading skeleton for pipeline list
 */
function PipelineListSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
