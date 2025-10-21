import { CreatePipelineForm } from './CreatePipelineForm';

export const metadata = {
  title: 'Create Pipeline | Dashboard',
  description: 'Create a new interview pipeline',
};

interface CreatePipelinePageProps {
  searchParams: Promise<{
    jobId?: string;
  }>;
}

/**
 * Create Pipeline Page (Server Component)
 * POST /pipeline
 *
 * Features:
 * - Dynamic stages editor with add/remove/reorder
 * - Stage metadata editor (key-value pairs)
 * - Form validation
 * - Context-aware redirect (jobId in query → redirect to job assign screen)
 * - Success toast + redirect to pipeline details
 */
export default async function CreatePipelinePage({ searchParams }: CreatePipelinePageProps) {
  const { jobId } = await searchParams;

  return <CreatePipelineForm jobId={jobId} />;
}
