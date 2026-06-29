# JanArogya Netra — Backend REST API Documentation

This documentation specifies the endpoints exposed by the Supabase Edge Functions.

---

## 1. Dashboard Services

### `POST /functions/v1/dashboard`
- **Purpose**: Retrieve regional healthcare KPI metrics and district aggregates.
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_USER_TOKEN>`
- **Request Body**: None (requires authenticated session context).
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "name": "Devgarh District Command Center",
      "totalPHCs": 4,
      "activeAlerts": 1,
      "healthIndex": 68,
      "supplyTransferRequestsTotal": 2,
      "averagePatientWaitTimeMinutes": 24,
      "bedsOccupied": 20,
      "bedsTotal": 40
    }
  }
  ```
- **Error Response (400)**:
  ```json
  {
    "success": false,
    "error": "DB/FETCH_ERROR"
  }
  ```
- **Authentication**: Required (`DHO`, `BMO`, `PHC_STAFF`, `SUPER_ADMIN`).

---

## 2. Medicine & Transfer Services

### `POST /functions/v1/medicine/get-stock`
- **Purpose**: Get list of stocks and thresholds for a specific facility.
- **Request Body**:
  ```json
  {
    "phcId": "phc_kalan"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "stock_id",
        "phc_id": "phc_kalan",
        "medicine_id": "m1",
        "current_stock": 120,
        "min_required_stock": 500,
        "medicine": {
          "id": "m1",
          "name": "Paracetamol 500mg",
          "type": "ANALGESICS",
          "unit": "Tablets"
        }
      }
    ]
  }
  ```

### `POST /functions/v1/medicine/update-stock`
- **Purpose**: Update stock count for a medicine at a facility.
- **Request Body**:
  ```json
  {
    "phcId": "phc_kalan",
    "medicineId": "m1",
    "newStock": 150
  }
  ```
- **Authentication**: Required (`PHC_STAFF` for local facility, or `DHO`/`SUPER_ADMIN`).

### `POST /functions/v1/medicine/transfer`
- **Purpose**: Create a stock redistribution transfer order.
- **Request Body**:
  ```json
  {
    "sourcePhcId": "phc_dharampur",
    "targetPhcId": "phc_kalan",
    "medicineId": "m1",
    "quantity": 200
  }
  ```
- **Error Cases**:
  - `400 INSUFFICIENT_STOCK`: Quantity exceeds current source inventory level.

---

## 3. Attendance Services

### `POST /functions/v1/attendance/get-attendance`
- **Purpose**: Retrieve daily attendance logs for a clinic.
- **Request Body**:
  ```json
  {
    "phcId": "phc_dharampur",
    "date": "2026-06-29"
  }
  ```

### `POST /functions/v1/attendance/record`
- **Purpose**: Log doctor/staff presence entry.
- **Request Body**:
  ```json
  {
    "doctorId": "doc_id",
    "present": true,
    "timeIn": "09:05:00"
  }
  ```

---

## 4. Reports & Audits

### `POST /functions/v1/reports/list`
- **Purpose**: List Weekly summary reports and PDF links.

### `POST /functions/v1/reports/generate`
- **Purpose**: Create a weekly compiled audit report reference.
- **Request Body**:
  ```json
  {
    "title": "Weekly Epidemiological Summary - Week 26",
    "type": "Epidemiological",
    "metrics": {
      "totalFacilitiesAudited": 4,
      "activeAlertsAtCompilation": 2
    }
  }
  ```

---

## 5. Netra AI Assistance & Simulation

### `POST /functions/v1/ai/ask-netra`
- **Purpose**: Ask Netra conversational assistant queries.
- **Request Body**:
  ```json
  {
    "query": "Do we have surplus ORS in the district?",
    "chatHistory": [],
    "sessionId": "session_default"
  }
  ```

### `POST /functions/v1/ai/simulate`
- **Purpose**: Execute district-wide drills and what-if outbreak forecasts.
- **Request Body**:
  ```json
  {
    "scenarioName": "Heatwave",
    "customParameters": {
      "intensity": "HIGH"
    }
  }
  ```
