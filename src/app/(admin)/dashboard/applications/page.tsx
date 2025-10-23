import { Suspense } from 'react';
import { listApplicationsAction } from '@/lib/actions/application';
import { listJobsAction } from '@/lib/actions/job';
import { ApplicationListClient } from './ApplicationListClient';
import { SkeletonTable } from '@/components/ui/Skeleton';

export const metadata = {
  title: 'Applications | Dashboard',
  description: 'Manage job applications',
};

/**
 * Applications List Page (Server Component)
 * C2: List Applications - GET /applications
 *
 * Features:
 * - Table view with search, filters, sort
 * - Status badges
 * - Create/Edit/Delete actions
 * - Integration with job listings
 */
export default async function ApplicationsPage() {
  // Fetch applications
  const applicationsResult = await listApplicationsAction();

  // Fetch jobs for the create modal
  const jobsResult = await listJobsAction({});

  // Handle errors
  if (!applicationsResult.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Failed to load applications</h3>
          <p className="mt-1 text-sm text-red-700">{applicationsResult.error}</p>
        </div>
      </div>
    );
  }

  if (!jobsResult.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Failed to load jobs</h3>
          <p className="mt-1 text-sm text-red-700">{jobsResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track job applications
            </p>
          </div>
        </div>
      </div>

      {/* Application List Client Component */}
      <Suspense fallback={<ApplicationListSkeleton />}>
        <ApplicationListClient
          initialApplications={applicationsResult.data}
          jobs={jobsResult.data.jobs}
        />
      </Suspense>
    </div>
  );
}

/**
 * Loading skeleton for application list
 */
function ApplicationListSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SkeletonTable rows={8} columns={6} />
        </div>
      </div>
    </div>
  );
}
