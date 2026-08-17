/**
 * Sentinel-2 Index Calculator & Satellite Score Generator
 * Ownership: Person 4 (Satellite Engineer)
 *
 * Formulas:
 * - NDWI (Normalized Difference Water Index) = (B3 - B8) / (B3 + B8) [Green - NIR]
 * - MNDWI (Modified NDWI) = (B3 - B11) / (B3 + B11) [Green - SWIR1]
 * - NDTI (Normalized Difference Turbidity Index) = (B4 - B3) / (B4 + B3) [Red - Green]
 * - NDVI (Normalized Difference Vegetation Index) = (B8 - B4) / (B8 + B4) [NIR - Red]
 */

/**
 * Computes NDWI from spectral bands
 */
function calculateNDWI(green, nir) {
  if (green + nir === 0) return 0;
  return Number(((green - nir) / (green + nir)).toFixed(3));
}

/**
 * Computes MNDWI from spectral bands
 */
function calculateMNDWI(green, swir1) {
  if (green + swir1 === 0) return 0;
  return Number(((green - swir1) / (green + swir1)).toFixed(3));
}

/**
 * Computes NDTI (Turbidity / Suspended Solids)
 */
function calculateNDTI(red, green) {
  if (red + green === 0) return 0;
  return Number(((red - green) / (red + green)).toFixed(3));
}

/**
 * Computes NDVI (Vegetation / Algae Coverage)
 */
function calculateNDVI(nir, red) {
  if (nir + red === 0) return 0;
  return Number(((nir - red) / (nir + red)).toFixed(3));
}

/**
 * Calculates normalized Satellite Score (0 - 100)
 * Note: Never call this "pollution level". It is the Satellite Investigation Score.
 */
function calculateSatelliteScore(ndwi, mndwi, ndti, ndvi, temporalChange = 0) {
  // Higher NDTI (turbidity) -> higher priority score
  // Lower MNDWI (loss of clean open water) -> higher priority score
  // Higher temporal change -> higher priority score
  
  let score = 50;
  
  // NDTI effect (turbidity)
  if (ndti > 0.4) score += 30;
  else if (ndti > 0.2) score += 15;
  else if (ndti < 0.1) score -= 15;

  // MNDWI effect (water clarity / suppression)
  if (mndwi < 0.1) score += 20;
  else if (mndwi > 0.3) score -= 15;

  // Temporal anomaly boost
  if (temporalChange > 15) score += 15;
  else if (temporalChange > 5) score += 8;

  // Clamp strictly between 0 and 100
  return Math.min(100, Math.max(0, Math.round(score)));
}

module.exports = {
  calculateNDWI,
  calculateMNDWI,
  calculateNDTI,
  calculateNDVI,
  calculateSatelliteScore
};
