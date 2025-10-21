import Skeleton, { SkeletonCard } from '@/components/ui/Skeleton';

/**
 * Pipeline Detail Page Loading State
 * Shows while pipeline detail page is compiling or loading data
 */
export default function PipelineDetailLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mb-4">
          <Skeleton width="12rem" height="1rem" />
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton width="35%" height="2rem" />
              <Skeleton width="4rem" height="1.5rem" />
            </div>
            <Skeleton width="50%" height="1rem" />
          </div>
          <Skeleton width="5rem" height="2.5rem" />
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* CTA Card Skeleton */}
          <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex items-center gap-3">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="space-y-2">
                  <Skeleton width="16rem" height="1.25rem" />
                  <Skeleton width="24rem" height="0.875rem" />
                </div>
              </div>
              <Skeleton width="10rem" height="3rem" />
            </div>
          </div>

          {/* Interview Stages Section */}
          <div>
            <Skeleton width="12rem" height="1.25rem" className="mb-4" />

            {/* Stage Preview Strip */}
            <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} width="8rem" height="2.5rem" />
                ))}
              </div>
            </div>

            {/* Stage Cards */}
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1 space-y-3">
                      <Skeleton width="40%" height="1.25rem" />
                      <div className="flex gap-4">
                        <Skeleton width="6rem" height="1rem" />
                        <Skeleton width="8rem" height="1rem" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Info Card */}
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
