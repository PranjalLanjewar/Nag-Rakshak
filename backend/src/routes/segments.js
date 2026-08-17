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
        const mappedData = data.map(s => ({
          ...s,
          priority_score: s.priority_score,
          investigation_priority_score: s.priority_score
        }));
        return res.json({ success: true, count: mappedData.length, live: true, data: mappedData });
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

// Helper to generate mock historical data for graphing
function getHistoricalMockData(segmentId, currentMetrics) {
  const history = [];
  const baseScore = currentMetrics ? (currentMetrics.satellite_score || 50) : 50;
  const seed = parseInt(segmentId.replace(/\D/g, '')) || 1;

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const dateStr = d.toISOString().split('T')[0].substring(0, 7) + "-15";
    
    // Smooth sinusoidal monthly variation to simulate dry/wet cycles
    const variation = Math.sin((i + seed) * 1.2) * 15;
    const score = Math.min(100, Math.max(0, Math.round(baseScore + variation)));
    
    history.push({
      acquisition_date: dateStr,
      ndwi: Number(((currentMetrics?.ndwi || 0.2) + (variation * 0.003)).toFixed(3)),
      ndti: Number(((currentMetrics?.ndti || 0.3) - (variation * 0.004)).toFixed(3)),
      ndvi: Number(((currentMetrics?.ndvi || 0.4) + (variation * 0.002)).toFixed(3)),
      satellite_score: score
    });
  }
  return history;
}

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

        // Fetch all historical satellite metrics
        const { data: satHistory } = await supabase
          .from('satellite_metrics')
          .select('*')
          .eq('segment_id', segmentId)
          .order('acquisition_date', { ascending: true });

        const currentSat = satList && satList[0] ? {
          ndwi: Number(satList[0].ndwi),
          mndwi: Number(satList[0].mndwi),
          ndti: Number(satList[0].ndti),
          ndvi: Number(satList[0].ndvi),
          temporal_change_percent: Number(satList[0].temporal_change_percent),
          satellite_score: satList[0].satellite_score,
          acquisition_date: satList[0].acquisition_date
        } : null;

        // Map database response to standard data contract
        const detailedSegment = {
          segment_id: segment.segment_id,
          name: segment.name,
          length_km: Number(segment.length_km),
          centroid: segment.centroid,
          priority_score: segment.priority_score,
          investigation_priority_score: segment.priority_score,
          priority_level: segment.priority_level,
          last_updated: segment.last_updated,
          satellite_metrics: currentSat,
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
          historical_data: satHistory && satHistory.length >= 2 
            ? satHistory.map(h => ({
                acquisition_date: h.acquisition_date,
                ndwi: Number(h.ndwi),
                ndti: Number(h.ndti),
                ndvi: Number(h.ndvi),
                satellite_score: h.satellite_score
              }))
            : getHistoricalMockData(segmentId, currentSat),
          evidence_agreement: segment.has_ground_data ? 'High Agreement' : 'Satellite Only',
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
    
    // Add simulated historical data to mock segment response
    const currentSat = segment.satellite_metrics;
    const responseData = {
      ...segment,
      historical_data: getHistoricalMockData(segmentId, currentSat)
    };
    
    res.json({ success: true, live: false, data: responseData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
