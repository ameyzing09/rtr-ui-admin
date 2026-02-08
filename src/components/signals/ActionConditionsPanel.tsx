'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Lock } from 'lucide-react';
import { ConditionRow } from './ConditionRow';
import { getOutcomeTypeStyle } from '@/domain/tracking/schemas';
import type { AvailableActionWithSignals } from '@/domain/signals/schemas';
import Card from '@/components/ui/Card';

interface ActionConditionsPanelProps {
  actions: AvailableActionWithSignals[];
  className?: string;
}

export function ActionConditionsPanel({
  actions,
  className = '',
}: ActionConditionsPanelProps) {
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());

  const toggleAction = (actionCode: string) => {
    setExpandedActions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(actionCode)) {
        newSet.delete(actionCode);
      } else {
        newSet.add(actionCode);
      }
      return newSet;
    });
  };

  const availableCount = actions.filter((a) => a.signalsMet).length;
  const blockedCount = actions.length - availableCount;

  return (
    <div className={`space-y-4 ${className}`} data-testid="action-conditions-panel">
      {/* Summary Header */}
      <div className="flex items-center gap-4" data-testid="action-conditions-summary">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <span className="text-lg font-semibold text-gray-900" data-testid="available-count">{availableCount}</span>
            <span className="text-sm text-gray-500 ml-1">available</span>
          </div>
        </div>
        {blockedCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <span className="text-lg font-semibold text-gray-900" data-testid="blocked-count">{blockedCount}</span>
              <span className="text-sm text-gray-500 ml-1">blocked</span>
            </div>
          </div>
        )}
      </div>

      {/* Action List */}
      <div className="space-y-2">
        {actions.map((action) => {
          const isExpanded = expandedActions.has(action.actionCode);
          const style = getOutcomeTypeStyle(action.outcomeType);
          const hasConditions = action.signalConditions.length > 0;
          const metConditions = action.signalConditions.filter((c) => c.met);
          const unmetConditions = action.signalConditions.filter((c) => !c.met);

          return (
            <Card key={action.actionCode} className="overflow-hidden" data-testid={`action-panel-${action.actionCode}`}>
              {/* Action Header */}
              <button
                onClick={() => hasConditions && toggleAction(action.actionCode)}
                disabled={!hasConditions}
                className={`
                  w-full flex items-center gap-3 p-4 text-left
                  ${hasConditions ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}
                `}
                data-testid="action-expand-btn"
              >
                {/* Expand Icon */}
                {hasConditions ? (
                  isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )
                ) : (
                  <div className="w-5" />
                )}

                {/* Status Icon */}
                {action.signalsMet ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                )}

                {/* Action Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900" data-testid="action-display-name">
                      {action.displayName}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
                      data-testid="action-outcome-type"
                    >
                      {action.outcomeType}
                    </span>
                    {action.isTerminal && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700" data-testid="action-final-badge">
                        Final
                      </span>
                    )}
                  </div>
                  {action.description && (
                    <p className="text-sm text-gray-500 truncate">{action.description}</p>
                  )}
                </div>

                {/* Condition Count */}
                {hasConditions && (
                  <div className="flex-shrink-0 text-xs text-gray-400" data-testid="action-condition-count">
                    {metConditions.length}/{action.signalConditions.length} met
                  </div>
                )}
              </button>

              {/* Expanded Conditions */}
              {isExpanded && hasConditions && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-2" data-testid="action-conditions-expanded">
                  {/* Unmet conditions first */}
                  {unmetConditions.length > 0 && (
                    <div className="space-y-2" data-testid="unmet-conditions">
                      <p className="text-xs font-medium text-red-600 uppercase tracking-wide">
                        Missing Requirements
                      </p>
                      {unmetConditions.map((condition, idx) => (
                        <ConditionRow
                          key={`${condition.signalKey}-${idx}`}
                          condition={condition}
                        />
                      ))}
                    </div>
                  )}

                  {/* Met conditions */}
                  {metConditions.length > 0 && (
                    <div className="space-y-2" data-testid="met-conditions">
                      {unmetConditions.length > 0 && (
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide mt-4">
                          Met Requirements
                        </p>
                      )}
                      {metConditions.map((condition, idx) => (
                        <ConditionRow
                          key={`${condition.signalKey}-${idx}`}
                          condition={condition}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
