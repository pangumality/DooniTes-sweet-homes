export const SUN_PRIORITY = { 
  North: 1, 
  East: 2, 
  West: 2, 
  South: 3 
}; 

export function getSunExposure(room, plotWidth, plotDepth) { 
  const exposures = []; 

  if (room.y === 0) exposures.push("North"); 
  if (room.y + room.h === plotDepth) exposures.push("South"); 
  if (room.x === 0) exposures.push("West"); 
  if (room.x + room.w === plotWidth) exposures.push("East"); 

  return exposures; 
} 
