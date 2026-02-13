import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getEvaluationDetailsAction } from '@/lib/actions/evaluation';
import { getSession } from '@/lib/rbac/guard.server';
import { EvaluationDetailClient } from './EvaluationDetailClient';
import Skeleton from '@/components/ui/Skeleton';

interface EvaluationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Evaluation | Dashboard',
  description: 'Complete interview evaluation',
};

/**
 * Evaluation Detail Page (Server Component)
 * Shows the evaluation form for a specific evaluation
 */
export default async function EvaluationDetailPage({
  params,
}: EvaluationDetailPageProps) {
  const { id } = await params;
  const [result, session] = await Promise.all([
    getEvaluationDetailsAction(id),
    getSession(),
  ]);

  if (!result.success) {
    if (result.code === 'EVALUATION_NOT_FOUND') {
      notFound();
    }
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">
            Failed to load evaluation
          </h3>
          <p className="mt-1 text-sm text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  if (!result.data) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
          <h3 className="text-sm font-semibold text-gray-900">
            No evaluation data available yet
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            This evaluation has no participant data. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<EvaluationDetailSkeleton />}>
      <EvaluationDetailClient evaluation={result.data} currentUserId={session?.userId} />
    </Suspense>
  );
}

function EvaluationDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
