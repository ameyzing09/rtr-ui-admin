# Multi-Tenant SaaS Navbar & Sidebar System

A production-ready, highly customizable, responsive Navbar and Sidebar system for multi-tenant SaaS applications built with Next.js App Router, TypeScript, and Tailwind CSS.

## ✨ Features

- **Glassmorphism Navbar**: Centered "pill" design with subtle glass effect
- **Responsive Design**: Mobile-first approach with hamburger menu and drawer
- **Multi-tenant Theming**: CSS variables with easy theme switching
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **TypeScript**: Strict typing with no `any` types
- **Flex Layout**: Modern CSS flexbox for all layouts
- **Icon Support**: Lucide React icons with customizable nav items

## 🚀 Quick Start

### 1. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/dashboard` to see the navbar and sidebar in action.

### 2. Theme Switching

The dashboard page includes a theme demo that lets you switch between different tenant themes to see the glassmorphism effect change colors.

## 📁 File Structure

```
src/
├── app/
│   └── (admin)/
│       └── dashboard/
│           ├── layout.tsx        # Server layout wrapper
│           └── page.tsx          # Demo dashboard page
├── components/
│   └── layout/
│       ├── Navbar.tsx            # Glassmorphism navbar component
│       ├── Sidebar.tsx           # Responsive sidebar component
│       ├── MobileDrawer.tsx      # Mobile navigation drawer
│       ├── DashboardShell.tsx    # Client wrapper for layout
│       └── ThemeDemo.tsx         # Theme switching demo
├── config/
│   └── navigation.ts             # Navigation configuration
├── lib/
│   └── theme/
│       └── tokens.ts             # Theme types and utilities
└── styles/
    └── themes.css                # CSS variables and .glass-pill class
```

## 🎨 Theming

### CSS Variables

The system uses CSS variables for easy customization:

```css
:root {
  --color-primary: 59 130 246;     /* blue-500 */
  --color-secondary: 168 85 247;   /* purple-500 */
  --bg: 249 250 251;               /* gray-50 */
  --fg: 17 24 39;                  /* gray-900 */
  --border: 229 231 235;           /* gray-200 */
  --muted: 156 163 175;            /* gray-400 */
  --radius-pill: 100px;
  --radius-md: 0.5rem;
}
```

### Tenant Themes

Switch themes by setting the `data-tenant` attribute:

```typescript
import { applyTheme } from '@/lib/theme/tokens';

// Apply tenant theme
applyTheme('tenant-a'); // Red theme
applyTheme('tenant-b'); // Green theme
applyTheme('tenant-c'); // Purple theme
```

### Glassmorphism Effect

The `.glass-pill` class provides the signature glass effect:

```css
.glass-pill {
  background: rgba(255, 252, 252, 0.10);
  box-shadow:
    0px 8px 13px rgba(0, 0, 0, 0.25),
    inset 4px 5px 6px rgba(0, 0, 0, 0.40),
    inset -1px -3px 4px rgba(255, 255, 255, 0.40);
  backdrop-filter: blur(3.75px);
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## 🔧 Configuration

### Navigation Items

Configure navbar items in `src/config/navigation.ts`:

```typescript
export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    match: 'exact',
  },
  // Add more items...
];
```

### Sidebar Groups

Configure sidebar sections:

```typescript
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
      // Add more items...
    ],
  },
  // Add more groups...
];
```

## 📱 Responsive Behavior

### Desktop (lg+)
- Centered glass pill navbar
- Fixed sidebar with collapse functionality
- Flex layout with sidebar + main content

### Tablet/Mobile (md and below)
- Standard top bar with hamburger menu
- Collapsible sidebar becomes full-screen drawer
- Focus trap and ESC key support

## ♿ Accessibility Features

- **Keyboard Navigation**: Tab through all interactive elements
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Clear focus indicators and logical tab order
- **Focus Trap**: Mobile drawer traps focus and closes with ESC
- **Semantic HTML**: Proper use of nav, button, and landmark elements

## 🎯 Customization

### Adding New Themes

1. Add CSS variables in `src/styles/themes.css`:

```css
[data-tenant="new-tenant"] {
  --color-primary: 34 197 94; /* green-500 */
  --color-secondary: 6 182 212; /* cyan-500 */
}
```

2. Update theme types in `src/lib/theme/tokens.ts`:

```typescript
export type Theme = 'default' | 'tenant-a' | 'tenant-b' | 'tenant-c' | 'new-tenant';
```

### Custom Icons

Replace icons in navigation configuration:

```typescript
import { MyCustomIcon } from 'my-icon-library';

const navItems: NavItem[] = [
  {
    label: 'Custom Page',
    href: '/custom',
    icon: MyCustomIcon,
  },
];
```

## 🔒 Production Considerations

### TODOs for Production

1. **Authentication**: Replace demo user data with real auth system
2. **Tenant Management**: Implement proper tenant detection and loading
3. **Logo Handling**: Add tenant logo upload and management
4. **Route Protection**: Add authentication guards to layout
5. **Error Boundaries**: Implement error handling for navigation failures
6. **Performance**: Add image optimization with Next.js Image component

### Environment Setup

The layout automatically detects development environment and shows a "DEV" badge. Configure for staging/production:

```typescript
const environment = process.env.NODE_ENV === 'development' ? 'dev' : 
                   process.env.VERCEL_ENV === 'preview' ? 'staging' : 'prod';
```

## 📦 Dependencies

- **Next.js 15+**: App Router with TypeScript
- **React 19+**: Client components with hooks
- **Tailwind CSS 4+**: Utility-first styling
- **Lucide React**: Icon library
- **TypeScript**: Strict typing enabled

## 🐛 Troubleshooting

### Build Issues

If you encounter CSS syntax errors, ensure:
1. Tailwind CSS is properly configured
2. No syntax errors in `src/styles/themes.css`
3. All import paths are correct

### Hydration Errors

If you see hydration mismatches:
1. Ensure theme application happens client-side only
2. Check for differences between server and client rendering

### Icon Issues

If icons don't display:
1. Verify Lucide React is installed: `npm install lucide-react`
2. Check import paths in navigation configuration
3. Ensure icon components are properly exported

## 📄 License

This component system is designed for production use. Customize and extend as needed for your specific requirements.
