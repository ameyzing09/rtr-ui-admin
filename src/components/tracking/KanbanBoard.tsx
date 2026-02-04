'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { StageColumn } from './StageColumn';
import { ApplicationCard } from './ApplicationCard';
import { moveStageAction } from '@/lib/actions/tracking';
import { toast } from '@/components/ui/ToastProvider';
import type {
  PipelineBoard,
  BoardApplication,
  BoardStage,
} from '@/domain/tracking/schemas';
import { isAdjacentMove, isTerminalStatus } from '@/domain/tracking/schemas';

interface KanbanBoardProps {
  board: PipelineBoard;
  onApplicationClick?: (applicationId: string) => void;
  onBoardUpdate?: () => void;
  disabled?: boolean;
}

export function KanbanBoard({
  board,
  onApplicationClick,
  onBoardUpdate,
  disabled = false,
}: KanbanBoardProps) {
  // Local state for optimistic updates
  const [stages, setStages] = useState<BoardStage[]>(board.stages);
  const [activeApplication, setActiveApplication] = useState<BoardApplication | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // Reset stages when board prop changes
  if (board.stages !== stages && !isMoving) {
    setStages(board.stages);
  }

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Find which stage an application belongs to
   */
  const findStageByApplicationId = useCallback(
    (applicationId: string): { stage: BoardStage; index: number } | null => {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        if (stage.applications.some((app) => app.applicationId === applicationId)) {
          return { stage, index: i };
        }
      }
      return null;
    },
    [stages]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const applicationId = active.id as string;

      const result = findStageByApplicationId(applicationId);
      if (result) {
        const app = result.stage.applications.find(
          (a) => a.applicationId === applicationId
        );
        if (app) {
          setActiveApplication(app);
          setActiveStageIndex(result.index);
        }
      }
    },
    [findStageByApplicationId]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveApplication(null);
      setActiveStageIndex(null);

      if (!over) return;

      const applicationId = active.id as string;

      // Determine target stage
      let targetStageId: string | null = null;
      let targetStageIndex: number | null = null;

      if (over.data.current?.type === 'stage') {
        targetStageId = over.data.current.stage.id;
        targetStageIndex = over.data.current.stageIndex;
      } else if (over.data.current?.type === 'application') {
        // Dropped on another application - find its stage
        const overAppId = over.id as string;
        const result = findStageByApplicationId(overAppId);
        if (result) {
          targetStageId = result.stage.stage.id;
          targetStageIndex = result.index;
        }
      }

      if (!targetStageId || targetStageIndex === null) return;

      // Find source stage
      const sourceResult = findStageByApplicationId(applicationId);
      if (!sourceResult) return;

      const sourceStageIndex = sourceResult.index;

      // Same stage - no action needed
      if (sourceStageIndex === targetStageIndex) return;

      // Check if adjacent move
      if (!isAdjacentMove(sourceStageIndex, targetStageIndex)) {
        toast({
          variant: 'warning',
          title: 'Invalid move',
          description: 'Applications can only be moved to adjacent stages',
        });
        return;
      }

      // Find the application
      const application = sourceResult.stage.applications.find(
        (app) => app.applicationId === applicationId
      );
      if (!application) return;

      // Check if terminal status
      if (isTerminalStatus(application.status)) {
        toast({
          variant: 'warning',
          title: 'Cannot move',
          description: 'Applications with terminal status cannot be moved',
        });
        return;
      }

      // Optimistic update
      setIsMoving(true);
      setStages((prevStages) => {
        const newStages = [...prevStages];

        // Remove from source
        const sourceApps = [...newStages[sourceStageIndex].applications];
        const appIndex = sourceApps.findIndex((a) => a.applicationId === applicationId);
        if (appIndex > -1) {
          sourceApps.splice(appIndex, 1);
          newStages[sourceStageIndex] = {
            ...newStages[sourceStageIndex],
            applications: sourceApps,
            count: sourceApps.length,
          };
        }

        // Add to target
        const targetApps = [...newStages[targetStageIndex].applications, application];
        newStages[targetStageIndex] = {
          ...newStages[targetStageIndex],
          applications: targetApps,
          count: targetApps.length,
        };

        return newStages;
      });

      // Server action
      const result = await moveStageAction(
        applicationId,
        { to_stage_id: targetStageId },
        sourceStageIndex,
        targetStageIndex
      );

      setIsMoving(false);

      if (!result.success) {
        // Rollback on error
        setStages(board.stages);
        toast({
          variant: 'error',
          title: 'Failed to move application',
          description: result.error,
        });
      } else {
        toast({
          variant: 'success',
          title: 'Application moved',
          description: `Moved to ${stages[targetStageIndex].stage.stageName}`,
        });
        onBoardUpdate?.();
      }
    },
    [board.stages, findStageByApplicationId, stages, toast, onBoardUpdate]
  );

  /**
   * Check if a stage can accept drops (adjacent only)
   */
  const canDropOnStage = useCallback(
    (stageIndex: number): boolean => {
      if (activeStageIndex === null) return false;
      return isAdjacentMove(activeStageIndex, stageIndex);
    },
    [activeStageIndex]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
        {stages.map((boardStage, index) => (
          <StageColumn
            key={boardStage.stage.id}
            stage={boardStage.stage}
            applications={boardStage.applications}
            count={boardStage.count}
            isDropTarget={activeApplication !== null}
            canDrop={activeApplication !== null && canDropOnStage(index)}
            onApplicationClick={onApplicationClick}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeApplication ? (
          <div className="opacity-80">
            <ApplicationCard
              application={activeApplication}
              stageIndex={activeStageIndex ?? 0}
              disabled
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
