import { notFound } from 'next/navigation';
import { getJobAction } from '@/lib/actions/job';
import { EditJobWizard } from './EditJobWizard';

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditJobPageProps) {
  const result = await getJobAction(params.id);

  if (!result.success) {
    return {
      title: 'Edit Job | Dashboard',
    };
  }

  return {
    title: `Edit ${result.data.title} | Jobs | Dashboard`,
    description: `Edit job posting: ${result.data.title}`,
  };
}

/**
 * Edit Job Page (Server Component)
 * B4: Update Job - PUT /job/:id
 *
 * Features:
 * - Reuses create wizard with pre-filled data
 * - Partial updates allowed (only changed fields sent)
 * - 404 handling
 */
export default async function EditJobPage({ params }: EditJobPageProps) {
  const result = await getJobAction(params.id);

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

  return (
    <div className="flex h-full flex-col">
      <EditJobWizard job={result.data} />
    </div>
  );
}
