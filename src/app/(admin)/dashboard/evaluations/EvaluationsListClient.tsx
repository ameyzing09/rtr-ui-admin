'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, ChevronRight, ClipboardList } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { PendingEvaluationItem } from '@/domain/evaluation/schemas';

interface EvaluationsListClientProps {
  evaluations: PendingEvaluationItem[];
  total: number;
}

export function EvaluationsListClient({
  evaluations,
  total,
}: EvaluationsListClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvaluations = useMemo(() => {
    if (!searchQuery) return evaluations;
    const query = searchQuery.toLowerCase();
    return evaluations.filter(
      (evaluation) =>
        evaluation.applicantName.toLowerCase().includes(query) ||
        evaluation.jobTitle?.toLowerCase().includes(query) ||
        evaluation.stageName?.toLowerCase().includes(query)
    );
  }, [evaluations, searchQuery]);

  const formatDeadline = (deadline: string | null | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { text: 'Overdue', className: 'text-red-600 bg-red-50' };
    } else if (days === 0) {
      return { text: 'Due today', className: 'text-amber-600 bg-amber-50' };
    } else if (days === 1) {
      return { text: 'Due tomorrow', className: 'text-amber-600 bg-amber-50' };
    } else if (days <= 3) {
      return { text: `Due in ${days} days`, className: 'text-amber-600 bg-amber-50' };
    }
    return { text: date.toLocaleDateString(), className: 'text-gray-600 bg-gray-50' };
  };

  const handleEvaluationClick = (evaluationId: string) => {
    router.push(`/dashboard/evaluations/${evaluationId}`);
  };

  if (evaluations.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            You have no pending evaluations. Check back later when new interviews
            are completed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
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
            />
          </div>
          <span className="text-sm text-gray-500">
            {total} pending evaluation{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredEvaluations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">
              No evaluations match your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvaluations.map((evaluation) => {
              const deadline = formatDeadline(evaluation.deadline);
              return (
                <Card
                  key={evaluation.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEvaluationClick(evaluation.id)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {evaluation.applicantName}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        {evaluation.jobTitle && (
                          <span>{evaluation.jobTitle}</span>
                        )}
                        {evaluation.jobTitle && evaluation.stageName && (
                          <span className="text-gray-300">•</span>
                        )}
                        {evaluation.stageName && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {evaluation.stageName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      {deadline && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${deadline.className}`}>
                          <Clock className="h-3 w-3" />
                          {deadline.text}
                        </div>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
