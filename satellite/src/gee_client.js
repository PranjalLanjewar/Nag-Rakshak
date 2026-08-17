/**
 * Google Earth Engine Interface & Mock Client
 * Ownership: Person 4 (Satellite Engineer)
 */

const fs = require('fs');
const path = require('path');
const { calculateSatelliteScore } = require('./index_calculator');

const MOCK_MODE = process.env.MOCK_MODE !== 'false';

/**
 * Fetches satellite metrics for all Nag River segments
 */
async function fetchSentinelData() {
  if (MOCK_MODE) {
    console.log('[Satellite Engine] Running in MOCK_MODE=true');
    const samplePath = path.join(__dirname, '../../data/sample/mock_satellite.json');
    if (fs.existsSync(samplePath)) {
      const raw = fs.readFileSync(samplePath, 'utf-8');
      return JSON.parse(raw);
    }
  }

  // Live Earth Engine logic skeleton (COPERNICUS/S2_SR_HARMONIZED)
  console.log('[Satellite Engine] Connecting to Google Earth Engine...');
  console.log('Querying COPERNICUS/S2_SR_HARMONIZED & COPERNICUS/S2_CLOUD_PROBABILITY...');
  
  throw new Error('Google Earth Engine credentials not configured. Please set MOCK_MODE=true or provide GEE_SERVICE_ACCOUNT.');
}

if (require.main === module) {
  fetchSentinelData().then((data) => {
    console.log('[Satellite Engine] Extracted Sentinel Metrics:', data);
  }).catch((err) => {
    console.error('[Satellite Engine] Error:', err.message);
  });
}

module.exports = { fetchSentinelData };
