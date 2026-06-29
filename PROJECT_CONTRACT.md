# Project Contracts (Modules Specification)

This contract defines the responsibilities, shared data structures, inputs, and outputs for all modules in **JanArogya Netra**. 

---

## 📋 Mission Control (Situation Room)

| Layer | Responsibility | Details |
|---|---|---|
| **Frontend** | Renders alerts, critical tasks, and quick actions list | Loading spinner, empty list fallbacks, pull-to-refresh |
| **Backend** | Fetches active alert queue, processes DHO approval triggers | List sorting, priority evaluation, database updates |
| **Shared Types** | `AlertItem`, `AlertPriority` | Definitions mapping alerts, priority states |
| **Inputs** | `filter: AlertPriority | 'ALL'` | Filter parameter |
| **Outputs** | `alerts: AlertItem[]`, `approveAlert: (id: string) => Promise<void>` | Active alerts list and trigger callbacks |

---

## 🗺️ District Map

| Layer | Responsibility | Details |
|---|---|---|
| **Frontend** | Google Maps canvas container, customized pins representing PHCs | Color-coded status pins (Red, Yellow, Green) |
| **Backend** | Geolocation coordinates query, stock depletion coordinates mapping | Coordinates data stream |
| **Shared Types** | `PHC`, `getHealthScoreColor` | Coordinates mapping interfaces |
| **Inputs** | `mapBounds: { ne: LatLng, sw: LatLng }` | Viewport dimensions |
| **Outputs** | `pins: PHC[]`, `selectedPHC: PHC | null` | List of facilities in view |

---

## 🏥 PHC Detail

| Layer | Responsibility | Details |
|---|---|---|
| **Frontend** | Display bed capacity fill rates, stocks list, attendance summary | Form inputs to update local data |
| **Backend** | Query particular facility, save edited staff/inventory records | Database mutations |
| **Shared Types** | `PHC`, `MedicineStock`, `AttendanceRecord` | Core details contracts |
| **Inputs** | `facilityId: string` | Facility identifier |
| **Outputs** | `phc: PHC`, `stocks: MedicineStock[]`, `attendance: AttendanceRecord[]` | Active details stream |

---

## 📊 Reports

| Layer | Responsibility | Details |
|---|---|---|
| **Frontend** | Render list of audit files, display pdf view modal overlays | Downloads trigger buttons |
| **Backend** | Compile daily PDF reports, fetch list of stored document metadata | File compilation |
| **Shared Types** | `ReportItem` | Report structure |
| **Inputs** | `type: string` | Category selector |
| **Outputs** | `reports: ReportItem[]`, `downloadReportUrl: (id: string) => string` | Audit reports metadata list |

---

## 🔔 Notifications

| Layer | Responsibility | Details |
|---|---|---|
| **Frontend** | Render alerts feed, unread badge counters in top bars | Navigation on select |
| **Backend** | Manage FCM registration tokens, send alerts on state transitions | Push messaging trigger |
| **Shared Types** | `NotificationItem` | Notification details |
| **Inputs** | `userId: string` | User session identification |
| **Outputs** | `notifications: NotificationItem[]`, `markAsRead: (id: string) => void` | List of alerts |

---

## 🧠 Netra AI & Scenario Simulator

| Layer | Responsibility | Details |
|---|---|---|
| **Frontend** | Slide-up simulation panel, confidence indicator gauges | Scenario selection triggers |
| **Backend** | Pack context variables and trigger Gemini inference engines | Generative prompting |
| **Shared Types** | `AIRecommendation`, `ScenarioSimulationResult` | AI intelligence contracts |
| **Inputs** | `scenario: string`, `parameters: object` | Simulation selector |
| **Outputs** | `prediction: ScenarioSimulationResult` | Recommendations and confidence data |

---

## 🔄 Resource Redistribution

| Layer | Responsibility | Details |
|---|---|---|
| **Frontend** | Display proposed transfer orders, approve/decline triggers | Interactive confirm dialogs |
| **Backend** | Compute medicine surplus/shortages, generate transfer drafts | Audit logs updates |
| **Shared Types** | `AIRecommendation` | Transfer details |
| **Inputs** | `none` | Trigger parameter |
| **Outputs** | `recommendations: AIRecommendation[]`, `executeTransfer: (id: string) => void` | Active recommendations list |

---

## 👤 Profile & Settings

| Layer | Responsibility | Details |
|---|---|---|
| **Frontend** | Render settings cards, display user initials avatar | Log out triggers |
| **Backend** | Session verification, update user profile pictures | Firebase Auth state listeners |
| **Shared Types** | `User` | User profile details |
| **Inputs** | `none` | Current session |
| **Outputs** | `user: User`, `logout: () => Promise<void>` | User context |
