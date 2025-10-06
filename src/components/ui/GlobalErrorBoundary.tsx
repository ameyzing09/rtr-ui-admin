import React from 'react';
import { ErrorBanner } from './ErrorBanner';
import { ErrorMapper } from '@/lib/errors/mapper';
import type { AppError } from '@/lib/errors/types';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

interface GlobalErrorBoundaryState {
  error: AppError | null;
}

export class GlobalErrorBoundary extends React.Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown): GlobalErrorBoundaryState {
    return { error: ErrorMapper.mapError(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Log error details
    const mapped = ErrorMapper.mapError(error);
    ErrorMapper.logError(mapped, 'GlobalErrorBoundary');
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <ErrorBanner error={this.state.error} />
          <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={this.handleReload}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
