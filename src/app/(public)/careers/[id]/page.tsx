import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, Calendar } from 'lucide-react';
import { publicJobService } from '@/domain/public/service';
import { formatPublishDate } from '@/domain/public/schemas';
import Card from '@/components/ui/Card';
import { PublicApplicationForm } from '@/components/public/PublicApplicationForm';

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: JobDetailPageProps) {
  try {
    const { id } = await params;
    const job = await publicJobService.getJob(id);
    return {
      title: `${job.title} - Careers`,
      description: job.description?.substring(0, 160) || `Apply for ${job.title} position`,
    };
  } catch {
    return {
      title: 'Job Not Found - Careers',
    };
  }
}

/**
 * D2: Public Job Detail Page
 * GET /public/jobs/:id
 *
 * Features:
 * - Full job description and details
 * - Custom fields from extra
 * - Application form
 * - 404 when unpublished/expired
 */
export default async function JobDetailPage({ params }: JobDetailPageProps) {
  try {
    const { id } = await params;
    const job = await publicJobService.getJob(id);

    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all jobs
        </Link>

        {/* Job Header */}
        <div className="mt-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {job.title}
          </h1>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {job.department && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.department}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Posted {formatPublishDate(job.publish_at)}
            </span>
          </div>
        </div>

        {/* Job Description */}
        {job.description && (
          <Card className="mt-8 p-8">
            <h2 className="text-xl font-semibold text-gray-900">About this role</h2>
            <div
              className="mt-4 prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </Card>
        )}

        {/* Custom Fields (Extra) */}
        {job.extra && Object.keys(job.extra).length > 0 && (
          <Card className="mt-6 p-8">
            <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {Object.entries(job.extra).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-500">
                    {formatFieldName(key)}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatFieldValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        {/* Application Form */}
        <div className="mt-12">
          <PublicApplicationForm jobId={job.id} jobTitle={job.title} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to load job:', error);
    notFound();
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format field name from snake_case to Title Case
 */
function formatFieldName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format field value for display
 */
function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
