/**
 * Satellite Metric Exporter
 * Ownership: Person 4 (Satellite Engineer)
 * Exports processed satellite scores to data/sample or backend database
 */

const fs = require('fs');
const path = require('path');
const { fetchSentinelData } = require('./gee_client');

async function exportMetrics() {
  console.log('[Exporter] Processing Sentinel-2 indices...');
  const data = await fetchSentinelData();
  const outputPath = path.join(__dirname, '../../data/sample/processed_satellite.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`[Exporter] Successfully exported to ${outputPath}`);
}

if (require.main === module) {
  exportMetrics().catch(console.error);
}

module.exports = { exportMetrics };
