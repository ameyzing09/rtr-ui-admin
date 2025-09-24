import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="layout-dashboard-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  User: () => <div data-testid="user-icon" />,
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
