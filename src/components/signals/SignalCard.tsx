'use client';

import { Clock } from 'lucide-react';
import { SourceBadge } from './SourceBadge';
import { formatSignalValue } from '@/domain/signals/schemas';
import type { ApplicationSignal } from '@/domain/signals/schemas';
import Card from '@/components/ui/Card';

interface SignalCardProps {
  signal: ApplicationSignal;
  className?: string;
}

export function SignalCard({ signal, className = '' }: SignalCardProps) {
  const formattedValue = formatSignalValue(signal.value);
  const setAtDate = new Date(signal.setAt);

  // Determine value styling based on type
  const getValueStyle = () => {
    if (signal.value === null) {
      return 'text-gray-400 italic';
    }
    if (signal.signalType === 'boolean') {
      return signal.value ? 'text-green-700' : 'text-red-700';
    }
    if (signal.signalType === 'integer' || signal.signalType === 'float') {
      return 'text-blue-700 font-mono';
    }
    return 'text-gray-900';
  };

  return (
    <Card className={`p-4 ${className}`} data-testid={`signal-card-${signal.signalKey}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate" data-testid="signal-description">
              {signal.signalKey}
            </h4>
            <SourceBadge source={signal.sourceType} />
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600" data-testid="signal-key">
              {signal.signalKey}
            </code>
            <span className="text-gray-300">&bull;</span>
            <span className="capitalize" data-testid="signal-type">{signal.signalType}</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-semibold ${getValueStyle()}`} data-testid="signal-value">
            {formattedValue}
          </div>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {setAtDate.toLocaleDateString()} at {setAtDate.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </Card>
  );
}
