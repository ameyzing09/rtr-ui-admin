'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, Users } from 'lucide-react';
import { EvaluationForm } from '@/components/evaluation/EvaluationForm';
import Card from '@/components/ui/Card';
import type { EvaluationDetails } from '@/domain/evaluation/schemas';

interface EvaluationDetailClientProps {
  evaluation: EvaluationDetails;
}

export function EvaluationDetailClient({ evaluation }: EvaluationDetailClientProps) {
  const router = useRouter();

  // Check if current user has already responded
  const hasResponded = evaluation.participants.some(
    (p) => p.hasResponded && p.userId === evaluation.id // This logic may need adjustment based on actual user identification
  );

  const respondedCount = evaluation.participants.filter((p) => p.hasResponded).length;
  const totalParticipants = evaluation.participants.length;

  const handleSuccess = () => {
    // Navigate back to evaluations list after successful submission
    router.push('/dashboard/evaluations');
    router.refresh();
  };

  const handleBack = () => {
    router.push('/dashboard/evaluations');
  };

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
            <h1 className="text-xl font-bold text-gray-900">
              Interview Evaluation
            </h1>
            <p className="text-sm text-gray-500" data-testid="evaluation-template-name">
              {evaluation.templateName || 'Standard Evaluation'}
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
                  {respondedCount} of {totalParticipants} evaluators have submitted
                </p>
              </div>
              <div className="flex items-center gap-2" data-testid="participant-avatars">
                {evaluation.participants.map((participant) => (
                  <div
                    key={participant.userId}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      participant.hasResponded
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                    title={`${participant.userName}${participant.hasResponded ? ' (submitted)' : ' (pending)'}`}
                    data-testid={`participant-${participant.userId}`}
                  >
                    {participant.hasResponded ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Deadline Warning if applicable */}
          {evaluation.deadline && (
            <DeadlineWarning deadline={evaluation.deadline} />
          )}

          {/* Already Submitted Notice */}
          {hasResponded ? (
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
          ) : (
            /* Evaluation Form */
            <EvaluationForm
              evaluationId={evaluation.id}
              signals={evaluation.signals}
              applicantName={evaluation.applicantName}
              jobTitle={evaluation.jobTitle}
              stageName={evaluation.stageName}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DeadlineWarning({ deadline }: { deadline: string }) {
  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days > 3) return null;

  const isOverdue = days < 0;
  const isDueToday = days === 0;

  return (
    <Card
      className={`p-4 ${
        isOverdue
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Clock
          className={`h-5 w-5 ${
            isOverdue ? 'text-red-600' : 'text-amber-600'
          }`}
        />
        <div>
          <p
            className={`font-medium ${
              isOverdue ? 'text-red-800' : 'text-amber-800'
            }`}
          >
            {isOverdue
              ? 'This evaluation is overdue'
              : isDueToday
              ? 'This evaluation is due today'
              : `This evaluation is due in ${days} day${days === 1 ? '' : 's'}`}
          </p>
          <p
            className={`text-sm ${
              isOverdue ? 'text-red-700' : 'text-amber-700'
            }`}
          >
            Deadline: {date.toLocaleDateString()} at {date.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
