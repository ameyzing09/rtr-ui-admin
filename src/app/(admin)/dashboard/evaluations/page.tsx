import { Suspense } from 'react';
import { getMyPendingEvaluationsAction } from '@/lib/actions/evaluation';
import { EvaluationsListClient } from './EvaluationsListClient';
import { SkeletonTable } from '@/components/ui/Skeleton';

export const metadata = {
  title: 'My Evaluations | Dashboard',
  description: 'View and complete pending evaluations',
};

/**
 * Evaluations List Page (Server Component)
 * Shows list of pending evaluations assigned to the current user
 */
export default async function EvaluationsPage() {
  const result = await getMyPendingEvaluationsAction();

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">
            Failed to load evaluations
          </h3>
          <p className="mt-1 text-sm text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Evaluations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete your pending interview evaluations
          </p>
        </div>
      </div>

      {/* Evaluations List */}
      <Suspense fallback={<EvaluationsListSkeleton />}>
        <EvaluationsListClient
          evaluations={result.data.evaluations}
          total={result.data.total}
        />
      </Suspense>
    </div>
  );
}

function EvaluationsListSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SkeletonTable rows={5} columns={4} />
        </div>
      </div>
    </div>
  );
}
