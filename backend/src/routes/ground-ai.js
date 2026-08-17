/**
 * Ground Photo Upload & AI Processing Route
 * Ownership: Person 3 (Ground AI Specialist) & Person 2
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processGroundPhoto } = require('../services/ground-ai');
const { fuseEvidence } = require('../services/fusionEngine');
const mockData = require('../mock/mockData');

// Multer memory storage for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/segments/:id/ground-photo
router.post('/:id/ground-photo', upload.single('photo'), async (req, res) => {
  const segmentId = req.params.id;

  try {
    const segment = mockData.getSegmentById(segmentId);
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }

    // 1. Process image with Person 3's Vision AI service
    const evidence = await processGroundPhoto(req.file, segmentId, req.body);

    // 2. Recalculate fused priority score with Person 2's Fusion Engine
    const satScore = segment.satellite_metrics ? segment.satellite_metrics.satellite_score : 50;
    const fusedResult = fuseEvidence(satScore, evidence.ground_score);

    // 3. Save evidence in mock data / DB
    mockData.addGroundEvidence(segmentId, evidence, fusedResult);

    res.status(201).json({
      success: true,
      message: 'Ground photo processed and priority score updated',
      evidence,
      updated_fused_score: fusedResult
    });
  } catch (err) {
    console.error('[Ground AI Route Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
