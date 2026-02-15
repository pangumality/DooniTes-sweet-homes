export function analyzeSoil(lat, lng) { 
  // simplified regional logic 
  // In a real app, this would query a GIS database
  if (lat > 20 && lat < 25) { 
    return { 
      type: "Black Cotton", 
      bearingCapacity: 100, 
      foundationType: "Pile / Raft Foundation", 
      riskLevel: "High" 
    }; 
  } 

  if (lat > 15 && lat <= 20) {
      return {
          type: lng > 80 ? "Laterite" : "Red Soil",
          bearingCapacity: 250,
          foundationType: "Isolated Footing",
          riskLevel: "Low"
      };
  }

  return { 
    type: lng < 75 ? "Sandy / Alluvial" : "Silty",
    bearingCapacity: 180, 
    foundationType: "Isolated Footing", 
    riskLevel: "Medium" 
  }; 
} 
