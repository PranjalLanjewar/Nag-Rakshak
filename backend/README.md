# ⚙️ Backend Module (Person 2 & Person 3 Ownership)

Express REST API, Evidence Fusion Engine, and Vision AI module for NagRiver Sentinel.

## 🚀 Running Dev Server

```bash
npm install
npm run dev
# Server starts at http://localhost:5000
```

## 📂 Internal Ownership Split

- **Person 2 Area**:
  - `src/routes/segments.js` — Segment list & detail endpoints
  - `src/routes/scoring.js` — Recalculation routes
  - `src/services/fusionEngine.js` — Evidence Fusion scoring engine

- **Person 3 Area**:
  - `src/services/ground-ai/` — Vision AI photo processing module (waste, foam, discoloration detection)
