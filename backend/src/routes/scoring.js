/**
 * Evidence Fusion & Scoring Routes (with Dynamic Mock / Live Supabase integration)
 * Ownership: Person 2 (Backend Engineer)
 */

const express = require('express');
const router = express.Router();
const { fuseEvidence } = require('../services/fusionEngine');
const mockData = require('../mock/mockData');
const { isMock } = require('../config/mockSwitch');
const { getSupabaseClient } = require('../config/supabase');

// POST /api/scoring/fuse - Recalculate and update fusion score for a segment
router.post('/fuse', async (req, res) => {
  const { segment_id, satellite_score, ground_score } = req.body;
  const runMock = isMock(req);
  const supabase = getSupabaseClient();

  if (!segment_id) {
    return res.status(400).json({ success: false, error: 'segment_id is required' });
  }

  try {
    const result = fuseEvidence(
      Number(satellite_score) || 50,
      ground_score !== undefined && ground_score !== null ? Number(ground_score) : null
    );

    if (!runMock && supabase) {
      console.log(`[API] Updating fused priority score in live Supabase for segment: ${segment_id}`);
      const { error } = await supabase
        .from('river_segments')
        .update({
          priority_score: result.priority_score,
          priority_level: result.priority_level,
          has_ground_data: result.has_ground_data,
          last_updated: new Date().toISOString()
        })
        .eq('segment_id', segment_id);

      if (error) throw error;
      
      return res.json({ success: true, live: true, segment_id, fusion_result: result });
    }

    res.json({ success: true, live: false, segment_id, fusion_result: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
