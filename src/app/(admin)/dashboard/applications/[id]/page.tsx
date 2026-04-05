import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { getApplicationDetailAction } from '@/lib/actions/application-detail';
import { ApplicationDetailClient } from './ApplicationDetailClient';
import Skeleton from '@/components/ui/Skeleton';

interface ApplicationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Application Details | Dashboard',
  description: 'View full application details',
};

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id: applicationId } = await params;
  const result = await getApplicationDetailAction(applicationId);

  if (!result.success) {
    if (result.code === 'APPLICATION_DETAIL_NOT_FOUND') {
      notFound();
    }

    if (result.code === 'APPLICATION_DETAIL_FORBIDDEN') {
      return (
        <div className="p-6">
          <div data-testid="app-detail-error-forbidden" className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Access Denied
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                You do not have permission to view this application.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div data-testid="app-detail-error-generic" className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">
            Failed to load application
          </h3>
          <p className="mt-1 text-sm text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<ApplicationDetailSkeleton />}>
      <ApplicationDetailClient data={result.data} />
    </Suspense>
  );
}

function ApplicationDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <div>
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
