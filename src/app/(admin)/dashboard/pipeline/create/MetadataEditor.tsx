'use client';

import { X, Plus } from 'lucide-react';

interface MetadataEditorProps {
  metadata: Record<string, string>;
  onChange: (metadata: Record<string, string>) => void;
}

/**
 * Metadata Editor Component
 * Allows adding/removing key-value pairs for stage metadata
 */
export function MetadataEditor({ metadata, onChange }: MetadataEditorProps) {
  const pairs = Object.entries(metadata);

  const addPair = () => {
    // Add empty pair with temporary unique key
    const newKey = `key_${Date.now()}`;
    onChange({ ...metadata, [newKey]: '' });
  };

  const removePair = (keyToRemove: string) => {
    const newMetadata = { ...metadata };
    delete newMetadata[keyToRemove];
    onChange(newMetadata);
  };

  const updatePairKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;

    // Check if new key already exists
    if (metadata.hasOwnProperty(newKey) && newKey !== oldKey) {
      // Don't allow duplicate keys
      return;
    }

    const newMetadata = { ...metadata };
    const value = newMetadata[oldKey];
    delete newMetadata[oldKey];
    newMetadata[newKey] = value;
    onChange(newMetadata);
  };

  const updatePairValue = (key: string, value: string) => {
    onChange({ ...metadata, [key]: value });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Metadata (Optional)
        </label>
        <button
          type="button"
          onClick={addPair}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-3 w-3" />
          Add Field
        </button>
      </div>

      {pairs.length > 0 && (
        <div className="space-y-2">
          {pairs.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Key"
                value={key.startsWith('key_') ? '' : key}
                onChange={(e) => updatePairKey(key, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Value"
                value={value}
                onChange={(e) => updatePairValue(key, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removePair(key)}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Remove field"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {pairs.length === 0 && (
        <p className="text-xs text-gray-500 italic">
          No metadata fields. Click &ldquo;Add Field&rdquo; to add custom fields for this stage.
        </p>
      )}
    </div>
  );
}
