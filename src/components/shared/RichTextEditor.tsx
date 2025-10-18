'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-lg border border-gray-300 bg-gray-100" />
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

/**
 * Rich Text Editor Component
 * Wrapper around React Quill with consistent styling
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  disabled = false,
  className = '',
  error,
}: RichTextEditorProps) {
  // Quill toolbar configuration
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
  ];

  return (
    <div className={className}>
      <div
        className={`rounded-lg border ${
          error ? 'border-red-300' : 'border-gray-300'
        } bg-white ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          theme="snow"
          className="rich-text-editor"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Custom styles for the editor */}
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-family: inherit;
        }

        .rich-text-editor .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.6;
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }

        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
