# NagRiver Sentinel — API Contract Specifications

Base URL: `http://localhost:5000/api`

---

## Endpoints Summary

| Method | Endpoint | Description | Handled By |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/segments` | Get summary list of all river segments | Person 2 |
| `GET` | `/api/segments/:segment_id` | Get detailed evidence & scores for a single segment | Person 2 |
| `POST` | `/api/segments/:segment_id/ground-photo` | Upload ground photo for Vision AI processing | Person 3 |
| `POST` | `/api/scoring/fuse` | Trigger manual recalculation of fusion score | Person 2 |
| `GET` | `/api/satellite/:segment_id` | Get raw & computed satellite indicators | Person 4 |

---

## Endpoint Details

### 1. List Segments
- **`GET /api/segments`**
- **Response `200 OK`**:
```json
[
  {
    "segment_id": "nag-seg-001",
    "name": "Ambazari Overflow to Subhash Nagar",
    "investigation_priority_score": 18,
    "priority_level": "Low",
    "has_ground_data": false,
    "last_updated": "2026-08-17T10:00:00Z"
  },
  {
    "segment_id": "nag-seg-002",
    "name": "Panchsheel Square to Sitabuldi Bridge",
    "investigation_priority_score": 82,
    "priority_level": "Critical",
    "has_ground_data": true,
    "last_updated": "2026-08-17T12:30:00Z"
  }
]
```

---

### 2. Get Segment Detail
- **`GET /api/segments/:segment_id`**
- **Response `200 OK`**:
```json
{
  "segment_id": "nag-seg-002",
  "name": "Panchsheel Square to Sitabuldi Bridge",
  "investigation_priority_score": 82,
  "priority_level": "Critical",
  "satellite_metrics": {
    "ndwi": 0.12,
    "mndwi": 0.05,
    "ndti": 0.48,
    "ndvi": 0.15,
    "satellite_score": 70,
    "acquisition_date": "2026-08-16"
  },
  "ground_evidence": [
    {
      "id": "ev-102",
      "photo_url": "/uploads/photo-002.jpg",
      "uploaded_at": "2026-08-17T12:00:00Z",
      "ground_score": 90,
      "ai_analysis": {
        "waste_detected": true,
        "foam_detected": true,
        "discoloration_detected": true,
        "bank_degradation_detected": false,
        "confidence_score": 0.94
      }
    }
  ],
  "evidence_agreement": "High Agreement",
  "recommended_action": "Immediate field response & physical containment required at Sitabuldi discharge point."
}
```

---

### 3. Upload Ground Photo (Vision AI Processing)
- **`POST /api/segments/:segment_id/ground-photo`**
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `photo`: File (image/jpeg, image/png)
  - `lat`: Number (Optional, auto-maps to nearest segment if omitted)
  - `lng`: Number (Optional)
  - `notes`: String (Optional)

- **Response `201 Created`**:
```json
{
  "success": true,
  "evidence": {
    "id": "ev-103",
    "segment_id": "nag-seg-002",
    "ground_score": 85,
    "ai_analysis": {
      "waste_detected": true,
      "foam_detected": false,
      "discoloration_detected": true,
      "bank_degradation_detected": true,
      "confidence_score": 0.89
    }
  },
  "updated_fused_score": {
    "investigation_priority_score": 79,
    "priority_level": "Critical"
  }
}
```
