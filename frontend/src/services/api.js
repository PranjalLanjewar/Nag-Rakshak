/**
 * API Service Client with Automatic Mock Fallback
 * Ownership: Person 1 (Frontend Engineer)
 */

import mockSegmentsList from '../../../data/sample/mock_segments.json';

const API_BASE = '/api';

export async function fetchSegments() {
  try {
    const res = await fetch(`${API_BASE}/segments`);
    if (!res.ok) throw new Error('API failed');
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn('[Frontend API] Backend endpoint unavailable, loading local mock dataset.');
    return mockSegmentsList.map(s => ({
      segment_id: s.segment_id,
      name: s.name,
      length_km: s.length_km,
      centroid: s.centroid,
      investigation_priority_score: s.investigation_priority_score,
      priority_level: s.priority_level,
      has_ground_data: s.ground_evidence && s.ground_evidence.length > 0,
      last_updated: s.last_updated
    }));
  }
}

export async function fetchSegmentDetails(segmentId) {
  try {
    const res = await fetch(`${API_BASE}/segments/${segmentId}`);
    if (!res.ok) throw new Error('API failed');
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn(`[Frontend API] Loading mock detail for ${segmentId}`);
    const found = mockSegmentsList.find(s => s.segment_id === segmentId);
    return found || mockSegmentsList[0];
  }
}

export async function uploadGroundPhoto(segmentId, formData) {
  try {
    const res = await fetch(`${API_BASE}/segments/${segmentId}/ground-photo`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload API failed');
    return await res.json();
  } catch (err) {
    console.warn('[Frontend API] Mocking ground photo upload submission...');
    return {
      success: true,
      message: 'Photo submitted (Mock Mode)',
      evidence: {
        id: `ev-${Date.now()}`,
        segment_id: segmentId,
        photo_url: '/assests/ChatGPT Image Aug 15, 2026, 06_04_30 PM.png',
        uploaded_at: new Date().toISOString(),
        ground_score: 82,
        ai_analysis: {
          waste_detected: true,
          foam_detected: true,
          discoloration_detected: true,
          bank_degradation_detected: false,
          confidence_score: 0.94
        }
      },
      updated_fused_score: {
        investigation_priority_score: 85,
        priority_level: 'Critical'
      }
    };
  }
}
