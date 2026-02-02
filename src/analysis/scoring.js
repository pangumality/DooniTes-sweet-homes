import { analyzeRoom } from "./environment";

export function scoreLayout(rooms, plotWidth, plotDepth) { 
  let score = 0; 
  let maxPossibleScore = 0;

  rooms.forEach(room => { 
    const analysis = analyzeRoom(room, plotWidth, plotDepth);
    
    // Sunlight Score (0-3 usually, maybe higher based on implementation)
    // SUN_PRIORITY: South=3, East/West=2, North=1.
    // Max sunlight score per room depends on exposure.
    score += analysis.sunlightScore; 
    maxPossibleScore += 3; // Assume max 3 per room for normalization (approx)

    // Ventilation Bonus
    if (analysis.ventilation.crossVentilation) {
        score += 2; 
    }
    maxPossibleScore += 2;
  }); 

  // Penalize bad aspect ratios or other heuristics?
  // For now, simple sum.
  
  // Normalize to 0-100
  const normalizedScore = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;

  return {
      raw: score,
      normalized: normalizedScore,
      grade: normalizedScore >= 80 ? 'A' : normalizedScore >= 60 ? 'B' : normalizedScore >= 40 ? 'C' : 'D'
  };
} 
