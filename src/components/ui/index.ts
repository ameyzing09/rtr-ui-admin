// Generic UI Components for Dashboard
export { default as StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

export { default as ChartCard } from './ChartCard';
export type { ChartCardProps } from './ChartCard';

export { default as ActivityCard } from './ActivityCard';
export type { ActivityCardProps, ActivityItem } from './ActivityCard';

export { default as QuickActionsCard } from './QuickActionsCard';
export type { QuickActionsCardProps, QuickAction } from './QuickActionsCard';

export { default as StatusCard } from './StatusCard';
export type { StatusCardProps, StatusItem } from './StatusCard';

export { default as NotificationsCard } from './NotificationsCard';
export type { NotificationsCardProps, Notification } from './NotificationsCard';

// Generic Sidebar System
export * from './Sidebar';
export { Sidebar as GenericSidebar } from './Sidebar';
