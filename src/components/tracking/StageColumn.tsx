'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ApplicationCard } from './ApplicationCard';
import type { PipelineStage, BoardApplication } from '@/domain/tracking/schemas';

interface StageColumnProps {
  stage: PipelineStage;
  applications: BoardApplication[];
  count: number;
  isDropTarget?: boolean;
  canDrop?: boolean;
  onApplicationClick?: (applicationId: string) => void;
  disabled?: boolean;
}

/**
 * Get stage type badge color
 */
function getStageTypeColor(stageType: string): string {
  switch (stageType.toUpperCase()) {
    case 'SCREENING':
      return 'bg-purple-100 text-purple-700';
    case 'INTERVIEW':
      return 'bg-blue-100 text-blue-700';
    case 'ASSESSMENT':
      return 'bg-orange-100 text-orange-700';
    case 'OFFER':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function StageColumn({
  stage,
  applications,
  count,
  // isDropTarget — accepted but not yet used (reserved for drag styling)
  canDrop = true,
  onApplicationClick,
  disabled = false,
}: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: {
      type: 'stage',
      stage,
      stageIndex: stage.orderIndex,
    },
    disabled: !canDrop,
  });

  const applicationIds = applications.map((app) => app.applicationId);

  return (
    <div
      data-testid={`kanban-stage-${stage.orderIndex}`}
      className={`
        flex flex-col bg-gray-50 rounded-xl min-w-[280px] max-w-[320px]
        ${isOver && canDrop ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
        ${!canDrop ? 'opacity-50' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-gray-50 rounded-t-xl z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {stage.stageName}
          </h3>
          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
            {count}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded ${getStageTypeColor(stage.stageType)}`}
        >
          {stage.stageType}
        </span>
      </div>

      {/* Applications List */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-2 space-y-2 min-h-[200px] overflow-y-auto
          ${isOver && canDrop ? 'bg-blue-50/50' : ''}
        `}
      >
        <SortableContext
          items={applicationIds}
          strategy={verticalListSortingStrategy}
        >
          {applications.length === 0 ? (
            <div className="flex items-center justify-center h-full py-8 text-sm text-gray-400">
              {isOver && canDrop ? (
                <span className="text-blue-500 font-medium">Drop here</span>
              ) : (
                <span>No applications</span>
              )}
            </div>
          ) : (
            applications.map((application) => (
              <ApplicationCard
                key={application.applicationId}
                application={application}
                stageIndex={stage.orderIndex}
                onClick={() => onApplicationClick?.(application.applicationId)}
                disabled={disabled}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Footer - Conducted By */}
      {stage.conductedBy && (
        <div className="px-3 py-2 border-t border-gray-200 text-xs text-gray-500">
          Conducted by: {stage.conductedBy}
        </div>
      )}
    </div>
  );
}
