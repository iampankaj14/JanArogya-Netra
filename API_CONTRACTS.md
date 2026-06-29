# API Contracts Specification

This document defines the backend repository and service functions, their inputs, outputs, shared type contracts, and potential error exceptions.

---

## 🔐 Auth & Identity

### `login()`
- **Purpose**: Authenticate user credentials.
- **Input**:
  - `email: string`
  - `password: string`
  - `role: UserRole`
- **Output**:
  - `user: User`
  - `token: string`
- **Shared Types**: `User`, `UserRole`
- **Success Response**: Object containing user details and access token.
- **Error Cases**:
  - `AUTH/INVALID_CREDENTIALS`: Password or email mismatch.
  - `AUTH/ROLE_MISMATCH`: Selected role does not match account records.

---

## 📈 District & Summary Data

### `getDistrictSummary()`
- **Purpose**: Fetch high-level regional telemetry metrics.
- **Input**: None.
- **Output**:
  - `summary: DistrictSummary`
- **Shared Types**: `DistrictSummary`
- **Success Response**: Regional score cards, total active shortage counts, patient queues, and averages.
- **Error Cases**:
  - `DB/FETCH_ERROR`: Firestore connection timeout.

### `getPHCs()`
- **Purpose**: Retrieve directory list of all health facilities.
- **Input**:
  - `filterBlock?: string`
  - `minScore?: number`
- **Output**:
  - `phcs: PHC[]`
- **Shared Types**: `PHC`
- **Success Response**: Array of facilities matching coordinates and statuses.
- **Error Cases**: None (returns empty array if no matches).

---

## 🚨 Alerts & Command Workflows

### `approveMission()`
- **Purpose**: Approve an AI redistribution task recommendation.
- **Input**:
  - `recommendationId: string`
  - `approvedByUserId: string`
- **Output**:
  - `success: boolean`
- **Shared Types**: None.
- **Success Response**: Returns `{ success: true }`. Creates a pending transfer shipment order.
- **Error Cases**:
  - `REDISTRIBUTION/NOT_FOUND`: Target recommendation ID no longer exists.
  - `REDISTRIBUTION/ALREADY_RESOLVED`: This recommendation was already executed.

### `rejectMission()`
- **Purpose**: Archive or decline an AI recommendation.
- **Input**:
  - `recommendationId: string`
  - `reason?: string`
- **Output**:
  - `success: boolean`
- **Shared Types**: None.
- **Success Response**: Returns `{ success: true }`.
- **Error Cases**:
  - `REDISTRIBUTION/NOT_FOUND`: Target ID not found.

---

## 📦 Inventory & Attendance Modifications

### `transferMedicine()`
- **Purpose**: Manually initiate a stock transfer order.
- **Input**:
  - `sourceFacilityId: string`
  - `targetFacilityId: string`
  - `medicineId: string`
  - `quantity: number`
- **Output**:
  - `transferId: string`
- **Shared Types**: None.
- **Success Response**: Return unique transactional transaction ID.
- **Error Cases**:
  - `INSUFFICIENT_STOCK`: Source facility has less inventory than requested.
  - `DB/MUTATION_FAILED`: Database write transaction aborted.

### `updateMedicineStock()`
- **Purpose**: Update current drug store quantities at a facility.
- **Input**:
  - `facilityId: string`
  - `medicineId: string`
  - `newStockCount: number`
- **Output**:
  - `updatedStock: MedicineStock`
- **Shared Types**: `MedicineStock`
- **Success Response**: Updated stock object.
- **Error Cases**:
  - `FACILITY/NOT_FOUND`: Target facility code is invalid.

### `updateAttendance()`
- **Purpose**: Log daily presence records of medical officers.
- **Input**:
  - `facilityId: string`
  - `staffName: string`
  - `role: UserRole`
  - `present: boolean`
  - `timeIn?: string`
- **Output**:
  - `record: AttendanceRecord`
- **Shared Types**: `AttendanceRecord`, `UserRole`
- **Success Response**: Saved attendance log record.
- **Error Cases**:
  - `ATTENDANCE/LATE_SUBMISSION`: Attendance cannot be modified after hours.

---

## 🧠 Netra AI Intelligence & Simulator

### `simulateScenario()`
- **Purpose**: Trigger Gemini Vertex AI inference for a virtual scenario simulation.
- **Input**:
  - `scenarioName: string`
  - `customParameters: object`
- **Output**:
  - `simulationResult: ScenarioSimulationResult`
- **Shared Types**: `ScenarioSimulationResult`
- **Success Response**: Quantitative forecasts of medicine demands and suggested transfers.
- **Error Cases**:
  - `AI/MODEL_TIMEOUT`: Vertex AI failed to reply in time.
  - `AI/INVALID_PARAMETERS`: Incorrect prompt parameter attributes.

### `generateForecast()`
- **Purpose**: Retrieve timeline predictions for a drug or clinic score.
- **Input**:
  - `targetId: string`
  - `type: 'PHC_HEALTH' | 'MEDICINE_DEMAND'`
- **Output**:
  - `forecastTimeline: number[]`
- **Shared Types**: None.
- **Success Response**: Array of predicted future data values.
- **Error Cases**:
  - `AI/FORECAST_UNAVAILABLE`: Not enough historical data to generate forecasting.

### `askNetra()`
- **Purpose**: Query the Gemini Chat context agent.
- **Input**:
  - `query: string`
  - `chatHistory: Array<{ role: 'user' | 'model', parts: string }>`
- **Output**:
  - `answer: string`
- **Shared Types**: None.
- **Success Response**: Conversational response string.
- **Error Cases**:
  - `AI/SERVICE_ERROR`: Generative API failed.

---

## 📁 Document Management

### `getReports()`
- **Purpose**: Fetch PDF weekly logs catalog.
- **Input**: None.
- **Output**:
  - `reports: ReportItem[]`
- **Shared Types**: `ReportItem`
- **Success Response**: List of PDF records.
- **Error Cases**: None.
