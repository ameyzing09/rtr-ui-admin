import Skeleton, { SkeletonTable } from '@/components/ui/Skeleton';

/**
 * Applications Page Loading State
 * Shows while applications page is compiling or loading data
 */
export default function ApplicationsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header Skeleton */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width="12rem" height="2rem" />
            <Skeleton width="20rem" height="1rem" />
          </div>
          <Skeleton width="10rem" height="2.5rem" />
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="flex-1 p-6">
        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4">
          <Skeleton width="20rem" height="2.5rem" />
          <Skeleton width="8rem" height="2.5rem" />
          <Skeleton width="8rem" height="2.5rem" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SkeletonTable rows={8} columns={6} />
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-4 flex items-center justify-between">
          <Skeleton width="10rem" height="1rem" />
          <div className="flex gap-2">
            <Skeleton width="2.5rem" height="2.5rem" />
            <Skeleton width="2.5rem" height="2.5rem" />
            <Skeleton width="2.5rem" height="2.5rem" />
          </div>
        </div>
      </div>
    </div>
  );
}
