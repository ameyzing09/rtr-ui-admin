import { LucideIcon } from 'lucide-react';

export type NavigationItemType = 'link' | 'button' | 'divider' | 'header' | 'collapsible';

export interface BaseNavigationItem {
  id: string;
  type: NavigationItemType;
  isVisible?: boolean;
  permissions?: string[];
  className?: string;
}

export interface NavigationLink extends BaseNavigationItem {
  type: 'link';
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  isActive?: boolean;
  isDisabled?: boolean;
  target?: '_blank' | '_self';
  exactMatch?: boolean;
  description?: string;
  shortcut?: string;
}

export interface NavigationButton extends BaseNavigationItem {
  type: 'button';
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  isDisabled?: boolean;
  isLoading?: boolean;
  description?: string;
  shortcut?: string;
}

export interface NavigationDivider extends BaseNavigationItem {
  type: 'divider';
  label?: string;
}

export interface NavigationHeader extends BaseNavigationItem {
  type: 'header';
  label: string;
  icon?: LucideIcon;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface NavigationCollapsible extends BaseNavigationItem {
  type: 'collapsible';
  label: string;
  icon?: LucideIcon;
  children: NavigationItem[];
  defaultOpen?: boolean;
  badge?: {
    text: string;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  description?: string;
}

export type NavigationItem = 
  | NavigationLink 
  | NavigationButton 
  | NavigationDivider 
  | NavigationHeader 
  | NavigationCollapsible;

export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  isVisible?: boolean;
  permissions?: string[];
  className?: string;
}

export interface SidebarHeader {
  title?: string;
  subtitle?: string;
  logo?: {
    src?: string;
    alt?: string;
    component?: React.ComponentType;
  };
  actions?: NavigationButton[];
}

export interface SidebarFooter {
  items?: NavigationItem[];
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  actions?: NavigationButton[];
}

export interface SidebarTheme {
  background?: string;
  border?: string;
  text?: string;
  textMuted?: string;
  hover?: string;
  active?: string;
  accent?: string;
}

export interface SidebarProps {
  // Structure
  sections: NavigationSection[];
  header?: SidebarHeader;
  footer?: SidebarFooter;
  
  // Behavior
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  defaultCollapsed?: boolean;
  
  // Appearance
  variant?: 'default' | 'minimal' | 'compact' | 'detailed';
  theme?: SidebarTheme;
  width?: string;
  collapsedWidth?: string;
  
  // Responsive
  isMobile?: boolean;
  hideOnMobile?: boolean;
  overlayOnMobile?: boolean;
  
  // Customization
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  
  // Events
  onItemClick?: (item: NavigationItem) => void;
  onSectionToggle?: (sectionId: string, isOpen: boolean) => void;
  
  // Advanced
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  enableDragReorder?: boolean;
  onReorder?: (sections: NavigationSection[]) => void;
}
