# 🌊 NagRiver Sentinel — MVP

A web application that combines Sentinel-2 satellite imagery with optional ground-verified photos to screen Nag River segments in Nagpur, India and compute an **Investigation Priority Score** for targeted field intervention.

> [!IMPORTANT]
> **Terminology Rule:** Never refer to scores as "pollution level". Always use **"Investigation Priority Score"**, **"Satellite Score"**, or **"Ground Score"**.

---

## 🚀 Quickstart (Mock Mode)

The system comes with `MOCK_MODE=true` enabled out-of-the-box. You do **not** need Supabase or Google Earth Engine credentials to get started immediately.

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 👥 4-Person Ownership & Git Branches

To ensure team members can work simultaneously without merge conflicts:

| Ownership Area | Folder | Git Branch | Description |
| :--- | :--- | :--- | :--- |
| **Person 1** | `/frontend` | `feature/frontend` | UI layout, Leaflet hotspot map, segment panels, photo modal |
| **Person 2** | `/backend` | `feature/backend` | Express API, Supabase connection, Evidence Fusion scoring |
| **Person 3** | `/backend/src/services/ground-ai` | `feature/ground-ai` | Vision AI integration (waste, foam, discoloration detection) |
| **Person 4** | `/satellite` & `/data` | `feature/satellite` | Sentinel-2 processing (NDWI, MNDWI, NDTI, NDVI) & GeoJSON |

---

## 📊 Core Data Contract

All components communicate using **`segment_id`** (e.g. `nag-seg-001`).

- Data models are documented in [`docs/data-model.md`](docs/data-model.md)
- REST API contracts are documented in [`docs/api-contract.md`](docs/api-contract.md)
- Detailed quickstart setup guide: [`docs/setup-guide.md`](docs/setup-guide.md)

---

## 🎨 Priority Color Legend

- 🟢 **Low** (Score 0 – 25): Routine monitoring
- 🟡 **Moderate** (Score 26 – 50): Scheduled inspection
- 🟠 **High** (Score 51 – 75): Priority field investigation
- 🔴 **Critical** (Score 76 – 100): Immediate field response required
