'use client';

import { useState, useTransition, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  listTenantsAction,
  createTenantAction,
  getTenantAction,
  updateTenantAction,
  deleteTenantAction,
  getTenantStatusAction,
  retryTenantAction,
  getSubscriptionAction,
  activateSubscriptionAction,
  suspendSubscriptionAction,
  resumeSubscriptionAction,
  cancelSubscriptionAction,
} from '@/lib/actions/tenant';
import type {
  TenantListParams,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantListResponse,
  CreateTenantResponse,
  TenantDetail,
  TenantStatusResponse,
  Subscription,
} from '@/domain/tenants/schemas';
import type { ActionResult } from '@/lib/actions/tenant';

/**
 * Hook for listing tenants with filters
 */
// export function useTenantList(params: TenantListParams = { limit: 50 }) {
//   const [data, setData] = useState<TenantListResponse | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isPending, startTransition] = useTransition();

//   // Create a stable serialized version of params to prevent infinite loops
//   // useMemo ensures this only changes when param values actually change
//   // Note: We explicitly extract primitive dependencies instead of using 'params'
//   // to avoid infinite loop (params object reference changes on every render)
//   const paramsKey = useMemo(
//     () => JSON.stringify(params),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [params.limit, params.status, params.plan, params.search]
//   );

//   const fetchTenants = useCallback(async () => {
//     setError(null);
//     startTransition(async () => {
//       const result = await listTenantsAction(params);
//       if (result.success) {
//         setData(result.data);
//       } else {
//         setError(result.error);
//       }
//     });
//   }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps
//   // Note: We use paramsKey instead of params to avoid infinite loops
//   // params is used in the function body, but paramsKey tracks changes

//   useEffect(() => {
//     fetchTenants();
//   }, [fetchTenants]);

//   return {
//     data,
//     tenants: data?.tenants || [],
//     error,
//     loading: isPending,
//     refetch: fetchTenants,
//   };
// }
export function useTenantList(params: TenantListParams = { limit: 50 }) {
  const [data, setData] = useState<TenantListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Stable key; list each primitive so React can diff without stringifying big objects
  const key = useMemo(
    () => `${params.limit ?? 50}|${params.status ?? ''}|${params.plan ?? ''}|${params.search ?? ''}`,
    [params.limit, params.status, params.plan, params.search]
  );

  // Prevent out-of-order updates (stale response wins)
  const requestId = useRef(0);

  const refetch = useCallback(() => {
    const id = ++requestId.current;
    setError(null);
    startTransition(async () => {
      const res = await listTenantsAction(params); // OK: closure updates whenever `key` changes
      if (id !== requestId.current) return;        // ignore stale response
      if (res.success) setData(res.data);
      else setError(res.error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // depends on `key` so it updates only when params meaningfully change
  // Note: ESLint warns about missing 'params' dependency, but including it would cause infinite loops
  // since params object reference changes every render. The 'key' dependency is sufficient because:
  // - key is derived from params primitives (limit, status, plan, search)
  // - when any param value changes, key changes, triggering a new callback with fresh params closure

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    tenants: data?.tenants ?? [],
    error,
    loading: isPending,
    refetch, // stable enough to pass to children
  };
}


/**
 * Hook for creating a tenant
 */
export function useCreateTenant() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const createTenant = (data: CreateTenantRequest): Promise<ActionResult<CreateTenantResponse>> => {
    return new Promise((resolve) => {
      setError(null);
      startTransition(async () => {
        const result = await createTenantAction(data);
        if (!result.success) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  return {
    createTenant,
    loading: isPending,
    error,
  };
}

/**
 * Hook for getting a single tenant
 */
export function useTenant(tenantId: string | null) {
  const [data, setData] = useState<TenantDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchTenant = useCallback(() => {
    if (!tenantId) return;

    setError(null);
    startTransition(async () => {
      const result = await getTenantAction(tenantId);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    });
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  return {
    data,
    error,
    loading: isPending,
    refetch: fetchTenant,
  };
}

/**
 * Hook for updating a tenant
 */
export function useUpdateTenant() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const updateTenant = (
    tenantId: string,
    data: UpdateTenantRequest
  ): Promise<ActionResult<TenantDetail>> => {
    return new Promise((resolve) => {
      setError(null);
      startTransition(async () => {
        const result = await updateTenantAction(tenantId, data);
        if (!result.success) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  return {
    updateTenant,
    loading: isPending,
    error,
  };
}

/**
 * Hook for deleting a tenant
 */
export function useDeleteTenant() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deleteTenant = (tenantId: string): Promise<ActionResult<{ success: boolean }>> => {
    return new Promise((resolve) => {
      setError(null);
      startTransition(async () => {
        const result = await deleteTenantAction(tenantId);
        if (!result.success) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  return {
    deleteTenant,
    loading: isPending,
    error,
  };
}

/**
 * Hook for getting tenant status
 */
export function useTenantStatus(tenantId: string | null) {
  const [data, setData] = useState<TenantStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchStatus = useCallback(() => {
    if (!tenantId) return;

    setError(null);
    startTransition(async () => {
      const result = await getTenantStatusAction(tenantId);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    });
  }, [tenantId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    data,
    error,
    loading: isPending,
    refetch: fetchStatus,
  };
}

/**
 * Hook for retrying tenant provisioning
 */
export function useRetryTenant() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const retryTenant = (tenantId: string): Promise<ActionResult<{ success: boolean }>> => {
    return new Promise((resolve) => {
      setError(null);
      startTransition(async () => {
        const result = await retryTenantAction(tenantId);
        if (!result.success) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  return {
    retryTenant,
    loading: isPending,
    error,
  };
}

/**
 * Hook for getting subscription details
 */
export function useSubscription(tenantId: string | null) {
  const [data, setData] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchSubscription = useCallback(() => {
    if (!tenantId) return;

    setError(null);
    startTransition(async () => {
      const result = await getSubscriptionAction(tenantId);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    });
  }, [tenantId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    data,
    error,
    loading: isPending,
    refetch: fetchSubscription,
  };
}

/**
 * Hook for subscription management actions
 */
export function useSubscriptionActions() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const activateSubscription = (tenantId: string): Promise<ActionResult<Subscription>> => {
    return new Promise((resolve) => {
      setError(null);
      startTransition(async () => {
        const result = await activateSubscriptionAction(tenantId);
        if (!result.success) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  const suspendSubscription = (tenantId: string): Promise<ActionResult<Subscription>> => {
    return new Promise((resolve) => {
      setError(null);
      startTransition(async () => {
        const result = await suspendSubscriptionAction(tenantId);
        if (!result.success) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  const resumeSubscription = (tenantId: string): Promise<ActionResult<Subscription>> => {
    return new Promise((resolve) => {
      setError(null);
      startTransition(async () => {
        const result = await resumeSubscriptionAction(tenantId);
        if (!result.success) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  const cancelSubscription = (tenantId: string): Promise<ActionResult<Subscription>> => {
    return new Promise((resolve) => {
      setError(null);
      startTransition(async () => {
        const result = await cancelSubscriptionAction(tenantId);
        if (!result.success) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  return {
    activateSubscription,
    suspendSubscription,
    resumeSubscription,
    cancelSubscription,
    loading: isPending,
    error,
  };
}
