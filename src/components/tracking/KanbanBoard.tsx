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
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useRouter } from 'next/navigation';
import { StageColumn } from './StageColumn';
import { ApplicationCard } from './ApplicationCard';
import { trackingService } from '@/domain/tracking/service';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/ToastProvider';
import type {
  PipelineBoard,
  BoardApplication,
  BoardStage,
} from '@/domain/tracking/schemas';

/** Defense-in-depth UUID check (Zod validates at parse time, but guard against passthrough) */
const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

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
  const { session } = useAuth();
  const router = useRouter();

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
   * Handle drag end — uses v2 action engine
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

      // Backward drag is not supported in v2 action model
      if (targetStageIndex < sourceStageIndex) {
        toast({
          variant: 'warning',
          title: 'Not supported',
          description: 'Backward moves are not supported. Use "Take Action" for other transitions.',
        });
        return;
      }

      // Only allow forward drag to next adjacent stage
      if (targetStageIndex !== sourceStageIndex + 1) {
        toast({
          variant: 'warning',
          title: 'Invalid move',
          description: 'Applications can only be advanced to the next stage',
        });
        return;
      }

      // Find the application
      const application = sourceResult.stage.applications.find(
        (app) => app.applicationId === applicationId
      );
      if (!application) return;

      // Check if terminal status
      if (application.isTerminal ?? false) {
        toast({
          variant: 'warning',
          title: 'Cannot move',
          description: 'Applications with terminal status cannot be moved',
        });
        return;
      }

      // Evaluation gate: call tracking API directly (not server action) for low latency
      const token = session?.token;
      if (!token) {
        toast({
          variant: 'error',
          title: 'Session expired',
          description: 'Please refresh the page and try again.',
        });
        return;
      }

      let actionsData: Awaited<ReturnType<typeof trackingService.getAvailableActions>>;
      try {
        actionsData = await trackingService.getAvailableActions(token, applicationId);
        const blockedEval = actionsData.requiredEvaluations.find((e) => !e.completed);
        if (blockedEval) {
          toast({
            variant: 'warning',
            title: 'Evaluations required',
            description: `Evaluation required for: ${sourceResult.stage.stage.stageName}`,
            duration: 8000,
            action: blockedEval.instanceId && isUuid(blockedEval.instanceId)
              ? {
                  label: 'Go to Evaluation',
                  onClick: () => router.push(`/dashboard/evaluations/${blockedEval.instanceId}`),
                }
              : undefined,
          });
          return;
        }
      } catch {
        toast({
          variant: 'error',
          title: 'Cannot verify evaluation status',
          description: 'An unexpected error occurred. Please try again.',
        });
        return;
      }

      // Find the advance action by actionCode — ADVANCE preferred, COMPLETE as fallback
      const advanceAction =
        actionsData.availableActions.find((a) => a.actionCode === 'ADVANCE') ??
        actionsData.availableActions.find((a) => a.actionCode === 'COMPLETE');
      if (!advanceAction) {
        toast({
          variant: 'warning',
          title: 'No advance action available',
          description: 'This application cannot be advanced from the current stage.',
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

      // Direct API call — use dynamically selected advance action
      try {
        await trackingService.executeAction(token, applicationId, { action: advanceAction.actionCode });

        setIsMoving(false);
        toast({
          variant: 'success',
          title: 'Application moved',
          description: `Moved to ${stages[targetStageIndex].stage.stageName}`,
        });
        onBoardUpdate?.();
      } catch (err) {
        setIsMoving(false);
        // Rollback on error
        setStages(board.stages);
        toast({
          variant: 'error',
          title: 'Failed to move application',
          description: err instanceof Error ? err.message : 'An unexpected error occurred',
        });
      }
    },
    [board.stages, findStageByApplicationId, stages, onBoardUpdate, session, router]
  );

  /**
   * Check if a stage can accept drops (forward adjacent only)
   */
  const canDropOnStage = useCallback(
    (stageIndex: number): boolean => {
      if (activeStageIndex === null) return false;
      // Only allow forward drag to next stage
      return stageIndex === activeStageIndex + 1;
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
            canDrop={activeApplication === null || canDropOnStage(index)}
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
