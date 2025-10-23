import { notFound } from 'next/navigation';
import { getPipelineAction } from '@/lib/actions/pipeline';
import { PipelineDetailClient } from './PipelineDetailClient';

interface PipelineDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PipelineDetailPageProps) {
  const { id } = await params;
  const result = await getPipelineAction(id);

  if (!result.success) {
    return {
      title: 'Pipeline Not Found | Dashboard',
    };
  }

  return {
    title: `${result.data.name} | Pipelines | Dashboard`,
    description: result.data.description || 'Pipeline details',
  };
}

/**
 * Pipeline Detail Page (Server Component)
 * GET /pipeline/:id
 *
 * Features:
 * - Display pipeline info (name, description, stages)
 * - Big "Assign to Jobs" CTA
 * - Stage list with metadata
 * - Edit button (permission-based)
 * - 404 handling
 */
export default async function PipelineDetailPage({ params }: PipelineDetailPageProps) {
  const { id } = await params;
  const result = await getPipelineAction(id);

  // Handle 404
  if (!result.success) {
    if (result.code === 'PIPELINE_NOT_FOUND') {
      notFound();
    }

    // Other errors
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Failed to load pipeline</h3>
          <p className="mt-1 text-sm text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  return <PipelineDetailClient pipeline={result.data} />;
}
