export function generatePlan({ 
  width, 
  depth, 
  floors, 
  masterBedrooms = 1,
  kidsBedrooms = 2,
  guestRooms = 1,
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

  // Layout Constants
  const corridorW = 6;
  const centerX = width / 2;
  const leftLimit = centerX - corridorW / 2;
  const rightStart = centerX + corridorW / 2;

  for (let floor = 0; floor < floors; floor++) { 
    // Central Corridor
    rooms.push({
        type: "corridor",
        x: leftLimit,
        y: 0,
        w: corridorW,
        h: depth,
        floor,
        doors: [], // Doors will be on other rooms connecting to this
        windows: []
    });

    // Living room (Left Top)
    rooms.push({ 
      type: "living", 
      x: 0, 
      y: 0, 
      w: leftLimit, 
      h: depth * 0.4, 
      floor, 
      doors: [{ x: leftLimit, y: depth * 0.2 }], // Door to corridor
      windows: [{ x: 2, y: 5 }] 
    }); 

    // Kitchens (Left Middle)
    if (floor === 0) { 
      for (let i = 0; i < kitchens; i++) { 
        rooms.push({ 
          type: "kitchen", 
          x: 0, 
          y: depth * 0.4 + i * 12, 
          w: leftLimit, 
          h: 12, 
          floor, 
          doors: [{ x: leftLimit, y: 6 }], // Door to corridor
          windows: [{ x: 2, y: 6 }] 
        }); 
      } 
    } 

    // Office (Left Bottom, if space)
    if (features.office && floor === 0) {
        rooms.push({
            type: "office",
            x: 0,
            y: depth * 0.4 + (kitchens * 12), 
            w: leftLimit,
            h: 10,
            floor,
            doors: [{x: leftLimit, y: 5}],
            windows: [{x: 2, y: 5}]
        });
    }

    // Right Side Layout (Master, Kids, Guest, Baths)
    let currentY = 0;
    const roomW = width - rightStart;

    // 1. Master Bedrooms (with attached bath)
    for (let i = 0; i < masterBedrooms; i++) {
        // Master Bedroom
        const mbH = 12 * mbMult;
        rooms.push({
            type: "master bedroom",
            x: rightStart,
            y: currentY,
            w: roomW,
            h: mbH,
            floor,
            doors: [{ x: 0, y: mbH / 2 }], // Door to corridor
            windows: [{ x: roomW - 2, y: mbH / 2 }]
        });
        currentY += mbH; // No gap between bedroom and bath

        // Attached Bath
        const bathH = 8 * bathMult;
        rooms.push({
            type: "bath",
            x: rightStart,
            y: currentY,
            w: roomW,
            h: bathH,
            floor,
            doors: [{ x: 0, y: bathH / 2 }], // Door to corridor for now
            windows: []
        });
        currentY += bathH + 2; // Gap after the suite
    }

    // 2. Kids Bedrooms
    for (let i = 0; i < kidsBedrooms; i++) {
        const h = 12; // Standard bedroom size
        rooms.push({
            type: "kids bedroom",
            x: rightStart,
            y: currentY,
            w: roomW,
            h: h,
            floor,
            doors: [{ x: 0, y: h/2 }],
            windows: [{ x: roomW - 2, y: h/2 }]
        });
        currentY += h + 2;
    }

    // 3. Guest Rooms
    for (let i = 0; i < guestRooms; i++) {
        const h = 11; // Slightly smaller?
        rooms.push({
            type: "guest room",
            x: rightStart,
            y: currentY,
            w: roomW,
            h: h,
            floor,
            doors: [{ x: 0, y: h/2 }],
            windows: [{ x: roomW - 2, y: h/2 }]
        });
        currentY += h + 2;
    }

    // 4. Common Bathrooms
    for (let i = 0; i < bathrooms; i++) {
        const h = 8 * bathMult;
        rooms.push({
            type: "bath",
            x: rightStart,
            y: currentY,
            w: roomW,
            h: h,
            floor,
            doors: [{ x: 0, y: h/2 }],
            windows: []
        });
        currentY += h + 2;
    }

    // Stairs (In Corridor)
    if (floor < floors - 1) { 
      stairs.push({ 
        x: leftLimit + 1, // Inside corridor
        y: depth * 0.5, 
        w: corridorW - 2, 
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
    rooms.push({
      type: "garden",
      x: pos.x,
      y: pos.y,
      w: 15,
      h: 10,
      floor: 0,
      doors: [],
      windows: []
    });
  }

  // Parking (ground, typically near entrance or side)
  if (features.parking) {
    const side = entranceSide[facing]; 
    const pos = outsideOffset[side];
    // Offset slightly from garden if both exist
    const offsetX = features.garden ? 20 : 0;
    
    rooms.push({
      type: "parking",
      x: pos.x + offsetX,
      y: pos.y,
      w: 12,
      h: 18, // Standard parking spot size
      floor: 0,
      doors: [],
      windows: []
    });
  } 

  // Garage (ground, road-facing) 
  if (features.garage) { 
    const side = entranceSide[facing]; 
    const pos = outsideOffset[side]; 

    rooms.push({ 
      type: "garage", 
      x: pos.x + 10, 
      y: pos.y, 
      w: 12, 
      h: 18, 
      floor: 0,
      doors: [],
      windows: [] 
    }); 
  } 

  return { rooms, stairs, extras, groundLayout: { hall: rooms.find(r => r.type === 'corridor' && r.floor === 0) } }; 
} 
