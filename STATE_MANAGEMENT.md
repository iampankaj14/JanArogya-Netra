# State Management Blueprint

This document details the state synchronization, caching, loading, and error handling architectures.

---

## 🏛️ State Architecture Categories

We split application states into three distinct areas:

```
+-----------------------------------------------------------------+
|                      1. Local UI State                          |
|  - Managed via React: useState, useMemo                         |
|  - Targets: Modal visibility, text inputs, search queries       |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|                     2. Global Client State                      |
|  - Managed via Zustand: store/                                  |
|  - Targets: Logged-in user context, selected theme preference   |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|                     3. Remote Server State                      |
|  - Managed via React Query: @tanstack/react-query               |
|  - Targets: Active alerts, inventories, map geo-positions       |
+-----------------------------------------------------------------+
```

---

## 📦 Zustand Stores Design

Zustand handles global client-side state variables that do not require server synchronization.

### 1. Auth Store (`store/useAuthStore.ts`)
- **State**:
  - `user: User | null` (Currently logged-in user context)
  - `isAuthenticated: boolean` (Session check)
- **Actions**:
  - `setUser: (user: User) => void`
  - `clearSession: () => void`

### 2. UI Configuration Store (`store/useConfigStore.ts`)
- **State**:
  - `theme: 'light' | 'dark'`
  - `language: 'en' | 'hi'`
- **Actions**:
  - `setTheme: (theme: 'light' | 'dark') => void`
  - `toggleTheme: () => void`

---

## ⚡ React Query Strategy (Server State & Cache)

React Query manages server-side data fetching, caching, and auto-invalidation to support offline-first operations.

### 1. Cache Configuration
- **Default Stale Time**: 5 minutes (`staleTime: 1000 * 60 * 5`).
- **Background Refetching**: Auto-refetch on reconnecting (`refetchOnReconnect: true`).
- **Offline Query Fallback**: Persists cache keys in local storage using standard wrapper storage options.

### 2. Query Hooks Example
- **Fetch active alerts**:
  ```typescript
  export function useQueryAlerts() {
    return useQuery({
      queryKey: ['alerts'],
      queryFn: () => alertsRepository.getActiveAlerts(),
    });
  }
  ```
- **Redistribute Mutation**:
  ```typescript
  export function useMutationRedistribute() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (order: TransferOrder) => transfersRepository.createOrder(order),
      onSuccess: () => {
        // Invalidate and refetch alerts and inventory instantly
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      },
    });
  }
  ```

---

## 🛡️ Error & Loading State Management

- **Loading Indicator Strategy**: Primitive elements (e.g. `Button`) support the `loading` flag and display a spinner directly inside their bounds to prevent blocking screen view overlays. Heavy lists display `SkeletonCard` placeholders during initial queries.
- **Error Boundary Fallbacks**: JS script rendering failures are caught by the root `ErrorBoundary` component, rendering a clean full-screen retry option. Service layer API call failures return standard exception messages that display locally in `Snackbar` alerts without crashing the viewport.
