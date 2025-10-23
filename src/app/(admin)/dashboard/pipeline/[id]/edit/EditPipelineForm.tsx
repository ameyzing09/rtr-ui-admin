'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { updatePipelineAction } from '@/lib/actions/pipeline';
import type { Pipeline, StageFormData } from '@/domain/pipelines/schemas';
import { parsePipelineStages } from '@/domain/pipelines/schemas';
import { StageEditor } from '../../create/StageEditor';
import { toast } from '@/components/ui/ToastProvider';
import Tooltip from '@/components/ui/Tooltip';
import { StagePreviewStrip } from '../../create/StagePreviewStrip';

interface EditPipelineFormProps {
  pipeline: Pipeline;
  redirectUrl?: string;
}

/**
 * Edit Pipeline Form Component
 * Prefills form with existing pipeline data and supports partial updates
 */
export function EditPipelineForm({ pipeline, redirectUrl }: EditPipelineFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Touch tracking for hybrid validation (onBlur first, then onChange)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [touchedStageIndices, setTouchedStageIndices] = useState<Set<number>>(new Set());

  // Refs for scrolling to stages
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Parse pipeline stages
  const pipelineWithStages = parsePipelineStages(pipeline);

  // Convert metadata from Record<string, unknown> to Record<string, string> for form
  const convertMetadataForForm = (
    metadata?: Record<string, unknown>
  ): Record<string, string> => {
    if (!metadata) return {};
    const converted: Record<string, string> = {};
    Object.entries(metadata).forEach(([key, value]) => {
      converted[key] = String(value);
    });
    return converted;
  };

  // Initial form state from pipeline data
  const [formData, setFormData] = useState({
    name: pipeline.name,
    description: pipeline.description,
    stages: pipelineWithStages.stages.map((s) => ({
      stage: s.stage,
      type: s.type,
      conducted_by: s.conducted_by,
      metadata: convertMetadataForForm(s.metadata),
    })),
  });

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [stageErrors, setStageErrors] = useState<
    Array<{
      stage?: string;
      type?: string;
      conducted_by?: string;
    }>
  >(pipelineWithStages.stages.map(() => ({})));

  // Track form dirty state by comparing with original
  useEffect(() => {
    const hasChanged =
      formData.name !== pipeline.name ||
      formData.description !== pipeline.description ||
      JSON.stringify(formData.stages) !== JSON.stringify(pipelineWithStages.stages.map((s) => ({
        stage: s.stage,
        type: s.type,
        conducted_by: s.conducted_by,
        metadata: convertMetadataForForm(s.metadata),
      })));
    setIsDirty(hasChanged);
  }, [formData, pipeline.name, pipeline.description, pipelineWithStages.stages]);

  // Update form data
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Add a new stage
  const addStage = () => {
    setFormData((prev) => ({
      ...prev,
      stages: [
        ...prev.stages,
        {
          stage: '',
          type: '',
          conducted_by: '',
          metadata: {},
        },
      ],
    }));
    setStageErrors((prev) => [...prev, {}]);
  };

  // Remove a stage
  const removeStage = (index: number) => {
    if (formData.stages.length === 1) {
      toast({
        title: 'Cannot remove stage',
        description: 'Pipeline must have at least one stage',
        variant: 'warning',
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index),
    }));
    setStageErrors((prev) => prev.filter((_, i) => i !== index));
  };

  // Move stage up
  const moveStageUp = (index: number) => {
    if (index === 0) return;

    setFormData((prev) => {
      const newStages = [...prev.stages];
      [newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]];
      return { ...prev, stages: newStages };
    });

    setStageErrors((prev) => {
      const newErrors = [...prev];
      [newErrors[index - 1], newErrors[index]] = [newErrors[index], newErrors[index - 1]];
      return newErrors;
    });
  };

  // Move stage down
  const moveStageDown = (index: number) => {
    if (index === formData.stages.length - 1) return;

    setFormData((prev) => {
      const newStages = [...prev.stages];
      [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
      return { ...prev, stages: newStages };
    });

    setStageErrors((prev) => {
      const newErrors = [...prev];
      [newErrors[index], newErrors[index + 1]] = [newErrors[index + 1], newErrors[index]];
      return newErrors;
    });
  };

  // Update a specific stage
  const updateStage = (index: number, updates: Partial<StageFormData>) => {
    setFormData((prev) => ({
      ...prev,
      stages: prev.stages.map((stage, i) =>
        i === index ? { ...stage, ...updates } : stage
      ),
    }));

    // Clear errors for updated fields
    if (updates.stage !== undefined && stageErrors[index]?.stage) {
      setStageErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], stage: undefined };
        return newErrors;
      });
    }
    if (updates.type !== undefined && stageErrors[index]?.type) {
      setStageErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], type: undefined };
        return newErrors;
      });
    }
    if (updates.conducted_by !== undefined && stageErrors[index]?.conducted_by) {
      setStageErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], conducted_by: undefined };
        return newErrors;
      });
    }
  };

  // Check if form is valid for enabling/disabling save button
  const isFormValid = (): boolean => {
    // Name: 3-255 chars
    if (!formData.name || formData.name.trim().length < 3 || formData.name.length > 255) {
      return false;
    }

    // Description: max 1000 chars
    if (formData.description && formData.description.length > 1000) {
      return false;
    }

    // Stages: must have at least 1
    if (formData.stages.length === 0) {
      return false;
    }

    // Each stage: stage name cannot be blank (per user requirement)
    for (const stage of formData.stages) {
      if (!stage.stage || stage.stage.trim() === '') {
        return false;
      }
    }

    return true;
  };

  // Get validation issues for tooltip
  const getValidationIssues = (): string[] => {
    const issues: string[] = [];

    if (!formData.name || formData.name.trim().length < 3) {
      issues.push('Name must be at least 3 characters');
    } else if (formData.name.length > 255) {
      issues.push('Name is too long (max 255 characters)');
    }

    if (formData.description && formData.description.length > 1000) {
      issues.push('Description is too long (max 1000 characters)');
    }

    if (formData.stages.length === 0) {
      issues.push('At least one stage is required');
    }

    const emptyStageCount = formData.stages.filter(s => !s.stage || s.stage.trim() === '').length;
    if (emptyStageCount > 0) {
      issues.push(`${emptyStageCount} stage${emptyStageCount > 1 ? 's have' : ' has'} blank name`);
    }

    return issues;
  };

  // Field-level validation for name
  const validateNameField = (value: string) => {
    if (!touchedFields.has('name')) return;

    if (!value || value.trim().length < 3) {
      setFieldErrors(prev => ({ ...prev, name: 'Name must be at least 3 characters' }));
    } else if (value.length > 255) {
      setFieldErrors(prev => ({ ...prev, name: 'Name must be at most 255 characters' }));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name: _name, ...rest } = fieldErrors;
      setFieldErrors(rest);
    }
  };

  // Field-level validation for description
  const validateDescriptionField = (value: string) => {
    if (!touchedFields.has('description')) return;

    if (value && value.length > 1000) {
      setFieldErrors(prev => ({ ...prev, description: 'Description must be at most 1000 characters' }));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description: _description, ...rest } = fieldErrors;
      setFieldErrors(rest);
    }
  };

  // Field-level validation for stage name
  const validateStageName = (index: number) => {
    if (!touchedStageIndices.has(index)) return;

    const stage = formData.stages[index];
    const newStageErrors = [...stageErrors];

    if (!stage.stage || stage.stage.trim() === '') {
      newStageErrors[index] = { ...newStageErrors[index], stage: 'Stage name is required' };
    } else if (stage.stage.length > 100) {
      newStageErrors[index] = { ...newStageErrors[index], stage: 'Stage name must be at most 100 characters' };
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { stage: _stage, ...rest } = newStageErrors[index] || {};
      newStageErrors[index] = rest;
    }

    setStageErrors(newStageErrors);
  };

  // Handle stage click - scroll to stage editor
  const handleStageClick = useCallback((index: number) => {
    const stageElement = stageRefs.current[index];
    if (stageElement) {
      stageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      // Focus the stage name input after scrolling
      const nameInput = stageElement.querySelector('input[type="text"]') as HTMLInputElement;
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 300);
      }
    }
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const newStageErrors: Array<{
      stage?: string;
      type?: string;
      conducted_by?: string;
    }> = [];

    // Validate name
    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    } else if (formData.name.length > 255) {
      errors.name = 'Name must be at most 255 characters';
    }

    // Validate description
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be at most 1000 characters';
    }

    // Validate stages
    if (formData.stages.length === 0) {
      errors.stages = 'At least one stage is required';
    }

    formData.stages.forEach((stage, index) => {
      const stageError: {
        stage?: string;
        type?: string;
        conducted_by?: string;
      } = {};

      if (!stage.stage || stage.stage.trim() === '') {
        stageError.stage = 'Stage name is required';
      } else if (stage.stage.length > 100) {
        stageError.stage = 'Stage name must be at most 100 characters';
      }

      if (!stage.type || stage.type.trim() === '') {
        stageError.type = 'Stage type is required';
      } else if (stage.type.length > 50) {
        stageError.type = 'Stage type must be at most 50 characters';
      }

      if (!stage.conducted_by || stage.conducted_by.trim() === '') {
        stageError.conducted_by = 'Conducted by is required';
      } else if (stage.conducted_by.length > 50) {
        stageError.conducted_by = 'Conducted by must be at most 50 characters';
      }

      newStageErrors[index] = stageError;
    });

    setFieldErrors(errors);
    setStageErrors(newStageErrors);

    const hasStageErrors = newStageErrors.some(
      (err) => err.stage || err.type || err.conducted_by
    );

    return Object.keys(errors).length === 0 && !hasStageErrors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation error',
        description: 'Please check the form for errors',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare update payload (supports partial updates)
      const payload = {
        name: formData.name,
        description: formData.description,
        stages: formData.stages.map((s) => ({
          stage: s.stage,
          type: s.type,
          conducted_by: s.conducted_by,
          // Only include metadata if it has entries
          metadata:
            s.metadata && Object.keys(s.metadata).length > 0 ? s.metadata : undefined,
        })),
      };

      // Submit to server action
      const result = await updatePipelineAction(pipeline.id, payload);

      if (result.success) {
        // Show success toast
        toast({
          title: 'Pipeline updated successfully!',
          description: `${result.data.name} has been updated.`,
          variant: 'success',
        });

        // Redirect based on priority:
        // 1. redirectUrl param if present
        // 2. Pipeline details page
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push(`/dashboard/pipeline/${pipeline.id}`);
        }
      } else {
        // Handle server-side errors
        if (result.fieldErrors) {
          // Convert fieldErrors from Record<string, string[]> to Record<string, string>
          const convertedErrors: Record<string, string> = {};
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            convertedErrors[field] = Array.isArray(errors) ? errors.join(', ') : errors;
          });
          setFieldErrors(convertedErrors);
        }

        toast({
          title: 'Failed to update pipeline',
          description: result.error,
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);

      toast({
        title: 'Submission error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isDirty) {
      if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
        // Redirect to details page or custom redirect
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push(`/dashboard/pipeline/${pipeline.id}`);
        }
      }
    } else {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(`/dashboard/pipeline/${pipeline.id}`);
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href={redirectUrl || `/dashboard/pipeline/${pipeline.id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">
            Modify pipeline stages and settings
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pipeline Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Senior Engineer Pipeline"
              value={formData.name}
              onChange={(e) => {
                updateFormData({ name: e.target.value });
                // Validate in real-time if already touched
                if (touchedFields.has('name')) {
                  validateNameField(e.target.value);
                }
              }}
              onBlur={() => {
                setTouchedFields(prev => new Set(prev).add('name'));
                validateNameField(formData.name);
              }}
              className={`w-full rounded-lg border ${
                fieldErrors.name ? 'border-red-300' : 'border-gray-300'
              } px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              placeholder="Brief description of this pipeline..."
              value={formData.description}
              onChange={(e) => {
                updateFormData({ description: e.target.value });
                // Validate in real-time if already touched
                if (touchedFields.has('description')) {
                  validateDescriptionField(e.target.value);
                }
              }}
              onBlur={() => {
                setTouchedFields(prev => new Set(prev).add('description'));
                validateDescriptionField(formData.description);
              }}
              rows={3}
              className={`w-full rounded-lg border ${
                fieldErrors.description ? 'border-red-300' : 'border-gray-300'
              } px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          {/* Stages */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Interview Stages <span className="text-red-500">*</span>
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Define the stages candidates will go through in this pipeline
                </p>
              </div>
            </div>

            {/* Stage Preview Strip */}
            <div className="mb-4">
              <StagePreviewStrip
                stages={formData.stages.map(s => ({ name: s.stage }))}
                interactive={true}
                onStageClick={handleStageClick}
              />
            </div>

            <div className="space-y-4">
              {formData.stages.map((stage, index) => (
                <StageEditor
                  key={index}
                  ref={(el) => { stageRefs.current[index] = el; }}
                  stage={stage}
                  index={index}
                  totalStages={formData.stages.length}
                  onChange={(updates) => updateStage(index, updates)}
                  onRemove={() => removeStage(index)}
                  onMoveUp={() => moveStageUp(index)}
                  onMoveDown={() => moveStageDown(index)}
                  errors={stageErrors[index]}
                  onBlurStageName={() => {
                    setTouchedStageIndices(prev => new Set(prev).add(index));
                    validateStageName(index);
                  }}
                  isTouched={touchedStageIndices.has(index)}
                />
              ))}

              {/* Add Stage Button */}
              <button
                type="button"
                onClick={addStage}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-medium text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                <Plus className="h-5 w-5" />
                Add Stage
              </button>
            </div>

            {fieldErrors.stages && (
              <p className="mt-2 text-sm text-red-600">{fieldErrors.stages}</p>
            )}
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-white pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <Tooltip
              content={
                !isFormValid() ? (
                  <div className="max-w-xs">
                    <div className="font-semibold mb-1">Cannot save:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {getValidationIssues().map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : undefined
              }
              position="top"
              disabled={isFormValid()}
            >
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Pipeline'}
              </button>
            </Tooltip>
          </div>
        </form>
      </div>
    </div>
  );
}
