/**
 * Segments Routes (with Dynamic Mock / Live Supabase branch handling)
 * Ownership: Person 2 (Backend Engineer)
 */

const express = require('express');
const router = express.Router();
const mockData = require('../mock/mockData');
const { isMock } = require('../config/mockSwitch');
const { getSupabaseClient } = require('../config/supabase');

// GET /api/segments - List all segments
router.get('/', async (req, res) => {
  try {
    const runMock = isMock(req);
    const supabase = getSupabaseClient();

    if (!runMock && supabase) {
      console.log('[API] Routing to LIVE Supabase instance for segments list');
      const { data, error } = await supabase
        .from('river_segments')
        .select('*')
        .order('segment_id', { ascending: true });

      if (!error && data) {
        return res.json({ success: true, count: data.length, live: true, data });
      }
      console.warn('[Database] Supabase query failed, falling back to mock data:', error);
    }

    // Default mock response
    const segments = mockData.getAllSegments();
    res.json({ success: true, count: segments.length, live: false, data: segments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/segments/:id - Get details of a single segment
router.get('/:id', async (req, res) => {
  const segmentId = req.params.id;

  try {
    const runMock = isMock(req);
    const supabase = getSupabaseClient();

    if (!runMock && supabase) {
      console.log(`[API] Routing to LIVE Supabase instance for segment details: ${segmentId}`);
      
      // Fetch segment details
      const { data: segment, error: segErr } = await supabase
        .from('river_segments')
        .select('*')
        .eq('segment_id', segmentId)
        .single();

      if (!segErr && segment) {
        // Fetch latest satellite metrics
        const { data: satList } = await supabase
          .from('satellite_metrics')
          .select('*')
          .eq('segment_id', segmentId)
          .order('acquisition_date', { ascending: false })
          .limit(1);

        // Fetch ground evidence list
        const { data: groundList } = await supabase
          .from('ground_evidence')
          .select('*')
          .eq('segment_id', segmentId)
          .order('uploaded_at', { ascending: false });

        // Map database response to standard data contract
        const detailedSegment = {
          segment_id: segment.segment_id,
          name: segment.name,
          length_km: Number(segment.length_km),
          centroid: segment.centroid,
          investigation_priority_score: segment.investigation_priority_score,
          priority_level: segment.priority_level,
          last_updated: segment.last_updated,
          satellite_metrics: satList && satList[0] ? {
            ndwi: Number(satList[0].ndwi),
            mndwi: Number(satList[0].mndwi),
            ndti: Number(satList[0].ndti),
            ndvi: Number(satList[0].ndvi),
            temporal_change_percent: Number(satList[0].temporal_change_percent),
            satellite_score: satList[0].satellite_score,
            acquisition_date: satList[0].acquisition_date
          } : null,
          ground_evidence: (groundList || []).map(g => ({
            id: g.id,
            photo_url: g.photo_url,
            uploaded_at: g.uploaded_at,
            ground_score: g.ground_score,
            ai_analysis: {
              waste_detected: g.waste_detected,
              foam_detected: g.foam_detected,
              discoloration_detected: g.discoloration_detected,
              bank_degradation_detected: g.bank_degradation_detected,
              confidence_score: Number(g.confidence_score)
            },
            notes: g.notes
          })),
          evidence_agreement: segment.has_ground_data ? 'High Agreement' : 'Satellite Only', // Simple mapper
          recommended_action: segment.priority_level === 'Critical' 
            ? 'Immediate priority inspection required.' 
            : 'Scheduled monitoring.'
        };

        return res.json({ success: true, live: true, data: detailedSegment });
      }
      console.warn('[Database] Supabase detail query failed, falling back to mock data:', segErr);
    }

    // Default mock response
    const segment = mockData.getSegmentById(segmentId);
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    res.json({ success: true, live: false, data: segment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
