'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

/**
 * A safe wrapper around usePathname that prevents hydration mismatches
 * Returns undefined during SSR and the actual pathname after hydration
 */
export function useClientPathname(): string | undefined {
  const pathname = usePathname();
  const [clientPathname, setClientPathname] = useState<string | undefined>(undefined);

  useEffect(() => {
    setClientPathname(pathname);
  }, [pathname]);

  return clientPathname;
}

/**
 * A safe wrapper that returns the pathname with a fallback during SSR
 */
export function useClientPathnameWithFallback(fallback: string = '/'): string {
  const pathname = usePathname();
  const [clientPathname, setClientPathname] = useState<string>(fallback);

  useEffect(() => {
    setClientPathname(pathname);
  }, [pathname]);

  return clientPathname;
}
