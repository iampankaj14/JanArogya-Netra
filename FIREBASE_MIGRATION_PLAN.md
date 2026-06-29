# Firebase & AI Migration Blueprint

This blueprint outlines the migration strategy to transition the application from **offline mock dummy data** to a **production Firebase + Google Cloud Vertex AI infrastructure** with zero modifications to the UI presentation screens.

---

## 🗺️ Migration Sequence

```
+---------------------------------------------------------------+
|                       Phase 1: Mock State                     |
|  - UI consumes Custom Hooks                                   |
|  - Hooks read from /dummy database                            |
+---------------------------------------------------------------+
                               |
                               v
+---------------------------------------------------------------+
|                    Phase 2: Repositories Layer                |
|  - Create services/repositories/                              |
|  - Connect Firestore SDK to fetch records                     |
+---------------------------------------------------------------+
                               |
                               v
+---------------------------------------------------------------+
|                      Phase 3: Hooks Redirect                  |
|  - Update Custom Hooks to fetch from Repositories             |
|  - UI receives identical typings (No UI modifications)         |
+---------------------------------------------------------------+
                               |
                               v
+---------------------------------------------------------------+
|                     Phase 4: Cloud Functions                  |
|  - Migrate analytical logic (Redistribution Engine)           |
|  - Trigger Vertex AI Gemini predictions                       |
+---------------------------------------------------------------+
```

---

## ⚡ Step-by-Step Implementation Guide

### Step 1: Initialize Firestore Collection Schema
Create the root collections in Firestore:
- `/users`: Profile documents.
- `/facilities`: Geolocation Coordinates, bed counts, status, and health scores.
- `/alerts`: Outbreaks, stock shortages, weather, and incidents.
- `/inventory`: Sub-collection / reference tables mapping drug quantities per PHC.
- `/transfers`: Transaction documents mapping resource movements.

### Step 2: Implement the Repository Layer
Create database access layers (e.g. `services/repositories/phcRepository.ts`):
```typescript
import { db } from '../firebase/firebaseConfig';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { PHC } from '@/shared/types/phc';

export const phcRepository = {
  // Fetch all clinics
  getAllPHCs: async (): Promise<PHC[]> => {
    const querySnapshot = await getDocs(collection(db, 'facilities'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PHC[];
  },

  // Update a PHC parameter
  updatePHCScore: async (phcId: string, score: number): Promise<void> => {
    const ref = doc(db, 'facilities', phcId);
    await updateDoc(ref, { healthScore: score });
  }
};
```

### Step 3: Redirect the Hook Connector
Update the custom hook to use the repository instead of the dummy data:
```typescript
// hooks/usePHCs.ts
import { useEffect, useState } from 'react';
import { phcRepository } from '@/services/repositories/phcRepository';
import { PHC } from '@/shared/types/phc';

export function usePHCs() {
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    phcRepository.getAllPHCs()
      .then(setPhcs)
      .finally(() => setLoading(false));
  }, []);

  return { phcs, loading };
}
```

---

## 🧠 Vertex AI & Gemini Pipeline Integration

For conversational search queries (Netra AI) and Scenario Simulations:

1. **Cloud Function trigger**: UI queries are sent to a Firebase Cloud Function (`/functions/src/runSimulation.ts`) to avoid exposing key variables.
2. **Gemini Vertex AI execution**: The Cloud Function triggers the Vertex AI Gemini API using a system template system:
   ```typescript
   import { GoogleGenAI } from '@google/generative-ai';
   // System prompt context:
   const systemPrompt = "You are the Devgarh District Health Intelligence officer...";
   ```
3. **Structured Response output**: The Gemini model returns a structured JSON payload conforming to the `ScenarioSimulationResult` interface.
4. **UI Update**: The Cloud Function returns this JSON. The repository updates the state, and the UI displays the results using the placeholder charts.
