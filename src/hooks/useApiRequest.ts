'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { HttpClient, type RequestConfig } from '@/lib/http/client';
import { type AppError } from '@/lib/errors/types';
import { ErrorMapper } from '@/lib/errors/mapper';

export interface UseApiRequestOptions extends Omit<RequestConfig, 'method'> {
  /** Whether to automatically fetch on mount */
  immediate?: boolean;
  /** Dependencies that trigger a refetch when changed */
  deps?: React.DependencyList;
}

export interface UseApiRequestResult<T> {
  /** The data returned from the API */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: AppError | null;
  /** Manual refetch function */
  refetch: () => Promise<void>;
  /** Manual reset function to clear data/error */
  reset: () => void;
}

/**
 * Generic hook for API requests with centralized error handling
 */
export function useApiRequest<T = unknown>(
  url: string | null,
  options: UseApiRequestOptions = {}
): UseApiRequestResult<T> {
  const {
    immediate = true,
    deps,
    ...requestConfig
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  // Track the current request to handle cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const requestConfigRef = useRef(requestConfig);

  // Update requestConfig ref when it changes
  useEffect(() => {
    requestConfigRef.current = requestConfig;
  }, [requestConfig]);

  // Set mounted ref
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!url) return;

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await HttpClient.get<T>(url, {
        ...requestConfigRef.current,
        // Note: We don't pass the signal here as HttpClient manages its own timeout
        // In a more advanced implementation, we could coordinate these
      });

      if (mountedRef.current) {
        setData(response.data);
        setError(null);
      }
    } catch (fetchError) {
      if (mountedRef.current) {
        // Check if this was an abort (cancellation)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return; // Don't set error state for cancellations
        }

        // Use the error from HttpClient if it's already mapped
        if (fetchError && typeof fetchError === 'object' && 'code' in fetchError) {
          setError(fetchError as AppError);
        } else {
          // Fallback mapping if somehow an unmapped error gets through
          const mappedError = ErrorMapper.mapError(fetchError, { url, method: 'GET' });
          setError(mappedError);
        }

        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [url]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Effect for automatic fetching
  useEffect(() => {
    if (immediate && url) {
      void fetchData();
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // Use deps if provided, otherwise default to [url]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ? [immediate, url, ...deps] : [immediate, url]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset
  };
}

/**
 * Hook for POST/PUT/PATCH/DELETE operations (mutations)
 */
export function useApiMutation<TData = unknown, TBody = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options: Omit<RequestConfig, 'method'> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const mutate = useCallback(async (body?: TBody): Promise<TData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await HttpClient.request<TData>(url, {
        ...options,
        method,
        body
      });

      if (mountedRef.current) {
        setError(null);
      }

      return response.data;
    } catch (mutationError) {
      if (mountedRef.current) {
        // Use the error from HttpClient if it's already mapped
        if (mutationError && typeof mutationError === 'object' && 'code' in mutationError) {
          setError(mutationError as AppError);
        } else {
          // Fallback mapping
          const mappedError = ErrorMapper.mapError(mutationError, { url, method });
          setError(mappedError);
        }
      }

      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, method, options]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset
  };
}