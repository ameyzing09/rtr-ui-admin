import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/layout';
import type { NavItem } from '@/components/layout';

// Mock the useClientPathnameWithFallback hook
jest.mock('@/hooks/useClientPathname', () => ({
  useClientPathnameWithFallback: () => '/dashboard',
}));

const mockNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: () => <div data-testid="dashboard-icon" />,
  },
  {
    label: 'Users',
    href: '/users',
    icon: () => <div data-testid="users-icon" />,
  },
];

describe('Navbar', () => {
  it('renders the navbar with tenant name', () => {
    render(
      <Navbar
        navItems={mockNavItems}
        tenantName="Test Tenant"
      />
    );

    expect(screen.getByText('Test Tenant')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(
      <Navbar
        navItems={mockNavItems}
        tenantName="Test Tenant"
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('shows environment badge when provided', () => {
    render(
      <Navbar
        navItems={mockNavItems}
        tenantName="Test Tenant"
        environment="dev"
      />
    );

    expect(screen.getByText('DEV')).toBeInTheDocument();
  });

  it('renders mobile menu button on mobile', () => {
    render(
      <Navbar
        navItems={mockNavItems}
        tenantName="Test Tenant"
      />
    );

    // Mobile menu button should be present
    const menuButton = screen.getByLabelText('Toggle navigation menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('renders user menu button', () => {
    render(
      <Navbar
        navItems={mockNavItems}
        tenantName="Test Tenant"
      />
    );

    // User menu button should be present
    const userButtons = screen.getAllByTestId('user-icon');
    expect(userButtons.length).toBeGreaterThan(0);
  });
});
