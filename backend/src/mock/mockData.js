/**
 * In-memory Mock Data Provider for backend MOCK_MODE=true
 */

const fs = require('fs');
const path = require('path');

let mockSegments = [];

function loadMockData() {
  const filePath = path.join(__dirname, '../../../data/sample/mock_segments.json');
  if (fs.existsSync(filePath)) {
    mockSegments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
}

// Initial load
loadMockData();

function getAllSegments() {
  return mockSegments.map(s => ({
    segment_id: s.segment_id,
    name: s.name,
    length_km: s.length_km,
    centroid: s.centroid,
    priority_score: s.priority_score,
    investigation_priority_score: s.priority_score,
    priority_level: s.priority_level,
    has_ground_data: s.ground_evidence && s.ground_evidence.length > 0,
    last_updated: s.last_updated
  }));
}

function getSegmentById(id) {
  return mockSegments.find(s => s.segment_id === id) || null;
}

function addGroundEvidence(segmentId, evidence, newFusedScore) {
  const segment = mockSegments.find(s => s.segment_id === segmentId);
  if (segment) {
    if (!segment.ground_evidence) segment.ground_evidence = [];
    segment.ground_evidence.unshift(evidence);
    segment.priority_score = newFusedScore.priority_score;
    segment.investigation_priority_score = newFusedScore.priority_score;
    segment.priority_level = newFusedScore.priority_level;
    segment.evidence_agreement = newFusedScore.evidence_agreement;
    segment.recommended_action = newFusedScore.recommended_action;
    segment.last_updated = new Date().toISOString();
    return true;
  }
  return false;
}

module.exports = {
  getAllSegments,
  getSegmentById,
  addGroundEvidence
};
