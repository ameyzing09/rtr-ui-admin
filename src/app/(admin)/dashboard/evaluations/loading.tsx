import { SkeletonTable } from '@/components/ui/Skeleton';

export default function EvaluationsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header Skeleton */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-64 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <SkeletonTable rows={5} columns={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
