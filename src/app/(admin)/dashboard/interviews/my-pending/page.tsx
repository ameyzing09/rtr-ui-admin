import { getMyPendingInterviewsAction } from '@/lib/actions/interview';
import type { PendingInterviewErrorKind } from '@/lib/actions/interview';
import { PendingInterviewsClient } from './PendingInterviewsClient';

export const metadata = {
  title: 'My Pending Interviews | Dashboard',
  description: 'View and manage pending interview assignments',
};

const bannerConfig: Record<PendingInterviewErrorKind, { title: string; color: 'amber' | 'red' }> = {
  schema_mismatch: { title: 'Contract Mismatch', color: 'amber' },
  forbidden:       { title: 'Access Denied', color: 'red' },
  network:         { title: 'Service Unreachable', color: 'red' },
  config:          { title: 'Service Not Configured', color: 'red' },
  unknown:         { title: 'Could Not Load Interviews', color: 'red' },
};

function PageHeader() {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your pending interview assignments
        </p>
      </div>
    </div>
  );
}

/**
 * Pending Interviews Page (Server Component)
 * Shows list of pending interview assignments for the current user
 */
export default async function MyPendingInterviewsPage() {
  const result = await getMyPendingInterviewsAction();

  if (!result.success) {
    const banner = bannerConfig[result.kind];
    const isAmber = banner.color === 'amber';
    return (
      <div className="flex h-full flex-col">
        <PageHeader />
        <div className="p-6">
          <div className={`rounded-lg border p-4 ${
            isAmber
              ? 'border-amber-200 bg-amber-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <h3 className={`text-sm font-semibold ${isAmber ? 'text-amber-900' : 'text-red-900'}`}>
              {banner.title}
            </h3>
            <p className={`mt-1 text-sm ${isAmber ? 'text-amber-700' : 'text-red-700'}`}>
              {result.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader />
      <PendingInterviewsClient
        interviews={result.data}
        ctasEnabled={true}
      />
    </div>
  );
}
