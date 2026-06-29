# Screen Contracts Specification

This document lists the specification contracts for all 23 screens in **JanArogya Netra**.

---

## 1. Splash Screen
- **Purpose**: Brand introduction, initial configuration loading.
- **Description**: Displays name, logo, tagline, and initializes state before directing.
- **User Role(s)**: All Users.
- **Components Used**: `ActivityIndicator`, custom splash layout.
- **Shared Types Used**: None.
- **Hooks Required**: `useRouter` (Expo).
- **Services Required**: None.
- **Dummy Data Source**: None.
- **Navigation Entry**: App Launch.
- **Navigation Exit**: `/login`.
- **User Actions**: None (auto-navigates).
- **States**: Loading (rendering splash logo).
- **Firebase Integration**: Check auth state listener before routing.

---

## 2. Login Screen
- **Purpose**: Authenticate users into the system.
- **Description**: Standard input form to capture credentials and roles.
- **User Role(s)**: All Users.
- **Components Used**: `TextInput`, `PasswordInput`, `PrimaryButton`, `LoadingSpinner`.
- **Shared Types Used**: `User`, `UserRole`.
- **Hooks Required**: `useAuth` (custom).
- **Services Required**: Authentication services.
- **Dummy Data Source**: `dummyUsers`.
- **Navigation Entry**: `/login`, Splash redirect.
- **Navigation Exit**: `/(tabs)/situation-room` (Mission Control).
- **User Actions**: Enter email/password, select role, click log in.
- **States**: Default, Loading, Error (bad credentials).
- **Firebase Integration**: Migrate to Firebase Auth email/password login.

---

## 3. Mission Control (Situation Room)
- **Purpose**: High-level alert command center.
- **Description**: Core interface to view critical alerts and dispatch redirection tasks.
- **User Role(s)**: DHO, BMO.
- **Components Used**: `AlertCard`, `AIRecommendationCard`, `MetricCard`, `TopAppBar`, `BottomNavigation`, `SectionHeader`.
- **Shared Types Used**: `AlertItem`, `AIRecommendation`, `DistrictSummary`.
- **Hooks Required**: `useAlerts`, `useAI`, `useDistrict`.
- **Services Required**: Alerts and AI services.
- **Dummy Data Source**: `dummyAlerts`, `dummyDistrict`.
- **Navigation Entry**: Tab menu, Login success.
- **Navigation Exit**: PHC detail, AI insights, map.
- **User Actions**: Filter alerts, approve AI recommendations.
- **States**: Loading, Empty, Success (recommendation approved).
- **Firebase Integration**: Listen to `alerts` collection changes in real-time.

---

## 4. Command Queue
- **Purpose**: Manage ongoing redistribution orders.
- **Description**: Detailed queue showing status of active transfers (Pending, En-route, Delivered).
- **User Role(s)**: BMO, PHC Medical Officer.
- **Components Used**: `SummaryCard`, `Badge`, `PageHeader`.
- **Shared Types Used**: `AIRecommendation`.
- **Hooks Required**: `useRedistribution`.
- **Services Required**: Supply chain tracking.
- **Dummy Data Source**: `dummyAlerts` (Shortages).
- **Navigation Entry**: Sub-nav from Mission Control.
- **Navigation Exit**: Back.
- **User Actions**: Confirm shipment receipts.
- **States**: Loading, Empty.
- **Firebase Integration**: Listen to `transfers` collection state.

---

## 5. District Operations Timeline
- **Purpose**: Track chronological district events.
- **Description**: Time-ordered feed of reports, incidents, and approvals.
- **User Role(s)**: DHO.
- **Components Used**: `NotificationCard`, `Divider`.
- **Shared Types Used**: `NotificationItem`.
- **Hooks Required**: `useNotifications`.
- **Services Required**: Activity logging.
- **Dummy Data Source**: `dummyNotifications`.
- **Navigation Entry**: Sub-nav from Mission Control.
- **Navigation Exit**: Back.
- **User Actions**: View associated report.
- **States**: Loading, Empty.
- **Firebase Integration**: Query chronological `audit_logs` collection.

---

## 6. AI Insights
- **Purpose**: View health score breakdowns.
- **Description**: Executive briefing detailing why a location scored critical/warning.
- **User Role(s)**: DHO, BMO.
- **Components Used**: `HealthScoreCard`, `SummaryCard`, `SectionHeader`.
- **Shared Types Used**: `PHC`, `DistrictSummary`.
- **Hooks Required**: `usePHCs`, `useDistrict`.
- **Services Required**: Diagnostic calculations.
- **Dummy Data Source**: `dummyPHCs`, `dummyDistrict`.
- **Navigation Entry**: Mission Control action.
- **Navigation Exit**: Back.
- **User Actions**: View explainable metrics.
- **States**: Loading.
- **Firebase Integration**: Call Cloud Function evaluating health parameters.

---

## 7. AI Command Center
- **Purpose**: Execute district-wide simulations.
- **Description**: Run virtual drills of hypothetical outbreaks or supply delays.
- **User Role(s)**: DHO.
- **Components Used**: `PrimaryButton`, `Dropdown`, `AreaChart`.
- **Shared Types Used**: `ScenarioSimulationResult`.
- **Hooks Required**: `useAI`.
- **Services Required**: Vertex AI / Gemini reasoning.
- **Dummy Data Source**: None.
- **Navigation Entry**: Tab navigation / Mission control.
- **Navigation Exit**: Back.
- **User Actions**: Choose scenario parameters, run simulation.
- **States**: Idle, Loading (running Vertex model), Success (graph results).
- **Firebase Integration**: Call Cloud Function calling Vertex AI Gemini API.

---

## 8. District Map
- **Purpose**: Geolocation visualizer for facilities.
- **Description**: Interactive Google Map with color markers indicating health risks.
- **User Role(s)**: All Users.
- **Components Used**: Google Maps, Custom Pins, `PHCCard` (preview overlay).
- **Shared Types Used**: `PHC`.
- **Hooks Required**: `usePHCs`.
- **Services Required**: Geolocation.
- **Dummy Data Source**: `dummyPHCs`.
- **Navigation Entry**: Tab menu.
- **Navigation Exit**: PHC Detail.
- **User Actions**: Zoom, pan, tap pin, view overview.
- **States**: Loading (loading map layer), Success.
- **Firebase Integration**: Stream geo-tagged locations from Firestore.

---

## 9. Resource Movement Tracker
- **Purpose**: Real-time vehicle transit maps.
- **Description**: Tracks transfer shipments on map in real-time.
- **User Role(s)**: DHO, BMO.
- **Components Used**: Google Maps, `SummaryCard`, `Badge`.
- **Shared Types Used**: `AIRecommendation`.
- **Hooks Required**: `useRedistribution`.
- **Services Required**: Transit maps tracking.
- **Dummy Data Source**: None.
- **Navigation Entry**: Map subscreen.
- **Navigation Exit**: Back.
- **User Actions**: Call dispatcher.
- **States**: Loading, Success.
- **Firebase Integration**: Real-time GPS coordinates stream.

---

## 10. District Digital Twin
- **Purpose**: Virtual model representation of district resources.
- **Description**: Comprehensive overview of total bed count, staff, and medicine levels.
- **User Role(s)**: DHO.
- **Components Used**: `PieChart`, `BarChart`, `SummaryCard`.
- **Shared Types Used**: `DistrictSummary`.
- **Hooks Required**: `useDistrict`.
- **Services Required**: Aggregator.
- **Dummy Data Source**: `dummyDistrict`.
- **Navigation Entry**: Sub-nav.
- **Navigation Exit**: Back.
- **User Actions**: Toggle chart formats.
- **States**: Loading.
- **Firebase Integration**: Aggregation query on Firestore.

---

## 11. PHCs List
- **Purpose**: Directory of health centers.
- **Description**: List of all clinics with filters by health score index and block.
- **User Role(s)**: DHO, BMO.
- **Components Used**: `PHCCard`, `SearchBar`, `FilterChips`, `PageHeader`.
- **Shared Types Used**: `PHC`.
- **Hooks Required**: `usePHCs`.
- **Services Required**: Directory database.
- **Dummy Data Source**: `dummyPHCs`.
- **Navigation Entry**: Tab menu.
- **Navigation Exit**: PHC Detail.
- **User Actions**: Type search query, apply score filters.
- **States**: Loading, Empty.
- **Firebase Integration**: Real-time query to `facilities` collection.

---

## 12. PHC Detail
- **Purpose**: Detailed facility profile.
- **Description**: Displays complete drug inventories, beds availability, and staff presence.
- **User Role(s)**: All Roles.
- **Components Used**: `SummaryCard`, `SectionHeader`, `PageHeader`, `Badge`.
- **Shared Types Used**: `PHC`, `MedicineStock`, `AttendanceRecord`.
- **Hooks Required**: `usePHCs`, `useInventory`, `useAttendance`.
- **Services Required**: Facility database management.
- **Dummy Data Source**: `dummyPHCs`, `dummyMedicines`, `dummyAttendance`.
- **Navigation Entry**: PHC List, Map preview.
- **Navigation Exit**: Back.
- **User Actions**: Edit stock levels, mark doctor attendance.
- **States**: Loading, Success.
- **Firebase Integration**: Listen/Write to `inventory` and `attendance` sub-collections.

---

## 13. Resource Redistribution
- **Purpose**: Initiate manual medicine transfers.
- **Description**: Input source, destination, item, and quantity.
- **User Role(s)**: BMO, PHC Medical Officer.
- **Components Used**: `Dropdown`, `TextInput`, `PrimaryButton`, `ConfirmationDialog`.
- **Shared Types Used**: `MedicineStock`, `PHC`.
- **Hooks Required**: `useInventory`, `usePHCs`.
- **Services Required**: Redistribution workflow.
- **Dummy Data Source**: `dummyMedicines`, `dummyPHCs`.
- **Navigation Entry**: PHC Detail.
- **Navigation Exit**: Back.
- **User Actions**: Select target drug, input transfer size, confirm.
- **States**: Default, Loading, Success (submitted).
- **Firebase Integration**: Write transaction document to `transfers` collection.

---

## 14. Explainable AI (XAI)
- **Purpose**: Explain risk score recommendations.
- **Description**: View the weights and rules used to classify a health center.
- **User Role(s)**: DHO, BMO.
- **Components Used**: `BarChart`, `SummaryCard`, `PageHeader`.
- **Shared Types Used**: `PHC`.
- **Hooks Required**: `usePHCs`, `useAI`.
- **Services Required**: Gemini XAI reasoning.
- **Dummy Data Source**: `dummyPHCs`.
- **Navigation Entry**: AI Insights action.
- **Navigation Exit**: Back.
- **User Actions**: Tap factor to read justification.
- **States**: Loading.
- **Firebase Integration**: Stream XAI log fields generated by Gemini.

---

## 15. Scenario Simulator
- **Purpose**: What-if forecast simulations.
- **Description**: Run impact analysis on Dengue outbreak or staff absences.
- **User Role(s)**: DHO.
- **Components Used**: `Dropdown`, `PrimaryButton`, `BarChart`, `AreaChart`.
- **Shared Types Used**: `ScenarioSimulationResult`.
- **Hooks Required**: `useAI`.
- **Services Required**: Gemini simulation runner.
- **Dummy Data Source**: None.
- **Navigation Entry**: AI Command Center.
- **Navigation Exit**: Back.
- **User Actions**: Choose scenario, click "Simulate".
- **States**: Loading, Success.
- **Firebase Integration**: Trigger Gemini Vertex API to calculate estimates.

---

## 16. Data Quality Dashboard
- **Purpose**: Identify missing data entries.
- **Description**: Monitor PHCs with late or incomplete daily data registers.
- **User Role(s)**: DHO, BMO.
- **Components Used**: `MetricCard`, `PHCCard`.
- **Shared Types Used**: `PHC`.
- **Hooks Required**: `usePHCs`.
- **Services Required**: Quality auditor.
- **Dummy Data Source**: `dummyPHCs`.
- **Navigation Entry**: District Twin subscreen.
- **Navigation Exit**: Back.
- **User Actions**: Send warning nudge to operators.
- **States**: Loading.
- **Firebase Integration**: Check last updated timestamps on facility profiles.

---

## 17. Impact Dashboard
- **Purpose**: Historical proof of impact metrics.
- **Description**: Shows reduced stockouts and faster transfer rates.
- **User Role(s)**: All Roles.
- **Components Used**: `MetricCard`, `CardContainer`.
- **Shared Types Used**: `DistrictSummary`.
- **Hooks Required**: `useDistrict`.
- **Services Required**: Analytics.
- **Dummy Data Source**: `dummyDistrict`.
- **Navigation Entry**: Twin subscreen.
- **Navigation Exit**: Back.
- **User Actions**: Select time filters.
- **States**: Loading.
- **Firebase Integration**: Read aggregate database stats.

---

## 18. Impact Charts
- **Purpose**: Graphics visualizer of impact.
- **Description**: Graphs of capacity fill rate timelines.
- **User Role(s)**: All Roles.
- **Components Used**: `LineChart`, `AreaChart`.
- **Shared Types Used**: `DistrictSummary`.
- **Hooks Required**: `useDistrict`.
- **Services Required**: Analytics.
- **Dummy Data Source**: `dummyDistrict`.
- **Navigation Entry**: Impact Dashboard.
- **Navigation Exit**: Back.
- **User Actions**: Toggle parameters.
- **States**: Loading.
- **Firebase Integration**: Fetch aggregated timeline arrays.

---

## 19. Reports
- **Purpose**: Fetch operational pdf audits.
- **Description**: Repository of official weekly summaries.
- **User Role(s)**: DHO, BMO.
- **Components Used**: `ReportCard`, `PageHeader`.
- **Shared Types Used**: `ReportItem`.
- **Hooks Required**: `useReports`.
- **Services Required**: File catalog.
- **Dummy Data Source**: `dummyReports`.
- **Navigation Entry**: Sidebar / Tab navigation.
- **Navigation Exit**: Back.
- **User Actions**: Tap download.
- **States**: Loading, Empty.
- **Firebase Integration**: Read metadata from Firestore, fetch PDFs from Firebase Storage.

---

## 20. Notifications
- **Purpose**: View pushes and updates feed.
- **Description**: Local timeline of incoming alarms.
- **User Role(s)**: All Roles.
- **Components Used**: `NotificationCard`, `PageHeader`.
- **Shared Types Used**: `NotificationItem`.
- **Hooks Required**: `useNotifications`.
- **Services Required**: Push notifications.
- **Dummy Data Source**: `dummyNotifications`.
- **Navigation Entry**: Tab menu, Bell press.
- **Navigation Exit**: Associated screen.
- **User Actions**: Tap alert, clear read feed.
- **States**: Loading, Empty.
- **Firebase Integration**: Stream real-time user notification logs.

---

## 21. Netra AI Assistant
- **Purpose**: Conversational search and query assistant.
- **Description**: Ask Netra questions about district drug inventory or status in natural language.
- **User Role(s)**: All Roles.
- **Components Used**: `TextInput`, `IconButton`, custom chat bubbles list.
- **Shared Types Used**: None.
- **Hooks Required**: `useAI`.
- **Services Required**: Gemini chat context agent.
- **Dummy Data Source**: None.
- **Navigation Entry**: Float button / Action.
- **Navigation Exit**: Close.
- **User Actions**: Type question, submit.
- **States**: Loading (waiting for model response), Success.
- **Firebase Integration**: Call Cloud Function running Gemini model context search.

---

## 22. Profile
- **Purpose**: Display user role and assignment.
- **Description**: Settings detail of logged-in user.
- **User Role(s)**: All Roles.
- **Components Used**: `ProfileAvatar`, `PrimaryButton`.
- **Shared Types Used**: `User`.
- **Hooks Required**: `useAuth`.
- **Services Required**: Auth.
- **Dummy Data Source**: `dummyUsers`.
- **Navigation Entry**: Tab menu.
- **Navigation Exit**: `/login` (on logout).
- **User Actions**: Press Log Out.
- **States**: Default, Loading.
- **Firebase Integration**: Log out session from Firebase Auth.

---

## 23. Settings
- **Purpose**: Configure app preferences.
- **Description**: Change theme, language, and toggle notifications.
- **User Role(s)**: All Roles.
- **Components Used**: `Divider`, `PageHeader`.
- **Shared Types Used**: None.
- **Hooks Required**: None.
- **Services Required**: Local storage.
- **Dummy Data Source**: None.
- **Navigation Entry**: Tab menu / Profile subscreen.
- **Navigation Exit**: Back.
- **User Actions**: Toggle notification switches.
- **States**: Default.
- **Firebase Integration**: Store configuration choices locally in SecureStore.
