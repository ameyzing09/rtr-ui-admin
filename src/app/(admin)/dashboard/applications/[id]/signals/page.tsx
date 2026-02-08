import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getApplicationSignalsAction, getApplicationActionsWithSignalsAction } from '@/lib/actions/signal';
import { getApplicationAction } from '@/lib/actions/application';
import { SignalsDashboardClient } from './SignalsDashboardClient';
import Skeleton from '@/components/ui/Skeleton';

interface SignalsDashboardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Signals | Application',
  description: 'View application signals and action conditions',
};

/**
 * Signals Dashboard Page (Server Component)
 * Shows all signals for an application and available action conditions
 */
export default async function SignalsDashboardPage({
  params,
}: SignalsDashboardPageProps) {
  const { id: applicationId } = await params;

  // Fetch data in parallel
  const [applicationResult, signalsResult, actionsResult] = await Promise.all([
    getApplicationAction(applicationId),
    getApplicationSignalsAction(applicationId),
    getApplicationActionsWithSignalsAction(applicationId),
  ]);

  // Handle application not found
  if (!applicationResult.success) {
    if (applicationResult.code === 'APPLICATION_NOT_FOUND') {
      notFound();
    }
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">
            Failed to load application
          </h3>
          <p className="mt-1 text-sm text-red-700">{applicationResult.error}</p>
        </div>
      </div>
    );
  }

  // Handle signals fetch error
  if (!signalsResult.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">
            Failed to load signals
          </h3>
          <p className="mt-1 text-sm text-red-700">{signalsResult.error}</p>
        </div>
      </div>
    );
  }

  // Actions result is optional - we can still show signals without it
  const actions = actionsResult.success ? actionsResult.data.actions : [];

  return (
    <Suspense fallback={<SignalsDashboardSkeleton />}>
      <SignalsDashboardClient
        application={applicationResult.data}
        signals={signalsResult.data.signals}
        actions={actions}
      />
    </Suspense>
  );
}

function SignalsDashboardSkeleton() {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
