'use client';

import { useState, useEffect } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suppressHydrationWarning?: boolean;
}

export default function ClientOnly({ 
  children, 
  fallback = null, 
  suppressHydrationWarning = true 
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div suppressHydrationWarning={suppressHydrationWarning}>{fallback}</div>;
  }

  return <div suppressHydrationWarning={suppressHydrationWarning}>{children}</div>;
}
