import { getSunExposure, SUN_PRIORITY } from "./sunLogic"; 
import { analyzeVentilation } from "./ventilation"; 

export function analyzeRoom(room, plotWidth, plotDepth) { 
  const sunSides = getSunExposure(room, plotWidth, plotDepth); 

  const sunlightScore = sunSides.reduce( 
    (sum, s) => sum + SUN_PRIORITY[s], 
    0 
  ); 

  const ventilation = analyzeVentilation(room, plotWidth, plotDepth); 

  return { 
    sunlightScore, 
    sunSides, 
    ventilation 
  }; 
} 
