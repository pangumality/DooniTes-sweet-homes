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
    bottom: { x: width * 0.1, y: -20 }, 
    top: { x: width * 0.1, y: depth }, 
    left: { x: -20, y: depth * 0.1 }, 
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
        currentY += bathH; // No gap after the suite
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
        currentY += h;
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
        currentY += h;
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
        currentY += h;
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
      w: 25,
      h: 20,
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
    const offsetX = features.garden ? 30 : 0;
    
    rooms.push({
      type: "parking",
      x: pos.x + offsetX,
      y: pos.y,
      w: 20,
      h: 30, // Large parking spot size
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
      w: 20, 
      h: 30, 
      floor: 0,
      doors: [],
      windows: [] 
    }); 
  } 

  return { rooms, stairs, extras, groundLayout: { hall: rooms.find(r => r.type === 'corridor' && r.floor === 0) } }; 
} 

// Variants generator: produce three alternate layouts for the same specifications
export function generatePlanVariants(specs) {
  const v1 = generatePlan(specs);
  
  const variantHorizontal = (() => {
    const {
      width, depth, floors,
      masterBedrooms = 1, kidsBedrooms = 2, guestRooms = 1,
      kitchens,
      bathrooms = 2,
      bathroomSize = "Standard",
      masterBedroomSize = "Standard",
      facing,
      features
    } = specs;
    
    const rooms = [];
    const stairs = [];
    const extras = [];
    
    const getSizeMultiplier = (size) => {
      switch(size) {
        case "Big": return 1.3;
        case "Small": return 0.8;
        default: return 1.0;
      }
    };
    const mbMult = getSizeMultiplier(masterBedroomSize);
    const bathMult = getSizeMultiplier(bathroomSize);
    
    const yMid = Math.floor(depth * 0.5);
    const corridorH = 6;
    const topH = Math.max(0, yMid - corridorH/2);
    const bottomStart = yMid + corridorH/2;
    const bottomH = Math.max(0, depth - bottomStart);
    const splitX = Math.floor(width * 0.55);
    
    for (let floor = 0; floor < floors; floor++) {
      // Horizontal corridor across the middle
      rooms.push({
        type: "corridor",
        x: 0,
        y: yMid - corridorH/2,
        w: width,
        h: corridorH,
        floor,
        doors: [],
        windows: []
      });
      
      // Top half: Living (left) and Kitchen(s) (right)
      rooms.push({
        type: "living",
        x: 0,
        y: 0,
        w: splitX,
        h: topH,
        floor,
        doors: [{ x: splitX - 1.5, y: topH - 3 }],
        windows: [{ x: Math.max(2, splitX/2), y: 2 }]
      });
      
      if (floor === 0) {
        const kH = Math.min(12, topH);
        rooms.push({
          type: "kitchen",
          x: splitX,
          y: 0,
          w: width - splitX,
          h: kH,
          floor,
          doors: [{ x: 0.5, y: kH - 3 }],
          windows: [{ x: (width - splitX) - 2, y: kH/2 }]
        });
        // Additional kitchens stacked below if requested
        for (let i = 1; i < kitchens; i++) {
          const y = Math.min(topH - (i * (kH + 2)), topH - kH);
          if (y >= 0) {
            rooms.push({
              type: "kitchen",
              x: splitX,
              y,
              w: width - splitX,
              h: kH,
              floor,
              doors: [{ x: 0.5, y: kH/2 }],
              windows: [{ x: (width - splitX) - 2, y: kH/2 }]
            });
          }
        }
      }
      
      // Bottom half: Bedrooms stacked on the right; optional office on the left
      let curY = bottomStart;
      const rightX = splitX;
      const rightW = width - rightX;
      
      // Master suite
      for (let i = 0; i < masterBedrooms; i++) {
        const mbH = Math.min(12 * mbMult, bottomH - (curY - bottomStart));
        rooms.push({
          type: "master bedroom",
          x: rightX,
          y: curY,
          w: rightW,
          h: mbH,
          floor,
          doors: [{ x: 0, y: mbH/2 }],
          windows: [{ x: rightW - 2, y: mbH/2 }]
        });
        curY += mbH;
        
        const bathH = Math.min(8 * bathMult, bottomH - (curY - bottomStart));
        rooms.push({
          type: "bath",
          x: rightX,
          y: curY,
          w: rightW,
          h: bathH,
          floor,
          doors: [{ x: 0, y: bathH/2 }],
          windows: []
        });
        curY += bathH;
      }
      
      // Kids
      for (let i = 0; i < kidsBedrooms; i++) {
        const h = 12;
        rooms.push({
          type: "kids bedroom",
          x: rightX,
          y: curY,
          w: rightW,
          h,
          floor,
          doors: [{ x: 0, y: h/2 }],
          windows: [{ x: rightW - 2, y: h/2 }]
        });
        curY += h;
      }
      
      // Guest
      for (let i = 0; i < guestRooms; i++) {
        const h = 11;
        rooms.push({
          type: "guest room",
          x: rightX,
          y: curY,
          w: rightW,
          h,
          floor,
          doors: [{ x: 0, y: h/2 }],
          windows: [{ x: rightW - 2, y: h/2 }]
        });
        curY += h;
      }
      
      // Common baths
      for (let i = 0; i < bathrooms; i++) {
        const h = 8 * bathMult;
        rooms.push({
          type: "bath",
          x: rightX,
          y: curY,
          w: rightW,
          h,
          floor,
          doors: [{ x: 0, y: h/2 }],
          windows: []
        });
        curY += h;
      }
      
      // Stairs in corridor center
      if (floor < floors - 1) {
        stairs.push({
          x: Math.max(1, Math.floor(width/2) - 2),
          y: yMid - corridorH/2 + 1,
          w: 4,
          h: corridorH - 2,
          fromFloor: floor,
          toFloor: floor + 1
        });
      }
    }
    
    // Outdoors (same placement logic as base)
    const entranceSide = { North: "bottom", South: "top", East: "left", West: "right" };
    const outsideOffset = {
      bottom: { x: width * 0.1, y: -20 },
      top: { x: width * 0.1, y: depth },
      left: { x: -20, y: depth * 0.1 },
      right: { x: width, y: depth * 0.1 }
    };
    
    if (features.garden) {
      const side = entranceSide[facing];
      const pos = outsideOffset[side];
      rooms.push({ type: "garden", x: pos.x, y: pos.y, w: 25, h: 20, floor: 0, doors: [], windows: [] });
    }
    if (features.parking) {
      const side = entranceSide[facing];
      const pos = outsideOffset[side];
      const offsetX = features.garden ? 30 : 0;
      rooms.push({ type: "parking", x: pos.x + offsetX, y: pos.y, w: 20, h: 30, floor: 0, doors: [], windows: [] });
    }
    if (features.garage) {
      const side = entranceSide[facing];
      const pos = outsideOffset[side];
      rooms.push({ type: "garage", x: pos.x + 10, y: pos.y, w: 20, h: 30, floor: 0, doors: [], windows: [] });
    }
    
    return { rooms, stairs, extras, groundLayout: { hall: rooms.find(r => r.type === 'corridor' && r.floor === 0) } };
  })();
  
  const variantLeftCorridor = (() => {
    const {
      width, depth, floors,
      masterBedrooms = 1, kidsBedrooms = 2, guestRooms = 1,
      kitchens,
      bathrooms = 2,
      bathroomSize = "Standard",
      masterBedroomSize = "Standard",
      facing,
      features
    } = specs;
    
    const rooms = [];
    const stairs = [];
    const extras = [];
    
    const getSizeMultiplier = (size) => {
      switch(size) {
        case "Big": return 1.3;
        case "Small": return 0.8;
        default: return 1.0;
      }
    };
    const mbMult = getSizeMultiplier(masterBedroomSize);
    const bathMult = getSizeMultiplier(bathroomSize);
    
    const corridorW = 6;
    const rightStart = corridorW;
    const rightW = width - rightStart;
    const splitY = Math.floor(depth * 0.5);
    
    for (let floor = 0; floor < floors; floor++) {
      // Vertical corridor along the left edge
      rooms.push({
        type: "corridor",
        x: 0,
        y: 0,
        w: corridorW,
        h: depth,
        floor,
        doors: [],
        windows: []
      });
      
      // Living on right-top
      rooms.push({
        type: "living",
        x: rightStart,
        y: 0,
        w: rightW,
        h: splitY * 0.6,
        floor,
        doors: [{ x: 0, y: (splitY * 0.6)/2 }],
        windows: [{ x: rightW - 2, y: 3 }]
      });
      
      // Kitchens right-middle
      if (floor === 0) {
        const kH = 12;
        rooms.push({
          type: "kitchen",
          x: rightStart,
          y: splitY * 0.6,
          w: Math.floor(rightW * 0.6),
          h: kH,
          floor,
          doors: [{ x: 0, y: kH/2 }],
          windows: [{ x: Math.floor(rightW * 0.6) - 2, y: kH/2 }]
        });
        for (let i = 1; i < kitchens; i++) {
          const y = splitY * 0.6 + i * (kH + 2);
          if (y + kH <= splitY) {
            rooms.push({
              type: "kitchen",
              x: rightStart,
              y,
              w: Math.floor(rightW * 0.6),
              h: kH,
              floor,
              doors: [{ x: 0, y: kH/2 }],
              windows: [{ x: Math.floor(rightW * 0.6) - 2, y: kH/2 }]
            });
          }
        }
      }
      
      // Bedrooms stack on right-bottom
      let curY = splitY;
      // Master suite
      for (let i = 0; i < masterBedrooms; i++) {
        const mbH = 12 * mbMult;
        rooms.push({
          type: "master bedroom",
          x: rightStart,
          y: curY,
          w: rightW,
          h: mbH,
          floor,
          doors: [{ x: 0, y: mbH/2 }],
          windows: [{ x: rightW - 2, y: mbH/2 }]
        });
        curY += mbH;
        const bathH = 8 * bathMult;
        rooms.push({
          type: "bath",
          x: rightStart,
          y: curY,
          w: rightW,
          h: bathH,
          floor,
          doors: [{ x: 0, y: bathH/2 }],
          windows: []
        });
        curY += bathH;
      }
      for (let i = 0; i < kidsBedrooms; i++) {
        const h = 12;
        rooms.push({
          type: "kids bedroom",
          x: rightStart,
          y: curY,
          w: rightW,
          h,
          floor,
          doors: [{ x: 0, y: h/2 }],
          windows: [{ x: rightW - 2, y: h/2 }]
        });
        curY += h;
      }
      for (let i = 0; i < guestRooms; i++) {
        const h = 11;
        rooms.push({
          type: "guest room",
          x: rightStart,
          y: curY,
          w: rightW,
          h,
          floor,
          doors: [{ x: 0, y: h/2 }],
          windows: [{ x: rightW - 2, y: h/2 }]
        });
        curY += h;
      }
      for (let i = 0; i < bathrooms; i++) {
        const h = 8 * bathMult;
        rooms.push({
          type: "bath",
          x: rightStart,
          y: curY,
          w: rightW,
          h,
          floor,
          doors: [{ x: 0, y: h/2 }],
          windows: []
        });
        curY += h;
      }
      
      // Stairs near corridor
      if (floor < floors - 1) {
        stairs.push({
          x: Math.max(1, corridorW - 4),
          y: Math.max(1, Math.floor(depth/2) - 4),
          w: 4,
          h: 8,
          fromFloor: floor,
          toFloor: floor + 1
        });
      }
    }
    
    // Outdoors (same placement logic)
    const entranceSide = { North: "bottom", South: "top", East: "left", West: "right" };
    const outsideOffset = {
      bottom: { x: width * 0.1, y: -20 },
      top: { x: width * 0.1, y: depth },
      left: { x: -20, y: depth * 0.1 },
      right: { x: width, y: depth * 0.1 }
    };
    if (features.garden) {
      const side = entranceSide[facing];
      const pos = outsideOffset[side];
      rooms.push({ type: "garden", x: pos.x, y: pos.y, w: 25, h: 20, floor: 0, doors: [], windows: [] });
    }
    if (features.parking) {
      const side = entranceSide[facing];
      const pos = outsideOffset[side];
      const offsetX = features.garden ? 30 : 0;
      rooms.push({ type: "parking", x: pos.x + offsetX, y: pos.y, w: 20, h: 30, floor: 0, doors: [], windows: [] });
    }
    if (features.garage) {
      const side = entranceSide[facing];
      const pos = outsideOffset[side];
      rooms.push({ type: "garage", x: pos.x + 10, y: pos.y, w: 20, h: 30, floor: 0, doors: [], windows: [] });
    }
    
    return { rooms, stairs, extras, groundLayout: { hall: rooms.find(r => r.type === 'corridor' && r.floor === 0) } };
  })();
  const variantLuxurySymmetric = (() => {
    const {
      width, depth, floors,
      bathroomSize = "Standard",
      masterBedroomSize = "Standard",
      facing,
      features
    } = specs;
    const rooms = [];
    const stairs = [];
    const extras = [];
    const getSizeMultiplier = (size) => {
      switch(size) {
        case "Big": return 1.3;
        case "Small": return 0.8;
        default: return 1.0;
      }
    };
    const mbMult = getSizeMultiplier(masterBedroomSize);
    const bathMult = getSizeMultiplier(bathroomSize);
    const tH = Math.max(8, Math.floor(depth * 0.18));
    for (let floor = 0; floor < Math.min(1, floors); floor++) {
      extras.push({ type: "balcony", x: 0, y: -tH, w: width, h: tH, floor });
      const centerW = Math.floor(width * 0.36);
      const centerX = Math.floor((width - centerW) / 2);
      const centerH = Math.floor(depth * 0.20);
      rooms.push({ type: "living", x: centerX, y: 0, w: centerW, h: centerH, floor, doors: [{ x: 0, y: Math.floor(centerH/2) }], windows: [{ x: Math.floor(centerW/2), y: 1 }] });
      const leftKitchenW = Math.floor(width * 0.22);
      const leftKitchenH = Math.floor(centerH * 0.8);
      rooms.push({ type: "kitchen", x: centerX - leftKitchenW, y: Math.floor(centerH * 0.1), w: leftKitchenW, h: leftKitchenH, floor, doors: [{ x: leftKitchenW, y: Math.floor(leftKitchenH/2) }], windows: [{ x: 2, y: Math.floor(leftKitchenH/2) }] });
      const diningW = Math.floor(width * 0.28);
      const diningH = Math.floor(centerH * 0.9);
      rooms.push({ type: "living", x: centerX + centerW, y: Math.floor(centerH * 0.05), w: diningW, h: diningH, floor, doors: [{ x: 0, y: Math.floor(diningH/2) }], windows: [{ x: Math.floor(diningW/2), y: 2 }] });
      const pantryW = Math.floor(leftKitchenW * 0.5);
      const pantryH = Math.floor(leftKitchenH * 0.5);
      rooms.push({ type: "office", x: centerX - leftKitchenW, y: leftKitchenH + 1, w: pantryW, h: pantryH, floor, doors: [{ x: pantryW, y: Math.floor(pantryH/2) }], windows: [] });
      const suiteW = Math.floor(width * 0.28);
      const suiteH = Math.floor(depth * 0.18 * mbMult);
      rooms.push({ type: "master bedroom", x: 0, y: centerH + 2, w: suiteW, h: suiteH, floor, doors: [{ x: suiteW, y: Math.floor(suiteH/2) }], windows: [{ x: Math.floor(suiteW/2), y: 2 }] });
      const bath1H = Math.floor(8 * bathMult);
      rooms.push({ type: "bath", x: 0, y: centerH + 2 + suiteH, w: suiteW, h: bath1H, floor, doors: [{ x: suiteW, y: Math.floor(bath1H/2) }], windows: [] });
      rooms.push({ type: "master bedroom", x: width - suiteW, y: centerH + 2, w: suiteW, h: suiteH, floor, doors: [{ x: 0, y: Math.floor(suiteH/2) }], windows: [{ x: Math.floor(suiteW/2), y: 2 }] });
      const bath2H = Math.floor(8 * bathMult);
      rooms.push({ type: "bath", x: width - suiteW, y: centerH + 2 + suiteH, w: suiteW, h: bath2H, floor, doors: [{ x: 0, y: Math.floor(bath2H/2) }], windows: [] });
      const midY = centerH + suiteH + Math.max(bath1H, bath2H) + 4;
      const coreW = Math.floor(width * 0.20);
      const coreX = Math.floor((width - coreW) / 2);
      const coreH = Math.floor(depth * 0.12);
      rooms.push({ type: "corridor", x: coreX, y: midY, w: coreW, h: coreH, floor, doors: [], windows: [] });
      rooms.push({ type: "office", x: coreX + Math.floor(coreW * 0.35), y: midY + Math.floor(coreH * 0.15), w: Math.floor(coreW * 0.3), h: Math.floor(coreH * 0.7), floor, doors: [{ x: 0, y: Math.floor(coreH * 0.35) }], windows: [] });
      const bed3W = Math.floor(width * 0.26);
      const bed3H = Math.floor(depth * 0.16);
      rooms.push({ type: "guest room", x: 0, y: midY + coreH + 2, w: bed3W, h: bed3H, floor, doors: [{ x: bed3W, y: Math.floor(bed3H/2) }], windows: [{ x: Math.floor(bed3W/2), y: 2 }] });
      rooms.push({ type: "bath", x: 0, y: midY + coreH + 2 + bed3H, w: Math.floor(bed3W * 0.8), h: Math.floor(8 * bathMult), floor, doors: [{ x: Math.floor(bed3W * 0.8), y: Math.floor(4 * bathMult) }], windows: [] });
      const officeW = Math.floor(width * 0.28);
      const officeH = Math.floor(depth * 0.18);
      rooms.push({ type: "office", x: width - officeW, y: midY + coreH + 2, w: officeW, h: officeH, floor, doors: [{ x: 0, y: Math.floor(officeH/2) }], windows: [{ x: Math.floor(officeW/2), y: 2 }] });
      rooms.push({ type: "bath", x: width - Math.floor(officeW * 0.7), y: midY + coreH + 2 + Math.floor(officeH * 0.4), w: Math.floor(officeW * 0.7), h: Math.floor(8 * bathMult), floor, doors: [{ x: 0, y: Math.floor(4 * bathMult) }], windows: [] });
      const stairW = 6;
      const stairH = 10;
      stairs.push({ x: 2, y: midY + coreH + officeH + 8, w: stairW, h: stairH, fromFloor: floor, toFloor: floor + 1 });
      stairs.push({ x: width - stairW - 2, y: midY + coreH + officeH + 8, w: stairW, h: stairH, fromFloor: floor, toFloor: floor + 1 });
    }
    const entranceSide = { North: "bottom", South: "top", East: "left", West: "right" };
    const outsideOffset = {
      bottom: { x: width * 0.1, y: -20 },
      top: { x: width * 0.1, y: depth },
      left: { x: -20, y: depth * 0.1 },
      right: { x: width, y: depth * 0.1 }
    };
    if (features.garden) {
      const side = entranceSide[facing];
      const pos = outsideOffset[side];
      rooms.push({ type: "garden", x: pos.x, y: pos.y, w: 25, h: 20, floor: 0, doors: [], windows: [] });
    }
    if (features.parking) {
      const side = entranceSide[facing];
      const pos = outsideOffset[side];
      const offsetX = features.garden ? 30 : 0;
      rooms.push({ type: "parking", x: pos.x + offsetX, y: pos.y, w: 20, h: 30, floor: 0, doors: [], windows: [] });
    }
    if (features.garage) {
      const side = entranceSide[facing];
      const pos = outsideOffset[side];
      rooms.push({ type: "garage", x: pos.x + 10, y: pos.y, w: 20, h: 30, floor: 0, doors: [], windows: [] });
    }
    return { rooms, stairs, extras, groundLayout: { hall: rooms.find(r => r.type === 'corridor' && r.floor === 0) } };
  })();
  return [v1, variantHorizontal, variantLeftCorridor, variantLuxurySymmetric];
}
