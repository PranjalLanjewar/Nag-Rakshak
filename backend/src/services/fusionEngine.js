/**
 * Evidence Fusion Engine
 * Ownership: Person 2 (Backend Engineer)
 *
 * Combines Satellite Score (0-100) and Ground Score (0-100)
 * Logic:
 * - Ground evidence has HIGHER weight (65% ground, 35% satellite) when available.
 * - If no ground data exists -> 100% Satellite score.
 * - Calculates priority level: Low (0-25), Moderate (26-50), High (51-75), Critical (76-100).
 */

function calculatePriorityLevel(score) {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Critical';
}

function calculateEvidenceAgreement(satelliteScore, groundScore) {
  if (groundScore === null || groundScore === undefined) {
    return 'Satellite Only';
  }
  const diff = Math.abs(satelliteScore - groundScore);
  if (diff <= 15) return 'High Agreement';
  if (diff <= 35) return 'Moderate Agreement';
  return 'Discrepancy Detected';
}

function generateRecommendedAction(priorityLevel, evidenceAgreement) {
  switch (priorityLevel) {
    case 'Critical':
      return 'Immediate emergency inspection & physical containment barrier deployment required.';
    case 'High':
      return 'Dispatch field team for sample collection and source tracing within 48 hours.';
    case 'Moderate':
      return 'Schedule routine field observation and trash boom maintenance within 7 days.';
    case 'Low':
    default:
      return 'Routine satellite monitoring; no immediate field intervention needed.';
  }
}

/**
 * Main Evidence Fusion Function
 */
function fuseEvidence(satelliteScore, groundScore = null) {
  let investigation_priority_score = satelliteScore;

  if (groundScore !== null && groundScore !== undefined) {
    // Ground evidence weighted higher (65% ground, 35% satellite)
    investigation_priority_score = Math.round((groundScore * 0.65) + (satelliteScore * 0.35));
  }

  // Ensure strictly bounded [0, 100]
  investigation_priority_score = Math.min(100, Math.max(0, investigation_priority_score));

  const priority_level = calculatePriorityLevel(investigation_priority_score);
  const evidence_agreement = calculateEvidenceAgreement(satelliteScore, groundScore);
  const recommended_action = generateRecommendedAction(priority_level, evidence_agreement);

  return {
    investigation_priority_score,
    priority_level,
    satellite_score: satelliteScore,
    ground_score: groundScore,
    has_ground_data: groundScore !== null && groundScore !== undefined,
    evidence_agreement,
    recommended_action,
    calculated_at: new Date().toISOString()
  };
}

module.exports = {
  fuseEvidence,
  calculatePriorityLevel
};
