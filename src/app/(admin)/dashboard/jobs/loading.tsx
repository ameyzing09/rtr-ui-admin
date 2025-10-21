import Skeleton from '@/components/ui/Skeleton';

/**
 * Jobs Page Loading State
 * Shows while jobs page is compiling or loading data
 */
export default function JobsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header Skeleton */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width="12rem" height="2rem" />
            <Skeleton width="18rem" height="1rem" />
          </div>
          <Skeleton width="10rem" height="2.5rem" />
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="flex-1 p-6">
        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4">
          <Skeleton width="20rem" height="2.5rem" />
          <Skeleton width="10rem" height="2.5rem" />
          <Skeleton width="10rem" height="2.5rem" />
        </div>

        {/* Job Cards Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton width="60%" height="1.5rem" />
                    <Skeleton width="4rem" height="1.5rem" />
                  </div>
                  <Skeleton width="40%" height="1rem" />
                  <div className="flex gap-4">
                    <Skeleton width="8rem" height="0.875rem" />
                    <Skeleton width="8rem" height="0.875rem" />
                    <Skeleton width="8rem" height="0.875rem" />
                  </div>
                </div>
                <Skeleton width="6rem" height="2rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
