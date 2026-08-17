/**
 * Ground Photo Upload & AI Processing Route (with Dynamic Mock / Live Supabase integration)
 * Ownership: Person 3 (Ground AI Specialist) & Person 2
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processGroundPhoto } = require('../services/ground-ai');
const { fuseEvidence } = require('../services/fusionEngine');
const mockData = require('../mock/mockData');
const { isMock } = require('../config/mockSwitch');
const { getSupabaseClient } = require('../config/supabase');

// Multer memory storage for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/segments/:id/ground-photo
router.post('/:id/ground-photo', upload.single('photo'), async (req, res) => {
  const segmentId = req.params.id;
  const runMock = isMock(req);
  const supabase = getSupabaseClient();

  try {
    let segment = null;
    let satScore = 50;

    // Load segment details (mock or live)
    if (!runMock && supabase) {
      console.log(`[API] Fetching segment ${segmentId} from live Supabase for ground-photo upload`);
      const { data } = await supabase
        .from('river_segments')
        .select('*')
        .eq('segment_id', segmentId)
        .single();
      segment = data;

      if (segment) {
        // Fetch latest satellite score to fuse with
        const { data: satList } = await supabase
          .from('satellite_metrics')
          .select('satellite_score')
          .eq('segment_id', segmentId)
          .order('acquisition_date', { ascending: false })
          .limit(1);
        if (satList && satList[0]) {
          satScore = satList[0].satellite_score;
        }
      }
    } else {
      segment = mockData.getSegmentById(segmentId);
      if (segment && segment.satellite_metrics) {
        satScore = segment.satellite_metrics.satellite_score;
      }
    }

    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }

    // 1. Process ground photo with Vision AI (Person 3 service)
    const evidence = await processGroundPhoto(req.file, segmentId, req.body);

    // 2. Fused score calculation (Person 2 engine)
    const fusedResult = fuseEvidence(satScore, evidence.ground_score);

    // 3. Save details (Live or Mock branch)
    if (!runMock && supabase) {
      console.log('[API] Saving ground verification evidence to LIVE Supabase');
      let photoUrl = evidence.photo_url;

      // Upload file to Supabase Storage if file is present
      if (req.file) {
        const fileExt = req.file.originalname.split('.').pop() || 'jpg';
        const fileName = `${segmentId}-${Date.now()}.${fileExt}`;
        
        const { data: storageData, error: storageErr } = await supabase.storage
          .from('ground-photos')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
          });

        if (!storageErr && storageData) {
          const { data: publicUrlData } = supabase.storage
            .from('ground-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrlData.publicUrl;
        } else {
          console.warn('[Database] Storage upload failed, utilizing baseline fallback URL:', storageErr);
        }
      }

      // Insert Ground Evidence table record
      const { error: dbErr } = await supabase
        .from('ground_evidence')
        .insert({
          id: evidence.id,
          segment_id: segmentId,
          photo_url: photoUrl,
          lat: evidence.location.lat,
          lng: evidence.location.lng,
          waste_detected: evidence.ai_analysis.waste_detected,
          foam_detected: evidence.ai_analysis.foam_detected,
          discoloration_detected: evidence.ai_analysis.discoloration_detected,
          bank_degradation_detected: evidence.ai_analysis.bank_degradation_detected,
          confidence_score: evidence.ai_analysis.confidence_score,
          ground_score: evidence.ground_score,
          notes: evidence.notes
        });

      if (dbErr) throw dbErr;

      // Update parent segment details
      const { error: updateErr } = await supabase
        .from('river_segments')
        .update({
          investigation_priority_score: fusedResult.investigation_priority_score,
          priority_level: fusedResult.priority_level,
          has_ground_data: true,
          last_updated: new Date().toISOString()
        })
        .eq('segment_id', segmentId);

      if (updateErr) throw updateErr;

      // Update local memory sync
      evidence.photo_url = photoUrl;
      mockData.addGroundEvidence(segmentId, evidence, fusedResult);

      return res.status(201).json({
        success: true,
        live: true,
        message: 'Ground photo saved to live Supabase DB & Storage',
        evidence,
        updated_fused_score: fusedResult
      });
    }

    // Default Mock fallback save
    mockData.addGroundEvidence(segmentId, evidence, fusedResult);

    res.status(201).json({
      success: true,
      live: false,
      message: 'Ground photo processed and priority score updated (Mock Mode)',
      evidence,
      updated_fused_score: fusedResult
    });
  } catch (err) {
    console.error('[Ground AI Route Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
