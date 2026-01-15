import { notFound } from 'next/navigation';
import { getJobAction } from '@/lib/actions/job';
import { listApplicationsAction } from '@/lib/actions/application';
import { getPipelineByJobIdAction } from '@/lib/actions/pipeline';
import { JobDetailClient } from './JobDetailClient';

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: JobDetailPageProps) {
  const { id } = await params;
  const result = await getJobAction(id);

  if (!result.success) {
    return {
      title: 'Job Not Found | Dashboard',
    };
  }

  return {
    title: `${result.data.title} | Jobs | Dashboard`,
    description: result.data.description?.substring(0, 160) || 'Job details',
  };
}

/**
 * Job Detail Page (Server Component)
 * B3: Get Job - GET /job/:id
 *
 * Features:
 * - Tabs: Overview, Pipeline, Applicants, Activity, Settings
 * - 404 handling with not-found template
 * - Applications tab with filtered view
 */
export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const result = await getJobAction(id);

  // Handle 404
  if (!result.success) {
    if (result.code === 'JOB_NOT_FOUND') {
      notFound();
    }

    // Other errors
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Failed to load job</h3>
          <p className="mt-1 text-sm text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  // Fetch applications and pipeline for this job in parallel
  const [applicationsResult, pipelineResult] = await Promise.all([
    listApplicationsAction(id),
    getPipelineByJobIdAction(id),
  ]);

  return (
    <JobDetailClient
      job={result.data}
      applications={applicationsResult.success ? applicationsResult.data : []}
      pipeline={pipelineResult.success ? pipelineResult.data : null}
    />
  );
}
