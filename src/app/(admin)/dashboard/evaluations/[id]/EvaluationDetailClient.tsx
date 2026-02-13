'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, Users } from 'lucide-react';
import { EvaluationForm } from '@/components/evaluation/EvaluationForm';
import Card from '@/components/ui/Card';
import type { EvaluationDetails } from '@/domain/evaluation/schemas';

interface EvaluationDetailClientProps {
  evaluation: EvaluationDetails;
  currentUserId?: string;
}

export function EvaluationDetailClient({ evaluation, currentUserId }: EvaluationDetailClientProps) {
  const router = useRouter();

  // Check if current user has already responded
  const hasResponded = currentUserId
    ? evaluation.participants.some((p) => p.status === 'SUBMITTED' && p.userId === currentUserId)
    : false;

  const respondedCount = evaluation.participants.filter((p) => p.status === 'SUBMITTED').length;
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
                    key={participant.userId}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      participant.status === 'SUBMITTED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                    title={`${participant.userName ?? 'Participant'} (${participant.status.toLowerCase()})`}
                    data-testid={`participant-${participant.userId}`}
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
              templateName={evaluation.template.name}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}

