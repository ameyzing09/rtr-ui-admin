import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number; // For text variant
  animated?: boolean;
}

export default function Skeleton({
  variant = 'default',
  width,
  height,
  lines = 1,
  animated = true,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = `
    bg-[var(--muted)] transition-colors
    ${animated ? 'animate-pulse' : ''}
  `;

  const variants = {
    default: 'rounded',
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  };

  // Convert width/height to CSS values
  const getSize = (size: string | number | undefined) => {
    if (typeof size === 'number') return `${size}px`;
    return size;
  };

  const skeletonStyle = {
    width: getSize(width),
    height: getSize(height),
    ...style,
  };

  // Default sizes for different variants
  const defaultSizes = {
    default: { width: '100%', height: '1rem' },
    text: { width: '100%', height: '1rem' },
    circular: { width: '2.5rem', height: '2.5rem' },
    rectangular: { width: '100%', height: '8rem' },
  };

  // Apply default sizes if not provided
  if (!width && !height) {
    const defaults = defaultSizes[variant];
    skeletonStyle.width = defaults.width;
    skeletonStyle.height = defaults.height;
  }

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`
              ${baseStyles}
              ${variants[variant]}
              ${index === lines - 1 ? 'w-3/4' : 'w-full'} // Last line is shorter
            `}
            style={{
              height: getSize(height) || '1rem',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${className}
      `}
      style={skeletonStyle}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
}

// Pre-built skeleton components for common use cases
export function SkeletonText({ 
  lines = 3, 
  className = '',
  ...props 
}: Omit<SkeletonProps, 'variant'>) {
  return (
    <Skeleton
      variant="text"
      lines={lines}
      className={className}
      {...props}
    />
  );
}

export function SkeletonCircle({ 
  size = 40,
  className = '',
  ...props 
}: Omit<SkeletonProps, 'variant'> & { size?: number }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}

export function SkeletonCard({ 
  className = '',
  ...props 
}: Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={`space-y-3 ${className}`}>
      <Skeleton variant="rectangular" height={200} {...props} />
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

export function SkeletonTable({ 
  rows = 5,
  columns = 4,
  className = '',
  ...props 
}: Omit<SkeletonProps, 'variant'> & { rows?: number; columns?: number }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Table header */}
      <div className="flex space-x-3">
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton
            key={`header-${index}`}
            variant="text"
            height="1.5rem"
            className="flex-1"
            {...props}
          />
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-3">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              className="flex-1"
              {...props}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
