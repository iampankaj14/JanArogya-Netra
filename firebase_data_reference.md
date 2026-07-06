# Firebase Firestore Data Reference

Here is the exact data list that the application uses for testing mode. If you are verifying or manually entering data into Firebase Firestore, you should use these exact structures and IDs to ensure the application connects and reads the data correctly.

## 1. Collection: `phcs`
Below are the exact Primary Health Centers (PHCs) and Community Health Centers (CHCs) with their Document IDs. 

> [!IMPORTANT]
> The **Document ID** in Firestore must exactly match the `id` field below for the authentication and queries to work (e.g., `chc_bisrakh`).

```json
[
  {
    "id": "chc_bisrakh",
    "name": "CHC Bisrakh",
    "nameHi": "सी.एच.सी. बिसरख",
    "block": "Bisrakh",
    "blockHi": "बिसरख",
    "healthScore": 85,
    "doctorAvailable": true,
    "stockStatus": "adequate",
    "activeAlertsCount": 0,
    "bedsTotal": 30,
    "bedsOccupied": 12,
    "latitude": 28.5865,
    "longitude": 77.4430,
    "establishedYear": 1995,
    "phcCode": "UP-GBN-BIS01",
    "consultRooms": 5,
    "ambulances": 2,
    "o2Cylinders": 15,
    "staffTotal": 18,
    "staffPresent": 18,
    "moName": "Dr. S. K. Verma",
    "weeklyFootfall": [118, 229, 147, 117, 119, 123, 147]
  },
  {
    "id": "chc_bhangel",
    "name": "CHC Bhangel",
    "nameHi": "सी.एच.सी. भंगेल",
    "block": "Bisrakh",
    "blockHi": "बिसरख",
    "healthScore": 78,
    "doctorAvailable": true,
    "stockStatus": "warning",
    "activeAlertsCount": 1,
    "bedsTotal": 20,
    "bedsOccupied": 18,
    "latitude": 28.5355,
    "longitude": 77.3910,
    "establishedYear": 2002,
    "phcCode": "UP-GBN-BHA02",
    "consultRooms": 3,
    "ambulances": 1,
    "o2Cylinders": 8,
    "staffTotal": 12,
    "staffPresent": 11,
    "moName": "Dr. Rajesh Kumar",
    "weeklyFootfall": [173, 153, 181, 87, 163, 105, 110]
  },
  {
    "id": "phc_barola",
    "name": "PHC Barola",
    "nameHi": "पी.एच.सी. बरौला",
    "block": "Bisrakh",
    "blockHi": "बिसरख",
    "healthScore": 65,
    "doctorAvailable": true,
    "stockStatus": "critical",
    "activeAlertsCount": 3,
    "bedsTotal": 10,
    "bedsOccupied": 9,
    "latitude": 28.5630,
    "longitude": 77.3698,
    "establishedYear": 2012,
    "phcCode": "UP-GBN-BAR03",
    "consultRooms": 2,
    "ambulances": 1,
    "o2Cylinders": 4,
    "staffTotal": 8,
    "staffPresent": 6,
    "moName": "Dr. Anita Singh",
    "weeklyFootfall": [206, 198, 115, 238, 146, 233, 213]
  }
]
```

## 2. Collection: `inventory`
Medicines are linked to the PHCs via the `facilityId` field. 

> [!TIP]
> The `type` field must be one of: `'ANTIBIOTICS' | 'ANALGESICS' | 'EMERGENCY' | 'MATERNAL' | 'VACCINES'`.

```json
[
  {
    "id": "m1",
    "name": "Paracetamol 650mg",
    "type": "ANALGESICS",
    "currentStock": 127,
    "minRequiredStock": 149,
    "unit": "Strips",
    "facilityId": "chc_bisrakh"
  },
  {
    "id": "m2",
    "name": "ORS (Oral Rehydration Salt)",
    "type": "EMERGENCY",
    "currentStock": 34,
    "minRequiredStock": 369,
    "unit": "Sachets",
    "facilityId": "chc_bisrakh"
  },
  {
    "id": "m4",
    "name": "Dengue NS1 Kit",
    "type": "EMERGENCY",
    "currentStock": 519,
    "minRequiredStock": 329,
    "unit": "Kits",
    "facilityId": "chc_bisrakh"
  },
  {
    "id": "m6",
    "name": "Paracetamol 650mg",
    "type": "ANALGESICS",
    "currentStock": 82,
    "minRequiredStock": 301,
    "unit": "Strips",
    "facilityId": "chc_bhangel"
  },
  {
    "id": "m7",
    "name": "ORS (Oral Rehydration Salt)",
    "type": "EMERGENCY",
    "currentStock": 485,
    "minRequiredStock": 499,
    "unit": "Sachets",
    "facilityId": "chc_bhangel"
  }
]
```

## 3. Collection: `alerts`
Alerts trigger notifications in the layout header and situation room. 

```json
[
  {
    "id": "a1",
    "facilityId": "phc_barola",
    "title": "Critical Shortage: Paracetamol",
    "titleHi": "गंभीर कमी: पैरासिटामोल",
    "description": "Stock is below 10% of minimum required.",
    "descriptionHi": "स्टॉक आवश्यक न्यूनतम से 10% से कम है।",
    "type": "stock",
    "severity": "high",
    "date": "2024-03-24T10:00:00Z",
    "read": false
  },
  {
    "id": "a2",
    "facilityId": "chc_bhangel",
    "title": "Staff Shortage",
    "titleHi": "कर्मचारियों की कमी",
    "description": "Doctor on leave, expect delays.",
    "descriptionHi": "डॉक्टर छुट्टी पर हैं, देरी की उम्मीद है।",
    "type": "staff",
    "severity": "medium",
    "date": "2024-03-24T08:30:00Z",
    "read": false
  }
]
```

## 4. Collection: `transfers`
Tracks resources moving between facilities.

```json
[
  {
    "id": "TRF-2024-001",
    "sourceId": "chc_bisrakh",
    "targetId": "phc_barola",
    "medicineId": "m1",
    "medicineName": "Paracetamol 650mg",
    "quantity": 50,
    "status": "EN_ROUTE",
    "date": "2024-03-23T14:30:00Z"
  }
]
```
