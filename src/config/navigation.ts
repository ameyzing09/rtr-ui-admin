import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  FileText,
  CreditCard,
  Shield,
  Bell
} from 'lucide-react';
import type { NavItem } from '@/components/layout/Navbar';
import type { SideGroup } from '@/components/layout/Sidebar';

// Define navigation items for the top navbar
export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    match: 'exact',
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    match: 'startsWith',
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
    match: 'startsWith',
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    match: 'startsWith',
  },
];

// Define sidebar groups with more detailed navigation
export const sidebarGroups: SideGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        match: 'exact',
      },
      {
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
        match: 'startsWith',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Users',
        href: '/dashboard/users',
        icon: Users,
        match: 'startsWith',
      },
      {
        label: 'Content',
        href: '/dashboard/content',
        icon: FileText,
        match: 'startsWith',
      },
      {
        label: 'Billing',
        href: '/dashboard/billing',
        icon: CreditCard,
        match: 'startsWith',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Security',
        href: '/dashboard/security',
        icon: Shield,
        match: 'startsWith',
      },
      {
        label: 'Notifications',
        href: '/dashboard/notifications',
        icon: Bell,
        match: 'startsWith',
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        match: 'startsWith',
      },
    ],
  },
];
