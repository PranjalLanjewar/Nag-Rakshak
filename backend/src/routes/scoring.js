/**
 * Evidence Fusion & Scoring Routes
 * Ownership: Person 2 (Backend Engineer)
 */

const express = require('express');
const router = express.Router();
const { fuseEvidence } = require('../services/fusionEngine');
const mockData = require('../mock/mockData');

// POST /api/scoring/fuse - Manually recalculate fusion score for a segment
router.post('/fuse', (req, res) => {
  const { segment_id, satellite_score, ground_score } = req.body;

  if (!segment_id) {
    return res.status(400).json({ success: false, error: 'segment_id is required' });
  }

  const result = fuseEvidence(
    Number(satellite_score) || 50,
    ground_score !== undefined && ground_score !== null ? Number(ground_score) : null
  );

  res.json({ success: true, segment_id, fusion_result: result });
});

module.exports = router;
