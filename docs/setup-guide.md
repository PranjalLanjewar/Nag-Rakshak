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

---

## ⚡ Supabase Setup Instructions

1. **Create Database Tables**:
   - Create a project on [Supabase](https://supabase.com).
   - Open the **SQL Editor** in the dashboard.
   - Run the SQL script found in [`database/schema.sql`](../database/schema.sql) to create tables and indexes.
   - Run [`database/seed.sql`](../database/seed.sql) to populate initial segments.

2. **Configure Storage Bucket**:
   - Go to **Storage** in the Supabase sidebar.
   - Click **New Bucket**, name it `ground-photos`, and toggle the **Public** switch to `ON`.
   - Add policy rules: Under **Policies**, select **New Policy** for the bucket and check "Allow public read/write access".

---

## 🚀 Vercel Deployment Instructions

### 1. Deploy the Backend API
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project** and select your Nag River repository.
3. Configure the following settings for the project:
   - **Framework Preset**: `Other` (or `Express`)
   - **Root Directory**: `backend`
4. Under **Environment Variables**, add:
   - `MOCK_MODE=false`
   - `SUPABASE_URL=https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY=your-anon-key`
   - `VISION_AI_API_KEY=your-ai-api-key`
5. Click **Deploy**. This gives you a backend URL like `https://nag-river-backend.vercel.app`.

### 2. Deploy the Frontend UI
1. Click **Add New** > **Project** on Vercel again.
2. Select the same Nag River repository.
3. Configure these settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   - `VITE_API_URL=https://nag-river-backend.vercel.app` (pointing to your newly deployed backend Vercel URL).
5. Click **Deploy**.

