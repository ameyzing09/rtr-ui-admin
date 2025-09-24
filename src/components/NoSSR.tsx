'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Higher-order component that disables SSR for components that might have hydration issues
 * Useful for components that interact with browser APIs or have time-sensitive content
 */
function NoSSRWrapper<T extends object>(Component: ComponentType<T>) {
  const WrappedComponent = (props: T) => {
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `NoSSR(${Component.displayName || Component.name})`;

  return dynamic(() => Promise.resolve(WrappedComponent), {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    ),
  });
}

export default NoSSRWrapper;
