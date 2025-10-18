import { listApplicationsAction } from '@/lib/actions/application';
import { listJobsAction } from '@/lib/actions/job';
import { ApplicationListClient } from './ApplicationListClient';

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
    <ApplicationListClient
      initialApplications={applicationsResult.data}
      jobs={jobsResult.data.jobs}
    />
  );
}
