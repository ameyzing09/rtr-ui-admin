import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

// Main Card component
export default function Card({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = `
    rounded-lg transition-all duration-200
  `;

  const variants = {
    default: `
      bg-[var(--card)] border border-[var(--border)]
    `,
    elevated: `
      bg-[var(--card)] border border-[var(--border)]
      shadow-lg hover:shadow-xl
    `,
    outline: `
      bg-transparent border border-[var(--border)]
    `,
    filled: `
      bg-[var(--muted)] border border-transparent
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header component
export function CardHeader({
  children,
  className = '',
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`flex flex-col space-y-1.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Content component
export function CardContent({
  children,
  className = '',
  ...props
}: CardContentProps) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

// Card Footer component
export function CardFooter({
  children,
  className = '',
  ...props
}: CardFooterProps) {
  return (
    <div
      className={`flex items-center ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Title component
export function CardTitle({
  children,
  as: Component = 'h3',
  className = '',
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={`
        text-lg font-semibold leading-none tracking-tight
        text-[var(--app-fg)]
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}

// Card Description component
export function CardDescription({
  children,
  className = '',
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={`
        text-sm text-[var(--muted-foreground)]
        ${className}
      `}
      {...props}
    >
      {children}
    </p>
  );
}

// Note: Components are already exported individually above
