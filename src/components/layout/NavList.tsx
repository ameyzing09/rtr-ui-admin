import React from 'react';
import { LucideIcon } from 'lucide-react';
import { isRouteActive } from '@/lib/router/active';

export interface NavListItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  exactMatch?: boolean;
  permissions?: string[];
}

export interface NavListProps {
  items: NavListItem[];
  currentPath: string;
  onItemClick?: (item: NavListItem) => void;
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showIcons?: boolean;
  showDescriptions?: boolean;
  className?: string;
}

export default function NavList({
  items,
  currentPath,
  onItemClick,
  variant = 'vertical',
  size = 'md',
  showIcons = true,
  showDescriptions = false,
  className = '',
}: NavListProps) {
  const baseItemStyles = `
    flex items-center transition-all duration-200 rounded-lg
    hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]
    text-[var(--app-fg)] hover:text-[var(--app-fg)]
  `;

  const activeItemStyles = `
    bg-[var(--primary)]/10 text-[var(--primary)]
    border-l-2 border-[var(--primary)]
  `;

  const variants = {
    horizontal: {
      container: 'flex space-x-2',
      item: 'px-3 py-2',
      content: 'flex items-center space-x-2',
    },
    vertical: {
      container: 'space-y-1',
      item: 'px-3 py-2',
      content: 'flex items-center space-x-3',
    },
  };

  const sizes = {
    sm: {
      text: 'text-sm',
      icon: 'w-4 h-4',
      description: 'text-xs',
    },
    md: {
      text: 'text-sm',
      icon: 'w-5 h-5',
      description: 'text-sm',
    },
    lg: {
      text: 'text-base',
      icon: 'w-6 h-6',
      description: 'text-sm',
    },
  };

  const handleItemClick = (item: NavListItem, event: React.MouseEvent) => {
    event.preventDefault();
    onItemClick?.(item);
    
    // Navigate to the href if no custom handler
    if (!onItemClick) {
      window.location.href = item.href;
    }
  };

  const renderItem = (item: NavListItem) => {
    const Icon = item.icon;
    const isActive = isRouteActive(currentPath, item.href, item.exactMatch);

    return (
      <li key={item.id}>
        <a
          href={item.href}
          className={`
            ${baseItemStyles}
            ${variants[variant].item}
            ${isActive ? activeItemStyles : ''}
          `}
          onClick={(e) => handleItemClick(item, e)}
          title={item.description || item.label}
        >
          <div className={variants[variant].content}>
            {showIcons && Icon && (
              <Icon 
                className={`
                  ${sizes[size].icon}
                  ${isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}
                `}
              />
            )}
            
            <div className="flex-1 min-w-0">
              <span className={`
                font-medium ${sizes[size].text}
                ${isActive ? 'text-[var(--primary)]' : ''}
              `}>
                {item.label}
              </span>
              
              {showDescriptions && item.description && (
                <p className={`
                  ${sizes[size].description}
                  text-[var(--muted-foreground)] mt-0.5
                `}>
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </a>
      </li>
    );
  };

  return (
    <nav className={className} role="navigation">
      <ul className={variants[variant].container}>
        {items.map(renderItem)}
      </ul>
    </nav>
  );
}
