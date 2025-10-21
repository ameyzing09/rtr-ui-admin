'use client';

import { ChevronRight } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

interface StagePreviewStripProps {
  stages: Array<{ name: string }>;
  interactive?: boolean;
  onStageClick?: (index: number) => void;
  activeIndex?: number;
  variant?: 'default' | 'compact'; // compact for detail/list pages
}

/**
 * Stage Preview Strip Component
 * Displays pipeline stages as numbered chips in left-to-right order
 *
 * Features:
 * - Numbered chips showing stage order
 * - Truncation with tooltip for long names
 * - Interactive mode: click to scroll to stage
 * - Compact mode: wrap to multiple lines with height cap
 * - Mobile: horizontal scroll in default mode
 */
export function StagePreviewStrip({
  stages,
  interactive = false,
  onStageClick,
  activeIndex,
  variant = 'default',
}: StagePreviewStripProps) {
  if (stages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-500 text-center">
          No stages yet. Add your first stage below.
        </p>
      </div>
    );
  }

  const isCompact = variant === 'compact';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div
        className={`
          flex items-center gap-2
          ${isCompact ? 'flex-wrap max-h-20 overflow-hidden' : 'overflow-x-auto'}
        `}
      >
        {stages.map((stage, index) => {
          const stageName = stage.name || `Stage ${index + 1}`;
          const isActive = activeIndex === index;
          const isTruncated = stageName.length > 20;

          const chipContent = (
            <button
              type="button"
              onClick={() => interactive && onStageClick?.(index)}
              disabled={!interactive}
              className={`
                flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                transition-colors whitespace-nowrap
                ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${interactive ? 'cursor-pointer' : 'cursor-default'}
                ${isCompact ? 'max-w-[200px]' : 'max-w-[250px]'}
              `}
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold">
                {index + 1}
              </span>
              <span className={isTruncated ? 'truncate' : ''}>
                {stageName}
              </span>
            </button>
          );

          return (
            <div key={index} className="flex items-center gap-2">
              {isTruncated ? (
                <Tooltip content={stageName} position="top">
                  {chipContent}
                </Tooltip>
              ) : (
                chipContent
              )}

              {index < stages.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Show stage count if many stages in compact mode */}
      {isCompact && stages.length > 5 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {stages.length} stages total
        </div>
      )}
    </div>
  );
}
