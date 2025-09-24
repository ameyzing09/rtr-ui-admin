import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  description?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'highlighted';
}

export default function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  description = 'from last month',
  className = '',
  variant = 'default',
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-[var(--card)] border border-[var(--border)] hover:opacity-95';
      case 'highlighted':
        // Emphasized look with brand-accented border and deeper shadow
        return 'relative overflow-hidden bg-[var(--card)] border border-[var(--ring)] shadow-lg';
      default:
        return 'bg-[var(--card)] border border-[var(--border)] hover:shadow-md';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-gray-50 text-gray-600';
      case 'highlighted':
        return 'bg-[var(--muted)] text-[var(--ring)]';
      default:
        return 'bg-blue-50 text-blue-600';
    }
  };

  const getTrendStyles = () => {
    if (trend === 'neutral') return 'text-[var(--muted-foreground)]';
    return trend === 'up' ? 'text-[var(--primary)]' : 'text-[var(--danger)]';
  };

  return (
    <div
      className={`
        rounded-lg p-6 shadow-sm transition-all duration-200
        ${getVariantStyles()}
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--card-foreground)]">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${getIconStyles()}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {change && (
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendStyles()}`}>
            {TrendIcon && <TrendIcon className="w-4 h-4" />}
            {change}
          </div>
          <span className="text-sm text-[var(--muted-foreground)]">{description}</span>
        </div>
      )}
    </div>
  );
}
