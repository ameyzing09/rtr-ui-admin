'use client';

import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function Form({ children, onSubmit, className = '', ...props }: FormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) {
      event.preventDefault();
      onSubmit(event);
    }
  };

  return (
    <form 
      className={`space-y-4 ${className}`} 
      onSubmit={handleSubmit}
      {...props}
    >
      {children}
    </form>
  );
}

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className = '' }: FormActionsProps) {
  return (
    <div className={`flex items-center gap-3 pt-4 ${className}`}>
      {children}
    </div>
  );
}