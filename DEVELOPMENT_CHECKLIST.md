# Development Milestone Checklist

This checklist defines the phases, development tasks, and validation criteria for the **JanArogya Netra** project.

---

## Phase 3: Session Authentication & Users
- [ ] **Config Auth Repository**: Set up Firestore `/users` collections matching roles.
- [ ] **Implement `useAuth` hook**: Build session state listeners using Firebase Auth.
- [ ] **Integrate views**: Link the mock `Login` and `Profile` screens to the active hook.
- [ ] **Completion Criteria**: Users can log in using email/password, session persistent states are saved in `SecureStore`, and the profile screen displays the correct name/role.

---

## Phase 4: Mission Control (Situation Room)
- [ ] **Config Alerts Repository**: Set up real-time listener querying the `/alerts` collection.
- [ ] **Implement `useAlerts` hook**: Fetch active alarms and connect redistribution triggers.
- [ ] **Connect UI cards**: Wire the approved `AlertCard` and `AIRecommendationCard` lists.
- [ ] **Completion Criteria**: Activating an alert in Firestore instantly renders it on the screen. Clicking "Approve" triggers a stock reallocation task.

---

## Phase 5: Operations & Facility Profiles
- [ ] **Config Facility Repository**: Set up getters/setters for the `/facilities` collection.
- [ ] **Implement `usePHCs` hook**: Expose inventories and attendance logs states.
- [ ] **Google Maps Integration**: Replace the map view with Google Maps displaying dynamic pins based on coordinates and health indices.
- [ ] **Redistribution Form Flow**: Enable manual transfers, deducting stock from source and adding it to target PHCs on approval.
- [ ] **Completion Criteria**: Clicking a map marker opens a facility overview panel. Staff attendance updates are saved to Firestore in real-time.

---

## Phase 6: Netra AI Assistant & Scenario Simulator
- [ ] **Setup Cloud Functions**: Build `askNetra` and `simulateScenario` endpoints.
- [ ] **Integrate Vertex AI SDK**: Connect the functions to Gemini models.
- [ ] **Netra Chat Panel**: Implement the interactive chat component in the UI.
- [ ] **Simulation Charts View**: Render Area/Bar charts on simulation completion.
- [ ] **Completion Criteria**: Asking Netra "What is the stock of Paracetamol in Bisrakh?" queries the database context and returns a valid natural language answer.

---

## Phase 7: Analytics & Reports
- [ ] **Weekly PDF summaries generation**: Set up Cloud Cron trigger compiling PDF metrics.
- [ ] **Firebase Storage configuration**: Save generated PDF reports.
- [ ] **Reports Screen update**: Fetch PDF downloads list in `Reports`.
- [ ] **Impact Dashboard**: Wire total capacity averages and stockout timelines.
- [ ] **Completion Criteria**: Tapping a report item downloads the PDF audit locally.

---

## Phase 8: Testing, Hardening & Deployment
- [ ] **TypeScript verification**: Verify zero errors across files.
- [ ] **ESLint & Prettier checks**: Verify clean linting.
- [ ] **Build production bundles**: Execute standard build tests:
  - iOS build: `npx expo run:ios`
  - Android build: `npx expo run:android`
- [ ] **Completion Criteria**: Clean build output. Zero errors. The application is ready to deploy to the stores.
