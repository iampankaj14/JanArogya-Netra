# Application Data Flow & Ingestion Pipeline

This document explains the step-by-step lifecycle of data in **JanArogya Netra**.

---

## 🔄 Data Lifecycle Flow

```
+---------------------------------------------------------+
|                  1. User Interface (UI)                 |
|  - Renders components with state parameters             |
|  - Triggers user events (e.g. approve transfer)         |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|                  2. React Custom Hooks                  |
|  - Consumes shared contracts (Zustand State)            |
|  - Dispatches calls to service endpoints                |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|                  3. Services Layer                      |
|  - Orchestrates business rules, prompts, computations   |
|  - Delegates data storage actions                       |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|               4. Repositories Layer                     |
|  - Handles data access mechanisms (Firestore / Local)   |
|  - Transforms database items to Shared Types            |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|               5. External Integrations                  |
|  - Firestore: Real-time synchronization                 |
|  - Gemini/Vertex: Automated diagnostics                 |
+---------------------------------------------------------+
```

---

## ⚡ Step-by-Step Scenario Example: AI Recommendation Approval

1. **UI Event**: DHO clicks "Approve Transfer" on an `AIRecommendationCard` in the `Situation Room`.
2. **Hook Call**: The click triggers `approveAlert(recommendationId)` from the custom hook `useAlerts` (`hooks/useAlerts.ts`).
3. **Zustand State**: The hook updates state to `loading = true`, prompting the card to render a `LoadingSpinner`.
4. **Service Dispatch**: The hook delegates the call to the Alerts Service (`services/alertsService.ts`).
5. **Repository Write**: The service updates the `AlertItem` status to `RESOLVED` and generates a `TransferOrder` in the `transfers` sub-collection via the Repository layer (`services/repositories/transfersRepository.ts`).
6. **Firebase Firestore**: Firestore processes the transaction. A Cloud Function triggers on the new `TransferOrder` to update stock levels at the source and target PHCs.
7. **Real-time Listener**: The repository's active Firestore listener detects the document updates.
8. **State Resolution**: The listener pushes the new collections to the hook. Zustand updates state: `loading = false`, `data` is updated.
9. **UI Refresh**: The screen re-renders automatically: the card moves out of active alerts, and stock charts updated.

---

## 🔀 Swapping Dummy Data with Firebase (Zero UI Touch Strategy)

To migrate from mockup templates to live Firestore databases without touching a single pixel of UI:

1. **Strict Interfaces**: UI components *only* consume objects typed inside `shared/types/` (e.g., `PHC[]` or `AlertItem[]`).
2. **Hook Layer Isolation**: Custom hooks (e.g. `hooks/useAlerts.ts`) act as the absolute boundary.
3. **The Swap**:
   - **Initial State**:
     ```typescript
     // hooks/useAlerts.ts (Phase 2.5)
     import { dummyAlerts } from '@/dummy/alerts';
     export function useAlerts() {
       return { alerts: dummyAlerts, loading: false };
     }
     ```
   - **Production State**:
     ```typescript
     // hooks/useAlerts.ts (Phase 3+)
     import { useEffect, useState } from 'react';
     import { alertsRepository } from '@/services/repositories/alertsRepository';
     export function useAlerts() {
       const [alerts, setAlerts] = useState([]);
       useEffect(() => {
         return alertsRepository.subscribe(setAlerts);
       }, []);
       return { alerts, loading: false };
     }
     ```
4. **Result**: The layout continues rendering `{alerts.map(a => <AlertCard {...a} />)}` exactly as before. The UI remains completely untouched.
