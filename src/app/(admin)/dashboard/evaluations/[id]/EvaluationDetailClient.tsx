'use client';;
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, Users, Loader2 } from 'lucide-react';
import { EvaluationForm } from '@/components/evaluation/EvaluationForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { evaluationService, EvaluationApiError } from '@/domain/evaluation/service';
import type { EvaluationDetails, EvaluationResponse } from '@/domain/evaluation/schemas';
import type { UserSession } from '@/lib/rbac/guard';
import { toast } from '@/components/ui/ToastProvider';
import Card from '@/components/ui/Card';

interface EvaluationDetailClientProps {
  evaluation: EvaluationDetails;
  currentUserId?: string;
  canCreateInterview?: boolean;
  canCompleteEvaluation?: boolean;
  responses?: EvaluationResponse[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
};

export function EvaluationDetailClient({ evaluation, currentUserId, canCreateInterview, canCompleteEvaluation, responses = [] }: EvaluationDetailClientProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  // Build participant lookup by id for joining with responses
  const participantById = Object.fromEntries(
    evaluation.participants.map((p) => [p.id, p])
  );

  // Check if current user has already responded
  const hasResponded = currentUserId
    ? evaluation.participants.some((p) => p.status === 'SUBMITTED' && p.userId === currentUserId)
    : false;

  const isParticipant = currentUserId
    ? evaluation.participants.some((p) => p.userId === currentUserId)
    : false;

  const respondedCount = evaluation.participants.filter((p) => p.status === 'SUBMITTED').length;
  const totalParticipants = evaluation.participants.length;

  const statusInfo = statusConfig[evaluation.status] ?? statusConfig.PENDING;

  const allSubmitted = totalParticipants > 0 && respondedCount === totalParticipants;
  const canShowCompleteButton = canCompleteEvaluation
    && evaluation.status !== 'COMPLETED'
    && evaluation.status !== 'CANCELLED'
    && allSubmitted;

  const handleSuccess = () => {
    // Stay on page — refresh to show updated participant statuses
    router.refresh();
  };

  const handleBack = () => {
    router.push('/dashboard/evaluations');
  };

  const handleComplete = async () => {
    if (!session) {
      toast({ title: 'Not authenticated', description: 'Please log in again.', variant: 'error' });
      return;
    }

    setIsCompleting(true);
    try {
      const userSession: UserSession = {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        role: session.user.role,
        permissions: session.user.permissions ?? [],
        email: session.user.email,
        name: session.user.name,
        token: session.token,
      };

      await evaluationService.completeEvaluation(userSession, session.token, evaluation.id);

      toast({
        title: 'Evaluation completed',
        description: 'Signals have been aggregated successfully.',
        variant: 'success',
      });
      router.refresh();
    } catch (error) {
      const message = error instanceof EvaluationApiError
        ? error.message
        : 'An unexpected error occurred';
      toast({
        title: 'Failed to complete evaluation',
        description: message,
        variant: 'error',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const completeCard = (
    <Card className="p-6 bg-blue-50 border-blue-200" data-testid="complete-evaluation-card">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-blue-800">Ready to complete</h3>
          <p className="mt-1 text-sm text-blue-700">
            All evaluators have submitted their responses. Complete this evaluation to finalize and aggregate signals.
          </p>
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            data-testid="complete-evaluation-btn"
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Evaluation'
            )}
          </button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex h-full flex-col" data-testid="evaluation-detail">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Go back"
            data-testid="evaluation-back-btn"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                Interview Evaluation
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                data-testid="evaluation-status-badge"
              >
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-500" data-testid="evaluation-template-name">
              {evaluation.template.name}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Participants Status */}
          <Card className="p-4" data-testid="participant-status">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Evaluation Progress</h3>
                <p className="text-sm text-gray-500" data-testid="evaluation-progress">
                  {totalParticipants === 0
                    ? 'No participants assigned yet'
                    : `${respondedCount} of ${totalParticipants} evaluators have submitted`}
                </p>
              </div>
              <div className="flex items-center gap-2" data-testid="participant-avatars">
                {evaluation.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      participant.status === 'SUBMITTED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                    title={`${participant.userName ?? 'Participant'} (${participant.status.toLowerCase()})`}
                    data-testid={`participant-${participant.id}`}
                  >
                    {participant.status === 'SUBMITTED' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Evaluation Completed Notice */}
          {evaluation.status === 'COMPLETED' ? (
            <Card className="p-6 bg-green-50 border-green-200" data-testid="evaluation-completed-notice">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">Evaluation Completed</h3>
                  <p className="mt-1 text-sm text-green-700">
                    This evaluation has been completed and signals have been aggregated.
                  </p>
                </div>
              </div>
            </Card>
          ) : hasResponded ? (
            <>
              {/* Already Submitted Notice */}
              <Card className="p-6 bg-green-50 border-green-200" data-testid="evaluation-submitted-notice">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-800">
                      Evaluation Submitted
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      You have already submitted your evaluation for this interview.
                      Your responses have been recorded.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Complete Evaluation CTA — shown after submission when all participants done */}
              {canShowCompleteButton && completeCard}
            </>
          ) : totalParticipants === 0 ? (
            /* No participants assigned */
            <Card className="p-6 bg-amber-50 border-amber-200" data-testid="no-participants-notice">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-800">No participants assigned yet</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    {canCreateInterview
                      ? 'Create an interview from the application detail view to assign evaluators.'
                      : 'An interview must be created to assign evaluators for this evaluation.'}
                  </p>
                </div>
              </div>
            </Card>
          ) : canShowCompleteButton ? (
            /* Complete CTA for any authorized user when all submitted */
            completeCard
          ) : isParticipant ? (
            /* Evaluation Form — only for actual participants */
            <EvaluationForm
              evaluationId={evaluation.id}
              signals={evaluation.signals}
              templateName={evaluation.template.name}
              onSuccess={handleSuccess}
            />
          ) : canCompleteEvaluation ? (
            /* Admin/HR overview — non-participant with evaluation permissions */
            <Card className="p-6 bg-blue-50 border-blue-200" data-testid="admin-evaluation-overview">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800">Evaluation Overview</h3>
                  <p className="mt-2 text-sm text-blue-700">
                    {respondedCount} of {totalParticipants} evaluators have submitted.
                    {respondedCount < totalParticipants
                      ? " You'll be able to complete this evaluation once all responses are in."
                      : ' All responses are in — this evaluation is ready to be completed.'}
                  </p>

                  {/* Participant status list */}
                  <ul className="mt-4 space-y-2">
                    {evaluation.participants.map((participant) => (
                      <li
                        key={participant.id}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                        data-testid={`admin-participant-${participant.id}`}
                      >
                        <span className="font-medium text-gray-900">
                          {participant.userName ?? 'Participant'}
                        </span>
                        <div className="flex items-center gap-2">
                          {participant.submittedAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(participant.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              participant.status === 'SUBMITTED'
                                ? 'bg-green-100 text-green-700'
                                : participant.status === 'DECLINED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {participant.status === 'SUBMITTED'
                              ? 'Submitted'
                              : participant.status === 'DECLINED'
                                ? 'Declined'
                                : 'Pending'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ) : (
            /* Non-participant waiting state */
            <Card className="p-6 bg-gray-50 border-gray-200" data-testid="evaluation-in-progress-notice">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Evaluation in progress</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Waiting for all evaluators to submit their responses before this evaluation can be completed.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Submitted Responses (HR/Admin only) */}
          {responses.length > 0 && (
            <div className="space-y-4" data-testid="submitted-responses">
              <h2 className="text-lg font-semibold text-gray-900">Submitted Responses</h2>
              {responses.map((response) => {
                const participant = participantById[response.participantId];
                return (
                  <Card key={response.id} className="p-5" data-testid={`response-card-${response.id}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {participant?.userName ?? 'Unknown Participant'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(response.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {evaluation.signals.map((signal) => {
                        const value = response.responseData[signal.key];
                        return (
                          <div key={signal.key} className="flex items-start gap-3 py-1">
                            <span className="text-sm font-medium text-gray-600 min-w-[140px]">
                              {signal.label}
                            </span>
                            <span className="text-sm text-gray-900">
                              {renderSignalValue(signal.type, value, signal.scale)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Submitted Responses (HR/Admin only) */}
          {responses.length > 0 && (
            <div className="space-y-4" data-testid="submitted-responses">
              <h2 className="text-lg font-semibold text-gray-900">Submitted Responses</h2>
              {responses.map((response) => {
                const participant = participantById[response.participantId];
                return (
                  <Card key={response.id} className="p-5" data-testid={`response-card-${response.id}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {participant?.userName ?? 'Unknown Participant'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(response.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {evaluation.signals.map((signal) => {
                        const value = response.responseData[signal.key];
                        return (
                          <div key={signal.key} className="flex items-start gap-3 py-1">
                            <span className="text-sm font-medium text-gray-600 min-w-[140px]">
                              {signal.label}
                            </span>
                            <span className="text-sm text-gray-900">
                              {renderSignalValue(signal.type, value, signal.scale)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderSignalValue(
  type: string,
  value: boolean | number | string | undefined,
  scale?: { min: number | null; max: number | null }
): React.ReactNode {
  if (value === undefined || value === null) {
    return <span className="text-gray-400 italic">No response</span>;
  }

  switch (type) {
    case 'boolean':
      return value ? (
        <span className="text-green-700 font-medium">Yes</span>
      ) : (
        <span className="text-red-700 font-medium">No</span>
      );
    case 'numeric':
      if (scale?.max != null) {
        return `${value} / ${scale.max}`;
      }
      return String(value);
    case 'text':
      return String(value);
    default:
      return String(value);
  }
}
