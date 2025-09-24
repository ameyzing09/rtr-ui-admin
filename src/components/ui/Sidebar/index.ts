// Generic Sidebar System
export { default as Sidebar } from './Sidebar';
export { default as NavigationItem } from './NavigationItem';
export * from './types';

// Re-export types for easier importing
export type {
  NavigationItem as SidebarNavigationItem,
  NavigationSection as SidebarNavigationSection,
  SidebarProps,
  SidebarHeader,
  SidebarFooter,
  SidebarTheme,
  NavigationLink,
  NavigationButton,
  NavigationCollapsible,
  NavigationDivider,
  NavigationHeader,
} from './types';
