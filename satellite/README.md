# 🛰 Satellite Module (Person 4 Ownership)

This module handles Sentinel-2 satellite data ingestion via Google Earth Engine (GEE) and calculates spectral indices for Nag River segments.

## 📈 Calculated Indices

- **NDWI** (Normalized Difference Water Index): `(B3 - B8) / (B3 + B8)`
- **MNDWI** (Modified NDWI): `(B3 - B11) / (B3 + B11)`
- **NDTI** (Normalized Difference Turbidity Index): `(B4 - B3) / (B4 + B3)`
- **NDVI** (Normalized Difference Vegetation Index): `(B8 - B4) / (B8 + B4)`

## 🚀 Running

```bash
# Run calculation test
npm run calc

# Fetch and display satellite metrics
npm start

# Export processed metrics to data/sample/
npm run export
```
