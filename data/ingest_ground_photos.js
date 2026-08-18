/**
 * Ground Photo Auto-Ingestion Pipeline
 * Links the 25 observations to their closest segments, runs Vision AI,
 * and uploads them to Supabase (live) and mock_segments.json (static data cache).
 */

require('dotenv').config({ path: 'backend/.env' });
const fs = require('fs');
const path = require('path');
const { getSupabaseClient } = require('../backend/src/config/supabase');
const { analyzeImage } = require('../backend/src/services/ground-ai/analyzer');
const { fuseEvidence } = require('../backend/src/services/fusionEngine');

// Load environment config
const API_KEY = process.env.GEMINI_API_KEY || "";
process.env.GEMINI_API_KEY = API_KEY;
process.env.AI_PROVIDER = 'gemini'; // Force live Gemini analysis

// Load datasets
const observations = require('../assests/observations.json');
const segmentsGeoJson = require('./geojson/nag-river-segments.json');
const mockSegmentsPath = path.join(__dirname, '../data/sample/mock_segments.json');
let mockSegments = JSON.parse(fs.readFileSync(mockSegmentsPath, 'utf8'));

// Helper: Haversine distance
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

// Find closest segment for a coordinate
function findClosestSegment(lat, lon) {
  let closestSegId = null;
  let minDistance = Infinity;

  segmentsGeoJson.features.forEach(feat => {
    const centroid = feat.properties.centroid; // [lat, lon]
    const d = getHaversineDistance(lat, lon, centroid[0], centroid[1]);
    if (d < minDistance) {
      minDistance = d;
      closestSegId = feat.properties.segment_id;
    }
  });

  return { closestSegId, distanceMeters: minDistance };
}

async function run() {
  console.log(`[Ingestion Pipeline] Starting photo matching & AI analysis for ${observations.length} items...`);
  const supabase = getSupabaseClient();
  const hasLiveDb = !!supabase && process.env.MOCK_MODE !== 'true';

  if (hasLiveDb) {
    console.log('[Ingestion Pipeline] Live Supabase DB detected. Will upload records live.');
  } else {
    console.log('[Ingestion Pipeline] Supabase not active. Saving to local mock_segments.json datastore.');
  }

  for (let i = 0; i < observations.length; i++) {
    const obs = observations[i];
    const imagePath = path.join(__dirname, '../assests/Images', obs.image);

    if (!fs.existsSync(imagePath)) {
      console.warn(`[Ingestion Pipeline] Image not found: ${imagePath}, skipping.`);
      continue;
    }

    const { closestSegId, distanceMeters } = findClosestSegment(obs.latitude, obs.longitude);
    console.log(`[Ingestion Pipeline] Image ${obs.image} matched closest to Segment ${closestSegId} (Distance: ${Math.round(distanceMeters)}m)`);

    // 1. Run live Gemini AI analysis on image buffer
    const imgBuffer = fs.readFileSync(imagePath);
    console.log(`[Ingestion Pipeline] Analyzing ${obs.image} via Gemini 2.5 Flash API...`);
    let analysis;
    try {
      analysis = await analyzeImage(imgBuffer, obs.image);
    } catch (e) {
      console.error(`[Ingestion Pipeline] Gemini analysis failed for ${obs.image}:`, e.message);
      continue;
    }

    const evidenceId = `ev-${closestSegId}-${i + 1}`;
    const photoUrl = `/assests/Images/${obs.image}`; // Static assets route folder URL

    const evidenceObj = {
      id: evidenceId,
      segment_id: closestSegId,
      photo_url: photoUrl,
      uploaded_at: new Date().toISOString(),
      location: {
        lat: obs.latitude,
        lng: obs.longitude
      },
      ai_analysis: {
        waste_detected: analysis.waste_detected,
        foam_detected: analysis.foam_detected,
        discoloration_detected: analysis.discoloration_detected,
        bank_degradation_detected: analysis.bank_degradation_detected,
        confidence_score: analysis.confidence_score
      },
      ground_score: analysis.ground_score,
      notes: `Ingested Ground Photo ${obs.image} at [${obs.latitude}, ${obs.longitude}]`
    };

    // 2. Update local mock segments cache file
    const targetMockSegment = mockSegments.find(s => s.segment_id === closestSegId);
    if (targetMockSegment) {
      if (!targetMockSegment.ground_evidence) {
        targetMockSegment.ground_evidence = [];
      }
      const existingIdx = targetMockSegment.ground_evidence.findIndex(ev => ev.id === evidenceObj.id);
      if (existingIdx === -1) {
        targetMockSegment.ground_evidence.push(evidenceObj);
      } else {
        targetMockSegment.ground_evidence[existingIdx] = evidenceObj;
      }
      targetMockSegment.has_ground_data = true;

      // Re-fuse score using new ground score
      const satScore = targetMockSegment.satellite_metrics?.satellite_score || 50;
      const fused = fuseEvidence(satScore, analysis.ground_score);

      targetMockSegment.priority_score = fused.priority_score;
      targetMockSegment.priority_level = fused.priority_level;
      targetMockSegment.evidence_agreement = fused.evidence_agreement;
      targetMockSegment.recommended_action = fused.recommended_action;
      targetMockSegment.last_updated = new Date().toISOString();
    }

    // 3. Upload to Supabase if live
    if (hasLiveDb) {
      try {
        // Upload photo to Supabase storage bucket
        const fileExt = obs.image.split('.').pop() || 'jpg';
        const storageFileName = `${closestSegId}-${obs.image}`;

        console.log(`[Ingestion Pipeline] Uploading ${obs.image} to Supabase bucket...`);
        const { error: storageErr } = await supabase.storage
          .from('ground-photos')
          .upload(storageFileName, imgBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        let dbPhotoUrl = photoUrl;
        if (!storageErr) {
          const { data: publicUrlData } = supabase.storage
            .from('ground-photos')
            .getPublicUrl(storageFileName);
          dbPhotoUrl = publicUrlData.publicUrl;
        } else {
          console.warn('[Ingestion Pipeline] Storage upload failed, using fallback asset URL:', storageErr.message);
        }

        // Insert evidence row
        const { error: dbErr } = await supabase
          .from('ground_evidence')
          .insert({
            id: evidenceId,
            segment_id: closestSegId,
            photo_url: dbPhotoUrl,
            lat: obs.latitude,
            lng: obs.longitude,
            waste_detected: analysis.waste_detected,
            foam_detected: analysis.foam_detected,
            discoloration_detected: analysis.discoloration_detected,
            bank_degradation_detected: analysis.bank_degradation_detected,
            confidence_score: analysis.confidence_score,
            ground_score: analysis.ground_score,
            notes: evidenceObj.notes
          });

        if (dbErr) throw dbErr;

        // Fetch segment's current satellite score
        const { data: satList } = await supabase
          .from('satellite_metrics')
          .select('satellite_score')
          .eq('segment_id', closestSegId)
          .order('acquisition_date', { ascending: false })
          .limit(1);

        const satScore = satList && satList[0] ? satList[0].satellite_score : 50;
        const fused = fuseEvidence(satScore, analysis.ground_score);

        // Update segment fused score
        const { error: updateErr } = await supabase
          .from('river_segments')
          .update({
            priority_score: fused.priority_score,
            priority_level: fused.priority_level,
            has_ground_data: true,
            last_updated: new Date().toISOString()
          })
          .eq('segment_id', closestSegId);

        if (updateErr) throw updateErr;

        console.log(`[Ingestion Pipeline] Segment ${closestSegId} updated successfully in Supabase DB.`);
      } catch (err) {
        console.error(`[Ingestion Pipeline] Supabase database transaction failed for segment ${closestSegId}:`, err.message);
      }
    }
  }

  // Save updated local mock segments datastore
  fs.writeFileSync(mockSegmentsPath, JSON.stringify(mockSegments, null, 2), 'utf8');
  console.log('[Ingestion Pipeline] Successfully updated mock_segments.json with ground photos.');
  console.log('[Ingestion Pipeline] Pipeline run completed successfully!');
}

run().catch(console.error);
