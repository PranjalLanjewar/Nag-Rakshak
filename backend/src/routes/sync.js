/**
 * Satellite Sync Route
 * Ownership: Person 4 & 2
 */

const express = require('express');
const router = express.Router();
const segmentsGeoJson = require('../../../data/geojson/nag-river-segments.json');
const { fetchLiveSatelliteMetrics } = require('../services/geeService');
const { getSupabaseClient } = require('../config/supabase');
const mockData = require('../mock/mockData');
const { isMock } = require('../config/mockSwitch');
const { fuseEvidence } = require('../services/fusionEngine');

// POST /api/satellite/sync - Trigger GEE satellite calculations
router.post('/sync', async (req, res) => {
  const runMock = isMock(req);
  const supabase = getSupabaseClient();
  const features = segmentsGeoJson.features || [];
  const results = [];

  console.log(`[Sync API] Triggering satellite index recalculation for ${features.length} segments`);

  try {
    for (const feat of features) {
      const props = feat.properties;
      const segId = props.segment_id;
      const coords = feat.geometry.coordinates;

      // 1. Fetch live metrics from GEE
      const metrics = await fetchLiveSatelliteMetrics(segId, coords);

      // 2. Fuse scores (mock or database)
      let groundScore = null;
      if (!runMock && supabase) {
        const { data: groundRecord } = await supabase
          .from('ground_evidence')
          .select('ground_score')
          .eq('segment_id', segId)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .single();
        if (groundRecord) groundScore = groundRecord.ground_score;
      } else {
        const seg = mockData.getSegmentById(segId);
        if (seg && seg.ground_evidence && seg.ground_evidence.length > 0) {
          groundScore = seg.ground_evidence[0].ground_score;
        }
      }

      const fused = fuseEvidence(metrics.satellite_score, groundScore);

      // 3. Save to Supabase (if live) or local mock data
      if (!runMock && supabase) {
        // Insert metrics
        const { error: satErr } = await supabase
          .from('satellite_metrics')
          .insert({
            segment_id: segId,
            ndwi: metrics.ndwi,
            mndwi: metrics.mndwi,
            ndti: metrics.ndti,
            ndvi: metrics.ndvi,
            temporal_change_percent: metrics.temporal_change_percent,
            satellite_score: metrics.satellite_score,
            cloud_cover_percent: metrics.cloud_cover_percent,
            acquisition_date: metrics.acquisition_date
          });

        if (satErr) console.warn(`[Sync API] Failed to insert satellite metrics for ${segId}:`, satErr);

        // Update segments table
        const { error: segErr } = await supabase
          .from('river_segments')
          .update({
            priority_score: fused.priority_score,
            priority_level: fused.priority_level,
            last_updated: new Date().toISOString()
          })
          .eq('segment_id', segId);

        if (segErr) console.warn(`[Sync API] Failed to update segment score for ${segId}:`, segErr);
      } else {
        // Sync mock data
        const mockSegment = mockData.getSegmentById(segId);
        if (mockSegment) {
          mockSegment.satellite_metrics = metrics;
          mockSegment.priority_score = fused.priority_score;
          mockSegment.priority_level = fused.priority_level;
          mockSegment.last_updated = new Date().toISOString();
        }
      }

      results.push({
        segment_id: segId,
        metrics,
        fused_result: fused
      });
    }

    res.json({
      success: true,
      live: !runMock && !!supabase,
      message: 'Recalculation and synchronization complete across all river segments.',
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error('[Sync Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
