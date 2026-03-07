import { publicJobService } from '@/domain/public/service';
import { PublicJobsListClient } from './PublicJobsListClient';
import type { PublicJobsQuery } from '@/domain/public/schemas';

interface CareersPageProps {
  searchParams: Promise<{
    search?: string;
    department?: string;
    location?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export const metadata = {
  title: 'Careers - Job Openings',
  description: 'Browse our current job openings and start your application',
};

/**
 * D1: Public Jobs List Page
 * GET /public/jobs
 *
 * Features:
 * - Search by title/keyword
 * - Filter by department and location
 * - Pagination
 * - Only shows published, non-expired jobs
 */
export default async function CareersPage({ searchParams }: CareersPageProps) {
  try {
    const params = await searchParams;

    // Build query from URL params
    const query: PublicJobsQuery = {
      search: params.search,
      department: params.department,
      location: params.location,
      page: params.page ? parseInt(params.page) : 1,
      pageSize: params.pageSize ? parseInt(params.pageSize) : 10,
    };
    const jobsData = await publicJobService.listJobs(query);
    console.log('Fetched jobs data:', jobsData);

    return (
      <PublicJobsListClient
        initialData={jobsData}
        searchQuery={query.search || ''}
        departmentFilter={query.department || ''}
        locationFilter={query.location || ''}
        currentPage={query.page || 1}
        pageSize={query.pageSize || 10}
      />
    );
  } catch (error) {
    console.error('Failed to load jobs:', error);

    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900">
            Unable to load job listings
          </h3>
          <p className="mt-2 text-sm text-red-700">
            Please try again later or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }
}
