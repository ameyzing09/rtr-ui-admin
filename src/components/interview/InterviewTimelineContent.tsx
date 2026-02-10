'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ExternalLink,
  Users,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  getInterviewsForApplicationAction,
  cancelInterviewAction,
} from '@/lib/actions/interview';
import type { ApplicationInterviewItem } from '@/domain/interview/schemas';

interface InterviewTimelineContentProps {
  applicationId: string;
  canCancel?: boolean;
  onUpdate?: () => void;
}

function getStatusBadgeStyle(status: string): string {
  switch (status) {
    case 'PLANNED':
      return 'bg-blue-50 text-blue-700';
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-500';
    default:
      return 'bg-gray-50 text-gray-600';
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
    }).format(date);
  } catch {
    return dateString;
  }
}

export function InterviewTimelineContent({
  applicationId,
  canCancel = false,
  onUpdate,
}: InterviewTimelineContentProps) {
  const [interviews, setInterviews] = useState<ApplicationInterviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  const loadInterviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getInterviewsForApplicationAction(applicationId);
      if (result.success) {
        setInterviews(result.data);
      } else {
        setError(result.error || 'Failed to load interviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const handleCancel = async (interviewId: string) => {
    setCancellingId(interviewId);
    try {
      const result = await cancelInterviewAction(interviewId);
      if (result.success) {
        setShowCancelConfirm(null);
        await loadInterviews();
        onUpdate?.();
      } else {
        setError(result.error || 'Failed to cancel interview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel interview');
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">{error}</p>
        <button
          onClick={loadInterviews}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          No interviews scheduled for this application.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interviews.map((interview) => (
        <div
          key={interview.id}
          className="border border-gray-200 rounded-lg p-4"
        >
          {/* Interview header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {interview.stage.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeStyle(interview.status)}`}
              >
                {interview.status}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(interview.createdAt)}
            </span>
          </div>

          {/* Rounds */}
          <div className="space-y-2">
            {interview.rounds.map((round) => (
              <div
                key={round.id}
                className="bg-gray-50 rounded p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Round {round.sequence}: {round.roundType}
                  </span>
                  {round.evaluationInstanceId && (
                    <Link
                      href={`/dashboard/evaluations/${round.evaluationInstanceId}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Evaluation
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>
                    {round.assignments.length} interviewer
                    {round.assignments.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-3">
            <Link
              href={`/dashboard/interviews/${interview.id}`}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              View details
            </Link>

            {canCancel && interview.status !== 'CANCELLED' && (
              <>
                {showCancelConfirm === interview.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Cancel this interview?
                    </span>
                    <button
                      onClick={() => handleCancel(interview.id)}
                      disabled={cancellingId === interview.id}
                      className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      {cancellingId === interview.id ? 'Cancelling...' : 'Yes, cancel'}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(null)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(interview.id)}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-3 w-3" />
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
