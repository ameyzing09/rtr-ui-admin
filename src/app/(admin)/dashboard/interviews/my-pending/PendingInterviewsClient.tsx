'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import type { PendingInterviewItem } from '@/domain/interview/schemas';

interface PendingInterviewsClientProps {
  interviews: PendingInterviewItem[];
  ctasEnabled: boolean;
}

function formatAssignedAt(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'PLANNED':
      return 'bg-blue-50 text-blue-700';
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700';
    case 'COMPLETED':
      return 'bg-green-50 text-green-700';
    case 'CANCELLED':
      return 'bg-gray-50 text-gray-500';
    default:
      return 'bg-gray-50 text-gray-600';
  }
}

export function PendingInterviewsClient({
  interviews,
  ctasEnabled,
}: PendingInterviewsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInterviews = useMemo(() => {
    if (!searchQuery) return interviews;
    const query = searchQuery.toLowerCase();
    return interviews.filter(
      (interview) =>
        interview.applicantName.toLowerCase().includes(query) ||
        interview.jobTitle.toLowerCase().includes(query) ||
        interview.stage.name.toLowerCase().includes(query)
    );
  }, [interviews, searchQuery]);

  if (interviews.length === 0 && ctasEnabled) {
    return (
      <div className="flex-1 p-6" data-testid="interviews-list">
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-testid="interview-empty-state"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            You have no pending interview assignments. Check back later when new
            interviews are scheduled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      data-testid="interviews-list"
    >
      {/* Search Bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by applicant, job, or stage..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="interview-search"
            />
          </div>
          <span
            className="text-sm text-gray-500"
            data-testid="interview-count"
          >
            {interviews.length} pending interview
            {interviews.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Interviews List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredInterviews.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">
              No interviews match your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInterviews.map((interview) => (
              <Card
                key={`${interview.interviewId}-${interview.roundId}`}
                className="hover:shadow-md transition-shadow"
                padding="none"
                data-testid={`interview-card-${interview.interviewId}`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium text-gray-900 truncate"
                      data-testid="interview-applicant-name"
                    >
                      {interview.applicantName}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span data-testid="interview-job-title">
                        {interview.jobTitle}
                      </span>
                      <span className="text-gray-300">&middot;</span>
                      <span
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                        data-testid="interview-stage-name"
                      >
                        {interview.stage.name}
                      </span>
                      <span
                        className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                        data-testid="interview-round-type"
                      >
                        {interview.roundType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(interview.interviewStatus)}`}
                        data-testid="interview-status"
                      >
                        {interview.interviewStatus}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span data-testid="interview-assigned-at">
                        Assigned {formatAssignedAt(interview.assignedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {ctasEnabled && (
                      <Link
                        href={`/dashboard/evaluations/${interview.evaluationInstanceId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        data-testid="complete-evaluation-cta"
                      >
                        <ClipboardList className="h-4 w-4" />
                        Complete Evaluation
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/interviews/${interview.interviewId}`}
                      className="text-gray-400 hover:text-gray-600"
                      data-testid="view-interview-detail"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
