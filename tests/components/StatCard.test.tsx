import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/ui';
import { DollarSign } from 'lucide-react';

describe('StatCard', () => {
  it('renders basic stat information', () => {
    render(
      <StatCard
        title="Total Revenue"
        value="$45,231.89"
        icon={DollarSign}
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$45,231.89')).toBeInTheDocument();
  });

  it('shows trend indicator when provided', () => {
    render(
      <StatCard
        title="Total Revenue"
        value="$45,231.89"
        change="+20.1%"
        trend="up"
        icon={DollarSign}
      />
    );

    expect(screen.getByText('+20.1%')).toBeInTheDocument();
  });

  it('applies correct variant styling', () => {
    const { container } = render(
      <StatCard
        title="Total Revenue"
        value="$45,231.89"
        icon={DollarSign}
        variant="highlighted"
      />
    );

    const statCard = container.firstChild as HTMLElement;
    expect(statCard).toHaveClass('from-blue-50', 'to-indigo-50');
  });

  it('shows description when provided', () => {
    render(
      <StatCard
        title="Total Revenue"
        value="$45,231.89"
        change="+20.1%"
        trend="up"
        icon={DollarSign}
        description="vs last quarter"
      />
    );

    expect(screen.getByText('vs last quarter')).toBeInTheDocument();
  });
});
