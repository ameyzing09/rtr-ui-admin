import Skeleton, { SkeletonCard } from '@/components/ui/Skeleton';

/**
 * Job Detail Page Loading State
 * Shows while job detail page is compiling or loading data
 */
export default function JobDetailLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mb-4">
          <Skeleton width="10rem" height="1rem" />
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton width="40%" height="2rem" />
              <Skeleton width="5rem" height="1.5rem" />
              <Skeleton width="5rem" height="1.5rem" />
            </div>
            <Skeleton width="60%" height="1rem" />
          </div>
          <div className="flex gap-2">
            <Skeleton width="5rem" height="2.5rem" />
            <Skeleton width="5rem" height="2.5rem" />
          </div>
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                <Skeleton width="60%" height="1rem" className="mb-2" />
                <Skeleton width="40%" height="1.5rem" />
              </div>
            ))}
          </div>

          {/* Job Details Card */}
          <SkeletonCard />

          {/* Requirements Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <Skeleton width="30%" height="1.25rem" className="mb-4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} width="90%" height="1rem" />
              ))}
            </div>
          </div>

          {/* Additional Info Card */}
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
