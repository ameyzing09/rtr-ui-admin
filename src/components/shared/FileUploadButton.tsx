'use client';

import { useRef, useState } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';

interface FileUploadButtonProps {
  onUpload?: (fileUrl: string) => void;
  onUploadComplete?: (fileUrl: string) => void;
  onRemove?: (fileUrl: string) => void;
  uploadedFiles?: string[];
  maxFiles?: number;
  acceptedTypes?: string[];
  accept?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * File Upload Button Component
 * Handles file selection, upload, and display
 */
export function FileUploadButton({
  onUpload,
  onUploadComplete,
  onRemove,
  uploadedFiles = [],
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx'],
  accept,
  disabled = false,
  className = '',
  children,
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use callback prop - prefer onUploadComplete if provided, fallback to onUpload
  const handleUpload = onUploadComplete || onUpload;

  // Parse accept prop if provided (e.g., ".pdf,.doc,.docx")
  const finalAcceptedTypes = accept
    ? accept.split(',').map((t) => (t.trim().startsWith('.') ? t.trim() : `.${t.trim()}`))
    : acceptedTypes;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check max files limit
    if (uploadedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Process each file
      for (const file of Array.from(files)) {
        // Validate file type
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!finalAcceptedTypes.includes(fileExtension)) {
          throw new Error(`File type ${fileExtension} not accepted`);
        }

        // Upload file to API
        const uploadUrl = await uploadFile(file);
        if (handleUpload) {
          handleUpload(uploadUrl);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (fileUrl: string) => {
    if (onRemove) {
      onRemove(fileUrl);
    }
  };

  const canUploadMore = uploadedFiles.length < maxFiles && !disabled;

  return (
    <div className={className}>
      {/* Upload Button */}
      {canUploadMore && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : children ? (
            children
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload File
            </>
          )}
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={finalAcceptedTypes.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* File Type Info */}
      <p className="mt-1 text-xs text-gray-500">
        Accepted: {finalAcceptedTypes.join(', ')} • Max {maxFiles} files
      </p>

      {/* Error Message */}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((fileUrl, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  Attachment {index + 1}
                </span>
              </div>

              {!disabled && onRemove && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(fileUrl)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// File Upload Function
// ============================================================================

/**
 * Upload file to server
 * Returns the file URL from the API
 */
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();

    // Assuming API returns { url: string }
    if (!data.url) {
      throw new Error('No URL returned from upload');
    }

    return data.url;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}
