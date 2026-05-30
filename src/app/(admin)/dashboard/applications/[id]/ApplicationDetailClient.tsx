'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  Building,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Activity,
  Users,
  ClipboardList,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TrackingStatusBadge } from '@/components/tracking/TrackingStatusBadge';
import type { ApplicationDetailData } from '@/domain/application-detail/schemas';
import type { OutcomeType } from '@/domain/tracking/schemas';

interface ApplicationDetailClientProps {
  data: ApplicationDetailData;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function formatShortDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatShortDate(dateString);
}

function getInterviewStatusVariant(status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
  switch (status.toUpperCase()) {
    case 'COMPLETED': return 'success';
    case 'IN_PROGRESS': return 'primary';
    case 'SCHEDULED': return 'primary';
    case 'CANCELLED': return 'danger';
    case 'PENDING': return 'warning';
    default: return 'default';
  }
}

function getEvaluationStatusVariant(status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
  switch (status.toUpperCase()) {
    case 'COMPLETED': return 'success';
    case 'IN_PROGRESS': return 'primary';
    case 'CANCELLED': return 'danger';
    case 'PENDING': return 'warning';
    default: return 'default';
  }
}

function getTimelineDotColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'stage_change': return 'bg-blue-500';
    case 'interview': return 'bg-purple-500';
    case 'evaluation': return 'bg-green-500';
    case 'action': return 'bg-amber-500';
    case 'status_change': return 'bg-indigo-500';
    case 'created': return 'bg-gray-500';
    default: return 'bg-gray-400';
  }
}

export function ApplicationDetailClient({ data }: ApplicationDetailClientProps) {
  const router = useRouter();
  const [coverLetterExpanded, setCoverLetterExpanded] = useState(false);

  const { viewerContext, application, candidate, job, tracking, interviews, evaluations, timeline } = data;
  const isRestricted = viewerContext.isRestricted;

  return (
    <div data-testid="app-detail-page" className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="app-detail-back-btn"
              onClick={() => router.back()}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 data-testid="app-detail-candidate-name" className="text-xl font-semibold text-gray-900">
                  {candidate.name}
                </h1>
                <Badge
                  data-testid="app-detail-status-badge"
                  variant={application.status === 'HIRED' ? 'success' : application.status === 'REJECTED' ? 'danger' : 'default'}
                  size="sm"
                >
                  {application.status}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">
                Applied {formatShortDate(application.createdAt)}
              </p>
            </div>
          </div>
          <Link
            data-testid="app-detail-signals-link"
            href={`/dashboard/applications/${application.id}/signals`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Activity className="h-4 w-4" />
            Signals
          </Link>
        </div>
      </div>

      {/* Content grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Summary */}
            <Card data-testid="app-detail-card-candidate" padding="lg">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Candidate</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span data-testid="app-detail-candidate-email" className="text-gray-700">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span data-testid="app-detail-candidate-phone" className="text-gray-700">
                    {candidate.phone || 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Applied:</span>
                  <span data-testid="app-detail-applied-date" className="text-gray-700">{formatDate(application.createdAt)}</span>
                </div>

                {/* Resume */}
                {!isRestricted && application.resumeUrl ? (
                  <div className="pt-2">
                    <a
                      data-testid="app-detail-resume-link"
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Resume
                    </a>
                  </div>
                ) : isRestricted ? (
                  <p data-testid="app-detail-restricted-message" className="pt-2 text-sm text-gray-400 italic">Not available for this role</p>
                ) : null}

                {/* Cover Letter */}
                {!isRestricted && application.coverLetter ? (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      data-testid="app-detail-cover-letter-toggle"
                      onClick={() => setCoverLetterExpanded(!coverLetterExpanded)}
                      className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Cover Letter
                      {coverLetterExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {coverLetterExpanded && (
                      <p data-testid="app-detail-cover-letter-content" className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                        {application.coverLetter}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Job Summary */}
            <Card data-testid="app-detail-card-job" padding="lg">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Job</h2>
              <div className="space-y-3">
                <Link
                  data-testid="app-detail-job-title"
                  href={`/dashboard/jobs/${job.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {job.title}
                </Link>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span data-testid="app-detail-job-department" className="text-gray-700">
                    {job.department || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span data-testid="app-detail-job-location" className="text-gray-700">
                    {job.location || 'Not specified'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tracking */}
            <Card data-testid="app-detail-card-tracking" padding="lg">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Tracking</h2>
              {tracking ? (
                <div className="space-y-3">
                  <div data-testid="app-detail-tracking-status" className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <TrackingStatusBadge
                      status={tracking.status}
                      outcomeType={tracking.outcomeType as OutcomeType | undefined}
                      size="sm"
                    />
                  </div>
                  <div data-testid="app-detail-tracking-stage" className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current Stage</span>
                    <span className="text-sm font-medium text-gray-900">
                      {tracking.currentStageName}
                      <span className="ml-1.5 text-gray-400">
                        (#{tracking.currentStageIndex + 1})
                      </span>
                    </span>
                  </div>
                  {tracking.isTerminal && (
                    <div data-testid="app-detail-tracking-terminal" className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Terminal</span>
                      <Badge variant="danger" size="sm">Terminal</Badge>
                    </div>
                  )}
                  <div data-testid="app-detail-tracking-entered" className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Entered Stage</span>
                    <span className="text-sm text-gray-700">
                      {formatDate(tracking.enteredStageAt)}
                    </span>
                  </div>
                </div>
              ) : (
                <p data-testid="app-detail-tracking-empty" className="text-sm text-gray-400 italic">Not yet tracked</p>
              )}
            </Card>

            {/* Interviews */}
            <Card data-testid="app-detail-card-interviews" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">
                  Interviews
                  {interviews.length > 0 && (
                    <span className="ml-1.5 text-gray-400 font-normal">({interviews.length})</span>
                  )}
                </h2>
              </div>
              {interviews.length === 0 ? (
                <p data-testid="app-detail-interviews-empty" className="text-sm text-gray-400 italic">No interviews yet</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {interviews.map((interview) => (
                    <div key={interview.id} data-testid={`app-detail-interview-item-${interview.id}`} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {interview.stageName || 'Interview'}
                        </span>
                        <Badge
                          variant={getInterviewStatusVariant(interview.status)}
                          size="sm"
                        >
                          {interview.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Rounds: {interview.completedRounds}/{interview.roundCount}
                        </span>
                        {interview.interviewers.length > 0 && (
                          <span>
                            {interview.interviewers
                              .map((i) => i.userName || 'Unknown')
                              .join(', ')}
                          </span>
                        )}
                        <span>{formatShortDate(interview.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Evaluations */}
            <Card data-testid="app-detail-card-evaluations" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">
                  Evaluations
                  {evaluations.length > 0 && (
                    <span className="ml-1.5 text-gray-400 font-normal">({evaluations.length})</span>
                  )}
                </h2>
              </div>
              {evaluations.length === 0 ? (
                <p data-testid="app-detail-evaluations-empty" className="text-sm text-gray-400 italic">No evaluations yet</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {evaluations.map((evaluation) => (
                    <div key={evaluation.id} data-testid={`app-detail-evaluation-item-${evaluation.id}`} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {evaluation.templateName || 'Evaluation'}
                        </span>
                        <Badge
                          variant={getEvaluationStatusVariant(evaluation.status)}
                          size="sm"
                        >
                          {evaluation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {evaluation.stageName
                            ? `${evaluation.isInterviewLevel ? 'Interview Feedback' : 'Stage Evaluation'} · ${evaluation.stageName}`
                            : evaluation.isInterviewLevel
                              ? 'Interview Feedback'
                              : 'Stage Evaluation'}
                        </span>
                        <span>
                          {evaluation.submittedCount}/{evaluation.participantCount} submitted
                        </span>
                        {evaluation.pendingCount > 0 && (
                          <Badge variant="warning" size="sm">
                            {evaluation.pendingCount} pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right column — Timeline */}
          <div className="lg:col-span-1">
            <Card data-testid="app-detail-card-timeline" padding="lg">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Timeline</h2>
              {timeline.length === 0 ? (
                <p data-testid="app-detail-timeline-empty" className="text-sm text-gray-400 italic">No activity yet</p>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

                  <div className="space-y-4">
                    {timeline.map((entry, index) => (
                      <div key={index} data-testid={`app-detail-timeline-entry-${index}`} className="relative flex gap-3 pl-0">
                        {/* Dot */}
                        <div
                          className={`relative z-10 mt-1.5 h-[14px] w-[14px] shrink-0 rounded-full border-2 border-white ${getTimelineDotColor(entry.type)}`}
                        />
                        {/* Content */}
                        <div className="min-w-0 flex-1 pb-1">
                          <p className="text-sm text-gray-900">{entry.summary}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {entry.actorName && (
                              <span className="text-xs text-gray-500">{entry.actorName}</span>
                            )}
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
