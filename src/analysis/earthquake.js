export function getEarthquakeZone(lat, lng) { 
  // Simplified India Zone Map Logic
  // Zone V: Very High Risk (Himalayas, North East, Kutch)
  // Zone IV: High Risk (Delhi, North India)
  // Zone III: Moderate Risk (Chennai, Mumbai, Kolkata)
  // Zone II: Low Risk (Bangalore, Hyderabad)

  if (lat > 28) return "V"; 
  if (lat > 22 && lat <= 28) return "IV"; 
  if (lat > 15 && lat <= 22) return "III"; 
  return "II"; 
} 

export function earthquakeRecommendations(zone) { 
  switch (zone) { 
    case "V": 
      return [ 
        "Shear walls mandatory", 
        "Column spacing < 3m", 
        "Ductile detailing (IS 13920)",
        "Base isolation recommended"
      ]; 
    case "IV": 
      return [ 
        "Seismic bands required", 
        "Column-beam joint strengthening",
        "Confined masonry"
      ]; 
    case "III":
        return [
            "Standard RCC frame",
            "Braced masonry walls"
        ];
    default: 
      return ["Standard seismic bands sufficient"]; 
  } 
} 
