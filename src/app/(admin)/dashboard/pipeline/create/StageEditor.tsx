'use client';

import { forwardRef } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import type { StageFormData } from '@/domain/pipelines/schemas';
import { MetadataEditor } from './MetadataEditor';

interface StageEditorProps {
  stage: StageFormData;
  index: number;
  totalStages: number;
  onChange: (updates: Partial<StageFormData>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  errors?: {
    stage?: string;
    type?: string;
    conducted_by?: string;
  };
  onBlurStageName?: () => void;
  isTouched?: boolean;
}

/**
 * Stage Editor Component
 * Renders input fields and controls for a single pipeline stage
 * Supports ref forwarding for scroll-to functionality
 */
export const StageEditor = forwardRef<HTMLDivElement, StageEditorProps>(
  function StageEditor(
    {
      stage,
      index,
      totalStages,
      onChange,
      onRemove,
      onMoveUp,
      onMoveDown,
      errors,
      onBlurStageName,
      isTouched = false,
    },
    ref
  ) {
    const isFirst = index === 0;
    const isLast = index === totalStages - 1;

    return (
      <div ref={ref} className="rounded-lg border border-gray-300 bg-white p-4">
        {/* Header with stage number and actions */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {index + 1}
          </span>
          <h4 className="text-sm font-medium text-gray-900">Stage {index + 1}</h4>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Move Up */}
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Remove stage"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stage fields */}
      <div className="space-y-4">
        {/* Stage Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stage Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Phone Screen, Technical Interview"
            value={stage.stage}
            onChange={(e) => {
              onChange({ stage: e.target.value });
              // Validate in real-time if already touched
              if (isTouched && onBlurStageName) {
                onBlurStageName();
              }
            }}
            onBlur={() => {
              if (onBlurStageName) {
                onBlurStageName();
              }
            }}
            className={`w-full rounded-lg border ${
              errors?.stage ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {errors?.stage && (
            <p className="mt-1 text-xs text-red-600">{errors.stage}</p>
          )}
        </div>

        {/* Stage Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stage Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., phone, technical, system_design, behavioral"
            value={stage.type}
            onChange={(e) => onChange({ type: e.target.value })}
            className={`w-full rounded-lg border ${
              errors?.type ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {errors?.type && (
            <p className="mt-1 text-xs text-red-600">{errors.type}</p>
          )}
        </div>

        {/* Conducted By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conducted By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., hr, interviewer, auto"
            value={stage.conducted_by}
            onChange={(e) => onChange({ conducted_by: e.target.value })}
            className={`w-full rounded-lg border ${
              errors?.conducted_by ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {errors?.conducted_by && (
            <p className="mt-1 text-xs text-red-600">{errors.conducted_by}</p>
          )}
        </div>

        {/* Metadata */}
        <MetadataEditor
          metadata={stage.metadata || {}}
          onChange={(metadata) => onChange({ metadata })}
        />
      </div>
    </div>
  );
  }
);
