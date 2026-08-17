/**
 * Ground Photo Vision AI Analyzer
 * Ownership: Person 3 (Ground AI Specialist)
 *
 * Detects: Waste, Foam, Discoloration, Bank degradation.
 * Computes ground_score (0 - 100).
 */

/**
 * Simulates or calls external Vision AI API to detect visual markers
 */
async function analyzeImage(imageBuffer, filename = '') {
  const VISION_AI_API_KEY = process.env.VISION_AI_API_KEY;
  const MOCK_MODE = process.env.MOCK_MODE !== 'false' || !VISION_AI_API_KEY;

  if (MOCK_MODE) {
    console.log('[Ground AI Service] Running Vision AI analysis in MOCK_MODE=true');

    // Deterministic mock analysis based on filename or random seed
    const isHeavy = filename.toLowerCase().includes('critical') || filename.toLowerCase().includes('08_09_01');
    const isModerate = filename.toLowerCase().includes('11_19_18');

    let waste = true;
    let foam = isHeavy;
    let discoloration = isHeavy || isModerate;
    let bank_degradation = !isModerate;

    let score = 45;
    if (waste) score += 20;
    if (foam) score += 25;
    if (discoloration) score += 15;
    if (bank_degradation) score += 10;

    const ground_score = Math.min(100, score);

    return {
      waste_detected: waste,
      foam_detected: foam,
      discoloration_detected: discoloration,
      bank_degradation_detected: bank_degradation,
      confidence_score: 0.92,
      ground_score
    };
  }

  // Live Vision AI Call Integration Skeleton
  console.log('[Ground AI Service] Calling external Vision AI API...');
  // Add live API call here when API key provided
  throw new Error('Vision AI API Key not configured. Please use MOCK_MODE=true.');
}

module.exports = { analyzeImage };
