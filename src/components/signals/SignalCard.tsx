'use client';

import { Clock, User } from 'lucide-react';
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
    if (signal.type === 'boolean') {
      return signal.value ? 'text-green-700' : 'text-red-700';
    }
    if (signal.type === 'numeric') {
      return 'text-blue-700 font-mono';
    }
    return 'text-gray-900';
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {signal.description || signal.key}
            </h4>
            <SourceBadge source={signal.source} />
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
              {signal.key}
            </code>
            <span className="text-gray-300">•</span>
            <span className="capitalize">{signal.type}</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-semibold ${getValueStyle()}`}>
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
        {signal.setByName && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{signal.setByName}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
