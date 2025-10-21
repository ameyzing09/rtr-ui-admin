import { notFound } from 'next/navigation';
import { getPipelineAction } from '@/lib/actions/pipeline';
import { EditPipelineForm } from './EditPipelineForm';

export const metadata = {
  title: 'Edit Pipeline | Dashboard',
  description: 'Edit interview pipeline',
};

interface EditPipelinePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    redirect?: string;
  }>;
}

/**
 * Edit Pipeline Page
 * Fetches pipeline data and renders edit form
 */
export default async function EditPipelinePage({
  params,
  searchParams,
}: EditPipelinePageProps) {
  const { id } = await params;
  const { redirect: redirectUrl } = await searchParams;

  // Fetch pipeline data
  const result = await getPipelineAction(id);

  // Handle not found
  if (!result.success) {
    if (result.code === 'PIPELINE_NOT_FOUND') {
      notFound();
    }

    // For other errors, we could show an error page, but for now just throw
    throw new Error(result.error);
  }

  return <EditPipelineForm pipeline={result.data} redirectUrl={redirectUrl} />;
}
