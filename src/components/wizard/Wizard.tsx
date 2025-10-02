'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface WizardProps {
  steps: Step[];
  currentStepId: string;
  children: React.ReactNode;
  className?: string;
}

export default function Wizard({ steps, currentStepId, children, className = '' }: WizardProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-[var(--border)]">
            <motion.div
              className="h-full bg-[var(--primary)]"
              initial={{ width: '0%' }}
              animate={{ 
                width: currentStepIndex > 0 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' 
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </div>

          {/* Step indicators */}
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div key={step.id} className="relative flex flex-col items-center">
                <motion.div
                  className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-[var(--card)]
                    ${isCompleted ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]' : ''}
                    ${isCurrent ? 'border-[var(--primary)] text-[var(--primary)]' : ''}
                    ${isPending ? 'border-[var(--border)] text-[var(--muted-foreground)]' : ''}
                  `}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </motion.div>

                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    isCurrent ? 'text-[var(--primary)]' : 
                    isCompleted ? 'text-[var(--app-fg)]' : 
                    'text-[var(--muted-foreground)]'
                  }`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-24">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        {children}
      </div>
    </div>
  );
}

interface WizardStepProps {
  stepId: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function WizardStep({ title, description, children, className = '' }: WizardStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className={className}
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--app-fg)] mb-2">{title}</h2>
        {description && (
          <p className="text-[var(--muted-foreground)]">{description}</p>
        )}
      </div>
      
      {children}
    </motion.div>
  );
}