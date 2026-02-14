'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
  Users,
  CheckSquare,
} from 'lucide-react';
import { getTrackingStateAction } from '@/lib/actions/tracking';
import { getAvailableActionsAction } from '@/lib/actions/tracking';
import { listMembersAction } from '@/lib/actions/members';
import { createInterviewAction } from '@/lib/actions/interview';
import type { EvaluationRequirement } from '@/domain/tracking/schemas';
import type { Member } from '@/domain/members/schemas';

interface CreateInterviewFormProps {
  applicationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface RoundFormState {
  round_type: string;
  interviewer_ids: string[];
  evaluation_template_id: string;
}

export function CreateInterviewForm({
  applicationId,
  onSuccess,
  onCancel,
}: CreateInterviewFormProps) {
  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Loaded data
  const [currentStageId, setCurrentStageId] = useState<string | null>(null);
  const [currentStageName, setCurrentStageName] = useState<string | null>(null);
  const [requiredEvaluations, setRequiredEvaluations] = useState<EvaluationRequirement[]>([]);
  const [interviewers, setInterviewers] = useState<Member[]>([]);

  // Form state
  const [rounds, setRounds] = useState<RoundFormState[]>([
    { round_type: '', interviewer_ids: [], evaluation_template_id: '' },
  ]);

  const loadFormData = useCallback(async () => {
    setIsLoadingData(true);
    setLoadError(null);

    try {
      const [trackingResult, actionsResult, membersResult] = await Promise.all([
        getTrackingStateAction(applicationId),
        getAvailableActionsAction(applicationId),
        listMembersAction(),
      ]);

      if (!trackingResult.success) {
        setLoadError(trackingResult.error || 'Failed to load tracking state');
        return;
      }

      if (!actionsResult.success) {
        setLoadError(actionsResult.error || 'Failed to load available actions');
        return;
      }

      if (!membersResult.success) {
        setLoadError(membersResult.error || 'Failed to load team members');
        return;
      }

      setCurrentStageId(trackingResult.data.currentStageId);
      setCurrentStageName(trackingResult.data.currentStageName);
      setRequiredEvaluations(actionsResult.data.requiredEvaluations);

      // Filter to active interviewers only
      const activeInterviewers = membersResult.data.filter(
        (m) => m.role === 'INTERVIEWER' && m.is_active !== false
      );
      setInterviewers(activeInterviewers);

      // Auto-select template if only one exists
      if (actionsResult.data.requiredEvaluations.length === 1) {
        setRounds([{
          round_type: '',
          interviewer_ids: [],
          evaluation_template_id: actionsResult.data.requiredEvaluations[0].templateId,
        }]);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unexpected error loading form data');
    } finally {
      setIsLoadingData(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  const handleAddRound = () => {
    setRounds((prev) => [
      ...prev,
      {
        round_type: '',
        interviewer_ids: [],
        evaluation_template_id: requiredEvaluations.length === 1
          ? requiredEvaluations[0].templateId
          : '',
      },
    ]);
  };

  const handleRemoveRound = (index: number) => {
    if (rounds.length <= 1) return;
    setRounds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoundTypeChange = (index: number, value: string) => {
    setRounds((prev) =>
      prev.map((r, i) => (i === index ? { ...r, round_type: value } : r))
    );
  };

  const handleTemplateChange = (index: number, value: string) => {
    setRounds((prev) =>
      prev.map((r, i) => (i === index ? { ...r, evaluation_template_id: value } : r))
    );
  };

  const handleInterviewerToggle = (roundIndex: number, interviewerId: string) => {
    setRounds((prev) =>
      prev.map((r, i) => {
        if (i !== roundIndex) return r;
        const ids = r.interviewer_ids.includes(interviewerId)
          ? r.interviewer_ids.filter((id) => id !== interviewerId)
          : [...r.interviewer_ids, interviewerId];
        return { ...r, interviewer_ids: ids };
      })
    );
  };

  /**
   * Find all duplicate interviewer+template combinations across rounds.
   * Returns the set of round indices that participate in a conflict.
   */
  const getDuplicateRoundIndices = (): Set<number> => {
    const seen = new Map<string, number>(); // key → first round index
    const conflicts = new Set<number>();

    for (let i = 0; i < rounds.length; i++) {
      const templateId = rounds[i].evaluation_template_id;
      if (!templateId) continue;

      for (const interviewerId of rounds[i].interviewer_ids) {
        const key = `${templateId}:${interviewerId}`;
        const prev = seen.get(key);
        if (prev !== undefined) {
          conflicts.add(prev);
          conflicts.add(i);
        } else {
          seen.set(key, i);
        }
      }
    }

    return conflicts;
  };

  const duplicateRoundIndices = rounds.length > 1 ? getDuplicateRoundIndices() : new Set<number>();
  const hasDuplicateAssignments = duplicateRoundIndices.size > 0;

  const isFormValid = () => {
    if (!currentStageId) return false;
    if (requiredEvaluations.length === 0) return false;
    if (interviewers.length === 0) return false;
    if (hasDuplicateAssignments) return false;

    return rounds.every(
      (r) =>
        r.round_type.trim().length > 0 &&
        r.interviewer_ids.length >= 1 &&
        r.evaluation_template_id.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!currentStageId || !isFormValid()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createInterviewAction(applicationId, {
        pipeline_stage_id: currentStageId,
        rounds: rounds.map((r, i) => ({
          round_type: r.round_type.trim(),
          sequence: i + 1,
          interviewer_ids: r.interviewer_ids,
          evaluation_template_id: r.evaluation_template_id,
        })),
      });

      if (result.success) {
        onSuccess();
      } else {
        const isDuplicateRound =
          result.code === 'duplicate_round_assignment' ||
          result.error?.toLowerCase().includes('duplicate') && result.error?.toLowerCase().includes('round');
        if (isDuplicateRound) {
          setSubmitError(
            'Same interviewer cannot be assigned to multiple rounds with the same evaluation template. Use different templates or different interviewers.'
          );
        } else {
          setSubmitError(result.error || 'Failed to create interview');
        }
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Load error
  if (loadError) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{loadError}</p>
          <button
            onClick={loadFormData}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Gate: No evaluation templates
  if (requiredEvaluations.length === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                No evaluation templates configured for this stage
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Interview creation requires an evaluation-required stage.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Gate: No interviewers
  if (interviewers.length === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                No interviewers found in this tenant
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Add team members with the Interviewer role to create interviews.
              </p>
              <Link
                href="/dashboard/team"
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Go to Team settings
              </Link>
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Main form
  return (
    <div className="space-y-4">
      {/* Stage badge (read-only) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Stage
        </label>
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
          {currentStageName}
        </span>
      </div>

      {/* Rounds */}
      <div className="space-y-4">
        {rounds.map((round, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 space-y-3 border ${
              duplicateRoundIndices.has(index)
                ? 'border-amber-400 bg-amber-50/50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Round {index + 1}
              </h4>
              {rounds.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRound(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Round Type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Round Type
              </label>
              <input
                type="text"
                value={round.round_type}
                onChange={(e) => handleRoundTypeChange(index, e.target.value)}
                placeholder="e.g. Technical, Behavioral, Culture Fit"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Evaluation Template */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Evaluation Template
              </label>
              {requiredEvaluations.length === 1 ? (
                <span className="text-sm text-gray-700">
                  {requiredEvaluations[0].templateName}
                </span>
              ) : (
                <select
                  value={round.evaluation_template_id}
                  onChange={(e) => handleTemplateChange(index, e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select template...</option>
                  {requiredEvaluations.map((req) => (
                    <option key={req.templateId} value={req.templateId}>
                      {req.templateName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Interviewers */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Interviewers (select at least 1)
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {interviewers.map((interviewer) => (
                  <label
                    key={interviewer.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={round.interviewer_ids.includes(interviewer.id)}
                      onChange={() => handleInterviewerToggle(index, interviewer.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{interviewer.name}</span>
                    {interviewer.email && (
                      <span className="text-xs text-gray-400">{interviewer.email}</span>
                    )}
                  </label>
                ))}
              </div>
              {round.interviewer_ids.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  <CheckSquare className="h-3 w-3 inline mr-1" />
                  {round.interviewer_ids.length} selected
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Round */}
      <button
        type="button"
        onClick={handleAddRound}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" />
        Add Round
      </button>

      {/* FE-3: Helper text for multi-round forms */}
      {rounds.length > 1 && (
        <p className="text-xs text-gray-400">
          Each interviewer + template combination must be unique across rounds.
        </p>
      )}

      {/* FE-2: Duplicate assignment warning */}
      {hasDuplicateAssignments && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Same interviewer is assigned to multiple rounds with the same evaluation template.
            Use different templates or different interviewers.
          </p>
        </div>
      )}

      {/* Submit error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create Interview'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
