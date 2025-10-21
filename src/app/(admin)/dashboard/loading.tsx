import Skeleton, { SkeletonCard } from '@/components/ui/Skeleton';

/**
 * Dashboard Loading State
 * Shows while dashboard page is compiling or loading data
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton width="40%" height="2rem" />
        <Skeleton width="60%" height="1rem" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <Skeleton width="60%" height="1rem" />
              <Skeleton variant="circular" width={40} height={40} />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton width="40%" height="2rem" />
              <Skeleton width="50%" height="0.875rem" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Additional Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
