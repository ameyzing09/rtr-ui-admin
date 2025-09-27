import React from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

export interface SectionProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (isCollapsed: boolean) => void;
  variant?: 'default' | 'card' | 'borderless';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Section({
  title,
  icon: Icon,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  onToggle,
  variant = 'default',
  spacing = 'md',
  className = '',
}: SectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  const variants = {
    default: `
      border-b border-[var(--border)] last:border-b-0
    `,
    card: `
      bg-[var(--card)] border border-[var(--border)] rounded-lg
    `,
    borderless: `
      // No border styling
    `,
  };

  const spacings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const headerSpacings = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const contentSpacings = {
    none: '',
    sm: 'px-3 pb-3',
    md: 'px-4 pb-4',
    lg: 'px-6 pb-6',
  };

  return (
    <section 
      className={`
        ${variants[variant]}
        ${variant !== 'card' ? spacings[spacing] : ''}
        ${className}
      `}
    >
      {/* Section Header */}
      <div
        className={`
          flex items-center justify-between
          ${variant === 'card' ? headerSpacings[spacing] : 'mb-3'}
          ${collapsible ? 'cursor-pointer' : ''}
        `}
        onClick={collapsible ? handleToggle : undefined}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={collapsible ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        } : undefined}
        aria-expanded={collapsible ? !isCollapsed : undefined}
        aria-controls={collapsible ? `section-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
      >
        <div className="flex items-center space-x-3">
          {Icon && (
            <Icon className="w-5 h-5 text-[var(--muted-foreground)]" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-[var(--app-fg)]">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {collapsible && (
          <ChevronDown 
            className={`
              w-5 h-5 text-[var(--muted-foreground)] transition-transform duration-200
              ${isCollapsed ? '-rotate-90' : ''}
            `}
          />
        )}
      </div>

      {/* Section Content */}
      {(!collapsible || !isCollapsed) && (
        <div
          id={collapsible ? `section-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
          className={variant === 'card' ? contentSpacings[spacing] : ''}
        >
          {children}
        </div>
      )}
    </section>
  );
}

