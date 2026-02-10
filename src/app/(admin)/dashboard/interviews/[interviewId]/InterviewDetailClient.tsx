'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  Users,
  ExternalLink,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import type { InterviewDetail, InterviewRound } from '@/domain/interview/schemas';

interface InterviewDetailClientProps {
  interview: InterviewDetail;
  currentUserId?: string;
}

function getStatusBadgeStyle(status: string): string {
  switch (status) {
    case 'PLANNED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function formatDate(dateString: string): string {
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

export function InterviewDetailClient({
  interview,
  currentUserId,
}: InterviewDetailClientProps) {
  const router = useRouter();

  // Determine which rounds the current user is assigned to
  const assignedRounds = useMemo(() => {
    if (!currentUserId) return [];
    return interview.rounds.filter((round) =>
      round.assignments.some((a) => a.userId === currentUserId)
    );
  }, [interview.rounds, currentUserId]);

  const isAssignedToAnyRound = assignedRounds.length > 0;

  // Get evaluation instance ID for a round where current user is assigned
  const getMyEvaluationId = (round: InterviewRound): string | undefined => {
    if (!currentUserId) return undefined;
    const myAssignment = round.assignments.find((a) => a.userId === currentUserId);
    return myAssignment?.evaluationInstanceId || round.evaluationInstanceId;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {interview.applicantName}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeStyle(interview.status)}`}
              >
                {interview.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {interview.jobTitle} &middot; {interview.stage.name}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Prominent CTA for interviewer with exactly 1 assigned round */}
          {isAssignedToAnyRound && assignedRounds.length === 1 && (
            <Card className="border-blue-200 bg-blue-50" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">
                    You are assigned to this interview
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Complete your evaluation for the{' '}
                    {assignedRounds[0].roundType} round
                  </p>
                </div>
                {(() => {
                  const evalId = getMyEvaluationId(assignedRounds[0]);
                  return evalId ? (
                    <Link
                      href={`/dashboard/evaluations/${evalId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      data-testid="open-my-evaluation-cta"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Open Your Evaluation
                    </Link>
                  ) : null;
                })()}
              </div>
            </Card>
          )}

          {/* Interview Info */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Interview Details
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Applicant</dt>
                <dd className="mt-1 text-gray-900">
                  {interview.applicantName}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Job</dt>
                <dd className="mt-1 text-gray-900">{interview.jobTitle}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Stage</dt>
                <dd className="mt-1">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {interview.stage.name}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeStyle(interview.status)}`}
                  >
                    {interview.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-gray-900">
                  {formatDate(interview.createdAt)}
                </dd>
              </div>
              {interview.updatedAt && (
                <div>
                  <dt className="font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-gray-900">
                    {formatDate(interview.updatedAt)}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Interview Rounds */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Rounds ({interview.rounds.length})
            </h2>
            <div className="space-y-3">
              {interview.rounds.map((round) => {
                const isMyRound = currentUserId
                  ? round.assignments.some((a) => a.userId === currentUserId)
                  : false;
                const myEvalId = getMyEvaluationId(round);
                const hasAnyEvaluation =
                  round.evaluationInstanceId ||
                  round.assignments.some((a) => a.evaluationInstanceId);

                return (
                  <Card
                    key={round.id}
                    className={isMyRound ? 'border-blue-200' : ''}
                    padding="lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">
                            Round {round.sequence}: {round.roundType}
                          </h3>
                          {round.status && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeStyle(round.status)}`}
                            >
                              {round.status}
                            </span>
                          )}
                          {isMyRound && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Your Round
                            </span>
                          )}
                        </div>

                        {/* Assignments */}
                        <div className="mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                            <Users className="h-3.5 w-3.5" />
                            <span>
                              {round.assignments.length} interviewer
                              {round.assignments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {round.assignments.map((assignment) => (
                              <div
                                key={assignment.userId}
                                className="flex items-center gap-2 text-sm"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    assignment.userId === currentUserId
                                      ? 'bg-blue-500'
                                      : 'bg-gray-300'
                                  }`}
                                />
                                <span
                                  className={
                                    assignment.userId === currentUserId
                                      ? 'font-medium text-gray-900'
                                      : 'text-gray-600'
                                  }
                                >
                                  {assignment.userName || assignment.userId}
                                  {assignment.userId === currentUserId &&
                                    ' (You)'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Evaluation Links */}
                      <div className="flex flex-col items-end gap-2 ml-4">
                        {/* Interviewer: show their evaluation link for assigned rounds */}
                        {isMyRound && myEvalId && (
                          <Link
                            href={`/dashboard/evaluations/${myEvalId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            data-testid={`round-evaluation-cta-${round.id}`}
                          >
                            <ClipboardList className="h-4 w-4" />
                            Open Evaluation
                          </Link>
                        )}

                        {/* HR+: show evaluation link on every round that has one */}
                        {!isMyRound && hasAnyEvaluation && (
                          <Link
                            href={`/dashboard/evaluations/${round.evaluationInstanceId || round.assignments.find((a) => a.evaluationInstanceId)?.evaluationInstanceId}`}
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                            data-testid={`round-evaluation-link-${round.id}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Evaluation
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Link to application */}
          <div className="border-t border-gray-200 pt-6">
            <Link
              href={`/dashboard/applications/${interview.applicationId}`}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              View full application details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
