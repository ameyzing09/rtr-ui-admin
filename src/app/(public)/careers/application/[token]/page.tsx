import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, FileSearch } from 'lucide-react';
import { publicApplicationService, PublicApiError } from '@/domain/public/service';
import { getApplicationStatusMessage } from '@/domain/public/schemas';
import { formatDate } from '@/lib/utils/dateHelpers';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface ApplicationStatusPageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({ params }: ApplicationStatusPageProps) {
  try {
    const { token } = await params;
    const status = await publicApplicationService.getApplicationStatus(token);
    return {
      title: `Application Status - ${status.job_title}`,
    };
  } catch {
    return {
      title: 'Application Status',
    };
  }
}

function getStatusBadgeVariant(status: string): 'primary' | 'success' | 'danger' | 'warning' | 'default' {
  switch (status) {
    case 'Active':
      return 'primary';
    case 'Hired':
      return 'success';
    case 'Rejected':
      return 'danger';
    case 'On Hold':
      return 'warning';
    default:
      return 'default';
  }
}

export default async function ApplicationStatusPage({ params }: ApplicationStatusPageProps) {
  try {
    const { token } = await params;
    const status = await publicApplicationService.getApplicationStatus(token);

    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          View open positions
        </Link>

        {/* Job Title */}
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
          {status.job_title}
        </h1>

        {/* Status Card */}
        <Card className="mt-6" padding="lg">
          {/* Status Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <Badge variant={getStatusBadgeVariant(status.status)}>
              {status.status}
            </Badge>
          </div>

          {/* Stage Row */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Current Stage</span>
            <span className="text-sm text-gray-900">{status.current_stage}</span>
          </div>

          {/* Divider */}
          <hr className="my-6 border-[var(--border)]" />

          {/* Status Message */}
          <div className="flex items-start gap-3">
            <FileSearch className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <p className="text-sm text-gray-700">
              {getApplicationStatusMessage(status.status)}
            </p>
          </div>

          {/* Divider */}
          <hr className="my-6 border-[var(--border)]" />

          {/* Dates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Applied {formatDate(status.applied_at, 'medium')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Last updated {formatDate(status.updated_at, 'medium')}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  } catch (error) {
    if (error instanceof PublicApiError && error.statusCode === 404) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-lg font-semibold text-gray-900">Application not found</p>
        </div>
      );
    }
    throw error;
  }
}
