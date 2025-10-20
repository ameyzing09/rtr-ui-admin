'use client';

import { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';

interface CustomField {
  id: string;
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean';
}

interface CustomFieldsEditorProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

/**
 * CustomFieldsEditor Component
 * Dynamic key-value pair editor for job custom fields (extra)
 *
 * Features:
 * - Add/remove fields dynamically
 * - Type selection (string, number, boolean)
 * - Field-level error display
 * - Server-side validation integration
 */
export function CustomFieldsEditor({
  value,
  onChange,
  errors = {},
  disabled = false,
}: CustomFieldsEditorProps) {
  // Convert value object to array of fields
  const [fields, setFields] = useState<CustomField[]>(() => {
    if (!value || Object.keys(value).length === 0) {
      return [];
    }

    return Object.entries(value).map(([key, val]) => ({
      id: Math.random().toString(36).substring(7),
      key,
      value: val,
      type: inferType(val),
    }));
  });

  /**
   * Infer field type from value
   */
  function inferType(val: unknown): 'string' | 'number' | 'boolean' {
    if (typeof val === 'boolean') return 'boolean';
    if (typeof val === 'number') return 'number';
    return 'string';
  }

  /**
   * Convert fields array back to object and notify parent
   */
  function updateValue(newFields: CustomField[]) {
    const newValue: Record<string, unknown> = {};

    newFields.forEach((field) => {
      if (field.key.trim() !== '') {
        newValue[field.key] = field.value;
      }
    });

    onChange(newValue);
    setFields(newFields);
  }

  /**
   * Add new empty field
   */
  function addField() {
    const newField: CustomField = {
      id: Math.random().toString(36).substring(7),
      key: '',
      value: '',
      type: 'string',
    };

    updateValue([...fields, newField]);
  }

  /**
   * Remove field by ID
   */
  function removeField(id: string) {
    updateValue(fields.filter((f) => f.id !== id));
  }

  /**
   * Update field key
   */
  function updateFieldKey(id: string, newKey: string) {
    updateValue(
      fields.map((f) => (f.id === id ? { ...f, key: newKey } : f))
    );
  }

  /**
   * Update field value
   */
  function updateFieldValue(id: string, newValue: unknown) {
    updateValue(
      fields.map((f) => (f.id === id ? { ...f, value: newValue } : f))
    );
  }

  /**
   * Update field type and convert value
   */
  function updateFieldType(id: string, newType: 'string' | 'number' | 'boolean') {
    const field = fields.find((f) => f.id === id);
    if (!field) return;

    let convertedValue: unknown = field.value;

    // Convert value to new type
    if (newType === 'boolean') {
      convertedValue = field.value === true || field.value === 'true';
    } else if (newType === 'number') {
      const num = Number(field.value);
      convertedValue = isNaN(num) ? 0 : num;
    } else {
      convertedValue = String(field.value || '');
    }

    updateValue(
      fields.map((f) =>
        f.id === id ? { ...f, type: newType, value: convertedValue } : f
      )
    );
  }

  /**
   * Get error for a specific field key
   */
  function getFieldError(key: string): string | undefined {
    // Check for extra_<key> pattern from backend errors
    return errors[`extra_${key}`] || errors[key];
  }

  /**
   * Check if field has error
   */
  function hasFieldError(key: string): boolean {
    return !!getFieldError(key);
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900">
            Custom Fields (Optional)
          </h4>
          <p className="mt-1 text-sm text-blue-700">
            Add tenant-specific custom fields for this job. These fields are validated against
            your organization&apos;s schema. Common examples: salary range, experience years, remote
            allowed, etc.
          </p>
        </div>
      </div>

      {/* General extra error */}
      {errors.extra && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errors.extra}
        </div>
      )}

      {/* Fields List */}
      {fields.length > 0 && (
        <div className="space-y-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className={`grid grid-cols-12 gap-3 rounded-lg border p-3 ${
                hasFieldError(field.key) ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Field Key */}
              <div className="col-span-4">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateFieldKey(field.id, e.target.value)}
                  disabled={disabled}
                  placeholder="Field name (e.g., salary_range)"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    hasFieldError(field.key)
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  } disabled:cursor-not-allowed disabled:bg-gray-100`}
                />
              </div>

              {/* Type Selector */}
              <div className="col-span-2">
                <select
                  value={field.type}
                  onChange={(e) =>
                    updateFieldType(
                      field.id,
                      e.target.value as 'string' | 'number' | 'boolean'
                    )
                  }
                  disabled={disabled}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="string">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>

              {/* Field Value */}
              <div className="col-span-5">
                {field.type === 'boolean' ? (
                  <div className="flex items-center h-full">
                    <input
                      type="checkbox"
                      checked={Boolean(field.value)}
                      onChange={(e) => updateFieldValue(field.id, e.target.checked)}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {Boolean(field.value) ? 'True' : 'False'}
                    </span>
                  </div>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={String(field.value || '')}
                    onChange={(e) =>
                      updateFieldValue(
                        field.id,
                        field.type === 'number' ? Number(e.target.value) : e.target.value
                      )
                    }
                    disabled={disabled}
                    placeholder={
                      field.type === 'number'
                        ? 'Enter number (e.g., 5)'
                        : 'Enter value (e.g., $100k-150k)'
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      hasFieldError(field.key)
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    } disabled:cursor-not-allowed disabled:bg-gray-100`}
                  />
                )}
              </div>

              {/* Delete Button */}
              <div className="col-span-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  disabled={disabled}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Remove field"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Field Error Message */}
              {hasFieldError(field.key) && (
                <div className="col-span-12 -mt-1 text-sm text-red-600">
                  {getFieldError(field.key)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Field Button */}
      <button
        type="button"
        onClick={addField}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Add Custom Field
      </button>

      {/* Empty State */}
      {fields.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">
            No custom fields added yet. Click &quot;Add Custom Field&quot; to get started.
          </p>
        </div>
      )}
    </div>
  );
}
