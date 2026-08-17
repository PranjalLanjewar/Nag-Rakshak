NagRiver Sentinel — MVP Coding Brief

Build a 24-hour hackathon MVP called NagRiver Sentinel.

Goal

A web app that uses Sentinel-2 satellite data to screen Nag River segments and identify areas that should be investigated first. Users can optionally upload ground photos for AI verification.

Core flow
Sentinel-2
   ↓
NDWI / MNDWI / NDTI / NDVI
   ↓
River Segments
   ↓
Satellite Score
   ↓
+ Optional Ground Photo
   ↓
Vision AI
   ↓
Evidence Fusion
   ↓
Investigation Priority Score
   ↓
Leaflet Hotspot Map
MVP features
Leaflet Map
Show Nag River
Divide into segments
Color segments:
🟢 Low
🟡 Moderate
🟠 High
🔴 Critical
Show ground-photo markers
Satellite
Google Earth Engine
COPERNICUS/S2_SR_HARMONIZED
COPERNICUS/S2_CLOUD_PROBABILITY
Calculate NDWI, MNDWI, NDTI, NDVI and temporal change
Generate satellite_score (0–100)
Ground Verification
Upload photo
GPS → nearest river segment
Vision AI detects:
Waste
Foam
Discoloration
Bank degradation
Generate ground_score
Evidence Fusion
Ground evidence should have higher weight than satellite when available
If no ground data → satellite score only
Output investigation_priority_score
Segment Details
Score
Priority
Satellite indicators
Historical trend
Ground photos
AI results
Evidence agreement
Recommended action

Never call the score “pollution level”.

Tech Stack
React + Vite
Tailwind CSS
React Leaflet + Leaflet
Node.js + Express
Supabase/PostgreSQL + Storage
Google Earth Engine
Existing vision AI API
No custom ML training
4-Person Structure

Create separate ownership areas:

/frontend       → Person 1: UI + Leaflet


/backend        → Person 2: API + Supabase + scoring


/backend/.../ground-ai
                → Person 3: Photo + Vision AI


/satellite      → Person 4: GEE + Sentinel-2
/data/geojson   → Person 4

Use Git branches:

feature/frontend
feature/backend
feature/ground-ai
feature/satellite

All modules communicate using:

segment_id

Do not let agents unnecessarily edit each other's folders.

Suggested structure
nag-river-sentinel/
├── frontend/
├── backend/
├── satellite/
├── data/
│   ├── geojson/
│   └── sample/
├── database/
├── docs/
└── README.md

Keep shared API/data contracts in:

docs/api-contract.md
docs/data-model.md
Reliability

Create:

MOCK_MODE=true

The application must work with mock data if:

Earth Engine fails
AI API fails
Supabase fails
Internet fails

Allow switching between Mock / Real data.

Do NOT build
Authentication
Mobile app
IoT
Chatbot
Custom ML training
Chemical pollution prediction
Sentinel-1
Landsat
HLS
Multi-city support
Complex admin panel
Definition of Done

A judge must be able to:

Open website
→ See Nag River
→ See colored hotspots
→ Click a segment
→ See satellite evidence
→ Upload/view ground photo
→ See AI analysis
→ See combined priority
→ Get field-investigation recommendation

Prioritize a working end-to-end demo over additional features.

If you cannot configure/connect an external service, stop and give me the exact manual steps/credentials/configuration I need to perform rather than replacing the feature with an unnecessary alternative.