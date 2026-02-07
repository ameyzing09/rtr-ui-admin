'use client';

import { Users, Hand, Cpu, ClipboardCheck } from 'lucide-react';
import type { SignalSource } from '@/domain/signals/schemas';
import { getSourceBadgeStyle } from '@/domain/signals/schemas';

interface SourceBadgeProps {
  source: SignalSource;
  className?: string;
}

const sourceIcons: Record<SignalSource, React.ElementType> = {
  AGGREGATED: Users,
  MANUAL: Hand,
  SYSTEM: Cpu,
  EVALUATION: ClipboardCheck,
};

const sourceLabels: Record<SignalSource, string> = {
  AGGREGATED: 'Aggregated',
  MANUAL: 'Manual',
  SYSTEM: 'System',
  EVALUATION: 'Evaluation',
};

export function SourceBadge({ source, className = '' }: SourceBadgeProps) {
  const style = getSourceBadgeStyle(source);
  const Icon = sourceIcons[source];
  const label = sourceLabels[source];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
        ${style.bg} ${style.text} ${style.border} border
        ${className}
      `}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
