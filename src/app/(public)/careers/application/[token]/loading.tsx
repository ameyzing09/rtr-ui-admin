import Skeleton from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';

export default function ApplicationStatusLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Skeleton width={150} height={16} />

      {/* Title */}
      <div className="mt-8">
        <Skeleton width="60%" height={32} />
      </div>

      {/* Status Card */}
      <Card className="mt-6" padding="lg">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <Skeleton width={50} height={16} />
          <Skeleton width={70} height={24} variant="default" className="rounded-full" />
        </div>

        {/* Stage row */}
        <div className="mt-4 flex items-center justify-between">
          <Skeleton width={100} height={16} />
          <Skeleton width={80} height={16} />
        </div>

        {/* Divider */}
        <hr className="my-6 border-[var(--border)]" />

        {/* Status message */}
        <div className="flex items-start gap-3">
          <Skeleton width={20} height={20} variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="100%" height={14} />
            <Skeleton width="75%" height={14} />
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6 border-[var(--border)]" />

        {/* Date lines */}
        <div className="space-y-3">
          <Skeleton width={180} height={16} />
          <Skeleton width={200} height={16} />
        </div>
      </Card>
    </div>
  );
}
