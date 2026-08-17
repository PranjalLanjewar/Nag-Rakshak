# NagRiver Sentinel — Team Onboarding & Setup Guide

Welcome to the 24-hour NagRiver Sentinel MVP project! Follow this guide to set up your feature environment and work independently.

---

## 🛠 Repository Setup

1. **Clone & Checkout Your Branch**:
   ```bash
   git clone <repo-url>
   cd "Nag river"
   ```

2. **Branch Assignment**:
   - **Person 1 (Frontend)**: `git checkout -b feature/frontend`
   - **Person 2 (Backend)**: `git checkout -b feature/backend`
   - **Person 3 (Ground AI)**: `git checkout -b feature/ground-ai`
   - **Person 4 (Satellite & Data)**: `git checkout -b feature/satellite`

---

## 💻 Working in `MOCK_MODE` (Recommended for Dev)

By default, the backend and frontend run with `MOCK_MODE=true`. This ensures you can develop without needing live API tokens or database connections.

To switch to real services:
- Set `MOCK_MODE=false` in `backend/.env`
- Provide `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VISION_AI_API_KEY`, or GEE credentials.

---

## 📦 Component Directives

### Person 1 — UI & Leaflet Map (`/frontend`)
- **Work Area**: `frontend/src/components/`, `frontend/src/App.jsx`
- **Key Task**: Render Leaflet map with GeoJSON segments colored by priority. Render detail panel and photo upload modal.
- **Run Dev**: `cd frontend && npm run dev`

### Person 2 — Express API & Evidence Fusion (`/backend`)
- **Work Area**: `backend/src/routes/segments.js`, `backend/src/services/fusionEngine.js`
- **Key Task**: Manage segment CRUD, implement weighted fusion algorithm (Ground weight > Satellite weight).
- **Run Dev**: `cd backend && npm run dev`

### Person 3 — Vision AI Subservice (`/backend/src/services/ground-ai/`)
- **Work Area**: `backend/src/services/ground-ai/`
- **Key Task**: Implement image feature detection logic (waste, foam, discoloration, bank degradation) and generate `ground_score`.
- **Test**: Call `POST /api/segments/:id/ground-photo` with test images.

### Person 4 — Satellite Engine & GeoJSON (`/satellite` & `/data`)
- **Work Area**: `satellite/src/`, `data/geojson/`
- **Key Task**: Process Sentinel-2 indices (NDWI, MNDWI, NDTI, NDVI), compute `satellite_score`, update segment GeoJSON.
- **Run**: `cd satellite && node src/gee_client.js`
