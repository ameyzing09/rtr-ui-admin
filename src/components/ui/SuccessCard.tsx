'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy } from 'lucide-react';
import Button from '@/components/atoms/Button';

interface SuccessCardProps {
  title: string;
  description?: string;
  data: Array<{
    label: string;
    value: string;
    copyable?: boolean;
  }>;
  actions?: Array<{
    label: string;
    variant?: 'primary' | 'outline';
    onClick: () => void;
  }>;
  onCopy?: (value: string) => void;
}

export default function SuccessCard({
  title,
  description,
  data,
  actions,
  onCopy,
}: SuccessCardProps) {
  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    onCopy?.(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-[var(--app-fg)] mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-[var(--muted-foreground)] mb-8">
            {description}
          </p>
        )}

        <div className="bg-[var(--muted)] rounded-lg p-6 space-y-4 text-left mb-8">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="font-medium text-[var(--app-fg)]">
                {item.label}:
              </span>
              <div className="flex items-center gap-2">
                <code className="bg-[var(--card)] px-2 py-1 rounded text-sm font-mono">
                  {item.value}
                </code>
                {item.copyable !== false && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Copy}
                    onClick={() => handleCopy(item.value)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {actions && actions.length > 0 && (
          <div className="flex gap-4 justify-center">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}