'use client';

import { Check, X, AlertTriangle } from 'lucide-react';
import { formatOperator, formatSignalValue, getConditionStatusStyle } from '@/domain/signals/schemas';
import type { SignalCondition } from '@/domain/signals/schemas';

interface ConditionRowProps {
  condition: SignalCondition;
  className?: string;
}

export function ConditionRow({ condition, className = '' }: ConditionRowProps) {
  const style = getConditionStatusStyle(condition.met);
  const operatorSymbol = formatOperator(condition.operator);
  const expectedValue = formatSignalValue(condition.value ?? null);
  const currentValue = formatSignalValue(condition.currentValue ?? null);

  const StatusIcon = condition.met ? Check : X;

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg
        ${style.bg}
        ${className}
      `}
    >
      {/* Status Icon */}
      <div
        className={`
          flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
          ${condition.met ? 'bg-green-200' : 'bg-red-200'}
        `}
      >
        <StatusIcon className={`h-4 w-4 ${style.text}`} />
      </div>

      {/* Condition Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <code className="px-1.5 py-0.5 bg-white/50 rounded text-gray-700 font-medium">
            {condition.signal}
          </code>
          <span className="text-gray-500">{operatorSymbol}</span>
          <span className="font-medium text-gray-700">{expectedValue}</span>
        </div>

        {/* Show current value if different from expected */}
        {!condition.met && condition.currentValue !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
            <AlertTriangle className="h-3 w-3" />
            <span>
              Current value: <strong>{currentValue}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
