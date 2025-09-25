'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import type { NavigationItem } from './types';

interface NavigationItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  onItemClick?: (item: NavigationItem) => void;
  level?: number;
}

export default function NavigationItemComponent({ 
  item, 
  isCollapsed, 
  onItemClick,
  level = 0 
}: NavigationItemProps) {
  const [isOpen, setIsOpen] = useState(
    item.type === 'collapsible' ? item.defaultOpen ?? false : false
  );

  const baseIndentation = level * 12; // 12px per level
  const iconSize = isCollapsed ? 'w-5 h-5' : 'w-4 h-4';

  const renderBadge = (badge?: { text: string; variant?: string }) => {
    if (!badge || isCollapsed) return null;

    const badgeStyles = {
      default: 'bg-gray-100 text-gray-600',
      primary: 'bg-blue-100 text-blue-600',
      secondary: 'bg-purple-100 text-purple-600',
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600',
      error: 'bg-red-100 text-red-600',
    };

    return (
      <span
        className={`
          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
          ${badgeStyles[badge.variant as keyof typeof badgeStyles] || badgeStyles.default}
        `}
      >
        {badge.text}
      </span>
    );
  };

  const renderShortcut = (shortcut?: string) => {
    if (!shortcut || isCollapsed) return null;
    
    return (
      <span className="text-xs text-gray-400 font-mono hidden lg:block">
        {shortcut}
      </span>
    );
  };

  // Don't render if not visible
  if (item.isVisible === false) return null;

  // Link Item
  if (item.type === 'link') {
    const Icon = item.icon;
    const isActive = item.isActive;
    const isDisabled = item.isDisabled;

    const linkContent = (
      <div
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 group
          ${isActive 
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
            : 'text-gray-700 hover:bg-gray-50'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isCollapsed ? 'justify-center px-2' : ''}
        `}
        style={{ paddingLeft: isCollapsed ? undefined : `${12 + baseIndentation}px` }}
        onClick={() => !isDisabled && onItemClick?.(item)}
        title={isCollapsed ? item.label : item.description}
      >
        {Icon && (
          <Icon
            className={`
              ${iconSize} flex-shrink-0
              ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
            `}
          />
        )}
        {!isCollapsed && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            <div className="flex items-center gap-2">
              {renderBadge(item.badge)}
              {renderShortcut(item.shortcut)}
            </div>
          </>
        )}
      </div>
    );

    if (isDisabled) {
      return <div className={item.className}>{linkContent}</div>;
    }

    return (
      <Link
        href={item.href}
        target={item.target}
        className={item.className}
      >
        {linkContent}
      </Link>
    );
  }

  // Button Item
  if (item.type === 'button') {
    const Icon = item.icon;
    const isDisabled = item.isDisabled;
    const isLoading = item.isLoading;

    const buttonStyles = {
      default: 'text-gray-700 hover:bg-gray-50',
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      danger: 'bg-red-50 text-red-700 hover:bg-red-100',
      ghost: 'text-gray-700 hover:bg-gray-50',
    };

    return (
      <button
        onClick={() => !isDisabled && !isLoading && item.onClick()}
        disabled={isDisabled || isLoading}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonStyles[item.variant || 'default']}
          ${isCollapsed ? 'justify-center px-2' : ''}
          ${item.className || ''}
        `}
        style={{ paddingLeft: isCollapsed ? undefined : `${12 + baseIndentation}px` }}
        title={isCollapsed ? item.label : item.description}
      >
        {isLoading ? (
          <Loader2 className={`${iconSize} animate-spin flex-shrink-0`} />
        ) : Icon ? (
          <Icon className={`${iconSize} flex-shrink-0`} />
        ) : null}
        {!isCollapsed && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            {renderShortcut(item.shortcut)}
          </>
        )}
      </button>
    );
  }

  // Divider Item
  if (item.type === 'divider') {
    return (
      <div className={`my-2 ${item.className || ''}`}>
        <hr className="border-gray-200" />
        {item.label && !isCollapsed && (
          <span className="block text-xs text-gray-500 mt-2 px-3">
            {item.label}
          </span>
        )}
      </div>
    );
  }

  // Header Item
  if (item.type === 'header') {
    const Icon = item.icon;

    if (isCollapsed) {
      return Icon ? (
        <div className="flex justify-center py-2" title={item.label}>
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
      ) : null;
    }

    return (
      <div className={`px-3 py-2 ${item.className || ''}`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {item.label}
          </h3>
        </div>
        {item.description && (
          <p className="text-xs text-gray-400 mt-1">{item.description}</p>
        )}
      </div>
    );
  }

  // Collapsible Item
  if (item.type === 'collapsible') {
    const Icon = item.icon;
    const chevronIcon = isOpen ? ChevronDown : ChevronRight;
    const ChevronIcon = chevronIcon;

    return (
      <div className={item.className}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            onItemClick?.(item);
          }}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
            text-gray-700 hover:bg-gray-50 transition-all duration-200
            ${isCollapsed ? 'justify-center px-2' : ''}
          `}
          style={{ paddingLeft: isCollapsed ? undefined : `${12 + baseIndentation}px` }}
          title={isCollapsed ? item.label : item.description}
        >
          {Icon && (
            <Icon className={`${iconSize} flex-shrink-0 text-gray-400`} />
          )}
          {!isCollapsed && (
            <>
              <span className="truncate flex-1">{item.label}</span>
              <div className="flex items-center gap-2">
                {renderBadge(item.badge)}
                <ChevronIcon className="w-4 h-4 text-gray-400" />
              </div>
            </>
          )}
        </button>

        {/* Collapsible Content */}
        {isOpen && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <NavigationItemComponent
                key={child.id}
                item={child}
                isCollapsed={false}
                onItemClick={onItemClick}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
