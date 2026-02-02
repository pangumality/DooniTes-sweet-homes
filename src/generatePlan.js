export function generatePlan({ 
  width, 
  depth, 
  floors, 
  bedrooms, 
  kitchens, 
  bathrooms = 2,
  bathroomSize = "Standard",
  masterBedroomSize = "Standard",
  facing, 
  features 
}) { 
  const rooms = []; 
  const stairs = []; 
  const extras = []; 

  const entranceSide = { 
    North: "bottom", 
    South: "top", 
    East: "left", 
    West: "right" 
  }; 

  const outsideOffset = { 
    bottom: { x: width * 0.1, y: -10 }, 
    top: { x: width * 0.1, y: depth }, 
    left: { x: -10, y: depth * 0.1 }, 
    right: { x: width, y: depth * 0.1 } 
  }; 

  // Size Multipliers
  const getSizeMultiplier = (size) => {
      switch(size) {
          case "Big": return 1.3;
          case "Small": return 0.8;
          default: return 1.0;
      }
  };

  const mbMult = getSizeMultiplier(masterBedroomSize);
  const bathMult = getSizeMultiplier(bathroomSize);

  for (let floor = 0; floor < floors; floor++) { 
    // Living room 
    rooms.push({ 
      type: "living", 
      x: 0, 
      y: 0, 
      w: width * 0.6, 
      h: depth * 0.4, 
      floor, 
      doors: [], 
      windows: [] 
    }); 

    // Office (Ground Floor, if selected)
    if (features.office && floor === 0) {
        rooms.push({
            type: "office",
            x: 0,
            y: depth * 0.4 + (kitchens * 10), // After kitchens
            w: 12,
            h: 10,
            floor,
            doors: [{x: 6, y: 0}],
            windows: [{x: 2, y: 10}]
        });
    }

    // Bedrooms 
    for (let i = 0; i < bedrooms; i++) { 
      const isMaster = (i === 0);
      const mult = isMaster ? mbMult : 1.0;
      const h = 12 * mult;
      
      rooms.push({ 
        type: isMaster ? "master bedroom" : "bedroom", 
        x: width * 0.6, 
        y: i * 14, // Increased spacing
        w: width * 0.4, 
        h: h, 
        floor, 
        doors: [{ x: 0, y: h/2 }], 
        windows: [{ x: width * 0.4 - 2, y: 2 }] 
      }); 
    } 

    // Bathrooms
    for (let i = 0; i < bathrooms; i++) {
        const h = 8 * bathMult;
        rooms.push({
            type: "bath",
            x: width * 0.3 + (i * 10),
            y: depth * 0.6,
            w: 8 * bathMult,
            h: h,
            floor,
            doors: [{x: 0, y: h/2}],
            windows: []
        });
    }

    // Kitchens (ground floor only) 
    if (floor === 0) { 
      for (let i = 0; i < kitchens; i++) { 
        rooms.push({ 
          type: "kitchen", 
          x: 0, 
          y: depth * 0.4 + i * 10, 
          w: width * 0.4, 
          h: 10, 
          floor, 
          doors: [{ x: width * 0.4 - 2, y: 5 }], 
          windows: [{ x: 2, y: 0 }] 
        }); 
      } 
    } 

    // Stairs 
    if (floor < floors - 1) { 
      stairs.push({ 
        x: width * 0.45, 
        y: depth * 0.45, 
        w: 6, 
        h: 10, 
        fromFloor: floor, 
        toFloor: floor + 1 
      }); 
    } 

    // Balcony (upper floors only) 
    if (features.balcony && floor > 0) { 
      extras.push({ 
        type: "balcony", 
        x: width * 0.2, 
        y: -6, 
        w: width * 0.3, 
        h: 6, 
        floor 
      }); 
    } 
  } 

  // Garden (ground, outside plot) 
  if (features.garden) { 
    const side = entranceSide[facing]; 
    const pos = outsideOffset[side]; 
    extras.push({
      type: "garden",
      x: pos.x,
      y: pos.y,
      w: 15,
      h: 10,
      floor: 0
    });
  }

  // Parking (ground, typically near entrance or side)
  if (features.parking) {
    const side = entranceSide[facing];
    const pos = outsideOffset[side];
    // Offset slightly from garden if both exist
    const offsetX = features.garden ? 20 : 0;
    
    extras.push({
      type: "parking",
      x: pos.x + offsetX,
      y: pos.y,
      w: 12,
      h: 18, // Standard parking spot size
      floor: 0
    });
  } 

  // Garage (ground, road-facing) 
  if (features.garage) { 
    const side = entranceSide[facing]; 
    const pos = outsideOffset[side]; 

    extras.push({ 
      type: "garage", 
      x: pos.x + 10, 
      y: pos.y, 
      w: 12, 
      h: 18, 
      floor: 0 
    }); 
  } 

  return { rooms, stairs, extras }; 
} 
