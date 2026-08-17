/**
 * Segments Routes
 * Ownership: Person 2 (Backend Engineer)
 */

const express = require('express');
const router = express.Router();
const mockData = require('../mock/mockData');

// GET /api/segments - List all segments
router.get('/', (req, res) => {
  try {
    const segments = mockData.getAllSegments();
    res.json({ success: true, count: segments.length, data: segments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/segments/:id - Get details of a single segment
router.get('/:id', (req, res) => {
  try {
    const segment = mockData.getSegmentById(req.params.id);
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    res.json({ success: true, data: segment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
