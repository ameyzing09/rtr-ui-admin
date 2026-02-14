import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getInterviewDetailAction } from '@/lib/actions/interview';
import { listMembersAction } from '@/lib/actions/members';
import { InterviewDetailClient } from './InterviewDetailClient';
import Skeleton from '@/components/ui/Skeleton';
import { getSession } from '@/lib/rbac/guard.server';

interface InterviewDetailPageProps {
  params: Promise<{
    interviewId: string;
  }>;
}

export const metadata = {
  title: 'Interview Detail | Dashboard',
  description: 'View interview details and evaluation links',
};

/**
 * Interview Detail Page (Server Component)
 * Shows read-only interview detail with evaluation links
 */
export default async function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  const { interviewId } = await params;
  const [result, session, membersResult] = await Promise.all([
    getInterviewDetailAction(interviewId),
    getSession(),
    listMembersAction().catch(() => ({ success: false as const, data: [] as never[] })),
  ]);

  // Build userId → name map for displaying interviewer names
  const userMap: Record<string, string> = {};
  if (membersResult.success) {
    for (const m of membersResult.data) {
      userMap[m.id] = m.name;
    }
  }

  if (!result.success) {
    if (result.code === 'INTERVIEW_NOT_FOUND') {
      notFound();
    }
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">
            Failed to load interview
          </h3>
          <p className="mt-1 text-sm text-red-700">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<InterviewDetailSkeleton />}>
      <InterviewDetailClient
        interview={result.data}
        currentUserId={session?.userId}
        userMap={userMap}
      />
    </Suspense>
  );
}

function InterviewDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
