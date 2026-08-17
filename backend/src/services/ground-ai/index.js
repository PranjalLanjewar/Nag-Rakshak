/**
 * Ground AI Service Module Entry Point
 * Ownership: Person 3 (Ground AI Specialist)
 */

const { analyzeImage } = require('./analyzer');

/**
 * Processes an uploaded photo file and returns ground evidence record
 */
async function processGroundPhoto(file, segmentId, extraData = {}) {
  const analysis = await analyzeImage(file ? file.buffer : null, file ? file.originalname : '');
  
  const evidence = {
    id: `ev-${Date.now()}`,
    segment_id: segmentId,
    photo_url: file ? `/uploads/${file.filename || file.originalname}` : '/assests/ChatGPT Image Aug 15, 2026, 06_04_30 PM.png',
    uploaded_at: new Date().toISOString(),
    location: {
      lat: Number(extraData.lat) || 21.1400,
      lng: Number(extraData.lng) || 79.0850
    },
    ai_analysis: {
      waste_detected: analysis.waste_detected,
      foam_detected: analysis.foam_detected,
      discoloration_detected: analysis.discoloration_detected,
      bank_degradation_detected: analysis.bank_degradation_detected,
      confidence_score: analysis.confidence_score
    },
    ground_score: analysis.ground_score,
    notes: extraData.notes || 'Ground photo submitted via mobile/web UI'
  };

  return evidence;
}

module.exports = {
  processGroundPhoto,
  analyzeImage
};
