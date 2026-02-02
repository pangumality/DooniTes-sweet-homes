import { QUALITY_PRESETS } from "./quality";

export function estimateCost({ 
  builtUpArea, 
  floors, 
  quality 
}) { 
  const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS["Super"];
  const base = preset.costPerSqFt; 
  const totalArea = builtUpArea * floors; 
  const estimatedCost = totalArea * base;

  return { 
    totalArea, 
    estimatedCost: estimatedCost, 
    breakdown: { 
      structure: Math.round(estimatedCost * 0.35), 
      finishes: Math.round(estimatedCost * 0.25), 
      electrical: Math.round(estimatedCost * 0.1), 
      plumbing: Math.round(estimatedCost * 0.1), 
      misc: Math.round(estimatedCost * 0.2) 
    } 
  }; 
} 
