import { useState, useEffect } from "react";

export default function FloorPlan2D({ rooms, stairs, extras = [], columns = [], floor, plotWidth, plotDepth, onUpdateRoom, onDeleteRoom, fitToContainer = false }) { 
  const scale = 10; 
  const [dragState, setDragState] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
        if (!dragState) return;
        const dx = (e.clientX - dragState.startX) / scale;
        const dy = (e.clientY - dragState.startY) / scale;
        
        const SNAP_THRESHOLD = 0.5; // Snap within 0.5 ft (6 inches)
        
        // Get other rooms on the same floor for snapping
        const otherRooms = rooms.filter((r, i) => i !== dragState.originalIndex && r.floor === floor);
        const vLines = [];
        const hLines = [];
        
        otherRooms.forEach(r => {
            vLines.push(r.x, r.x + r.w);
            hLines.push(r.y, r.y + r.h);
        });
        
        // Also snap to plot boundaries? Optional, but good.
        vLines.push(0, plotWidth);
        hLines.push(0, plotDepth);

        const getBestSnap = (val, candidates) => {
            let best = val;
            let minDiff = SNAP_THRESHOLD;
            let snapped = false;
            for (let c of candidates) {
                const diff = Math.abs(val - c);
                if (diff < minDiff) {
                    minDiff = diff;
                    best = c;
                    snapped = true;
                }
            }
            return { val: best, snapped };
        };

        if (dragState.action === 'move') {
            let rawX = dragState.initialRoomX + dx;
            let rawY = dragState.initialRoomY + dy;
            
            // Snap X
            const snapLeft = getBestSnap(rawX, vLines);
            const snapRight = getBestSnap(rawX + dragState.initialRoomW, vLines);
            
            let finalX = rawX;
            if (snapLeft.snapped && snapRight.snapped) {
                // Both snapped, prioritize the closer one? Or just left.
                // If both are snapped, it fits perfectly in a gap.
                finalX = snapLeft.val; 
            } else if (snapLeft.snapped) {
                finalX = snapLeft.val;
            } else if (snapRight.snapped) {
                finalX = snapRight.val - dragState.initialRoomW;
            }

            // Snap Y
            const snapTop = getBestSnap(rawY, hLines);
            const snapBottom = getBestSnap(rawY + dragState.initialRoomH, hLines);
            
            let finalY = rawY;
            if (snapTop.snapped && snapBottom.snapped) {
                finalY = snapTop.val;
            } else if (snapTop.snapped) {
                finalY = snapTop.val;
            } else if (snapBottom.snapped) {
                finalY = snapBottom.val - dragState.initialRoomH;
            }

            setDragState(prev => ({
                ...prev,
                currentX: finalX,
                currentY: finalY
            }));
        } else if (dragState.action === 'resize') {
            let newW = dragState.initialRoomW;
            let newH = dragState.initialRoomH;
            let newX = dragState.initialRoomX;
            let newY = dragState.initialRoomY;

            const handle = dragState.handle;

            // X-Axis Resize
            if (handle.includes('e')) {
                // Moving Right Edge
                const rawRight = dragState.initialRoomX + dragState.initialRoomW + dx;
                const snap = getBestSnap(rawRight, vLines);
                const finalRight = snap.snapped ? snap.val : rawRight;
                newW = Math.max(2, finalRight - dragState.initialRoomX);
            }
            if (handle.includes('w')) {
                // Moving Left Edge
                const rawLeft = dragState.initialRoomX + dx;
                const snap = getBestSnap(rawLeft, vLines);
                const finalLeft = snap.snapped ? snap.val : rawLeft;
                
                // Ensure min width
                const maxLeft = dragState.initialRoomX + dragState.initialRoomW - 2;
                const safeLeft = Math.min(finalLeft, maxLeft);
                
                newX = safeLeft;
                newW = dragState.initialRoomX + dragState.initialRoomW - safeLeft;
            }

            // Y-Axis Resize
            if (handle.includes('s')) {
                // Moving Bottom Edge
                const rawBottom = dragState.initialRoomY + dragState.initialRoomH + dy;
                const snap = getBestSnap(rawBottom, hLines);
                const finalBottom = snap.snapped ? snap.val : rawBottom;
                newH = Math.max(2, finalBottom - dragState.initialRoomY);
            }
            if (handle.includes('n')) {
                // Moving Top Edge
                const rawTop = dragState.initialRoomY + dy;
                const snap = getBestSnap(rawTop, hLines);
                const finalTop = snap.snapped ? snap.val : rawTop;
                
                // Ensure min height
                const maxTop = dragState.initialRoomY + dragState.initialRoomH - 2;
                const safeTop = Math.min(finalTop, maxTop);
                
                newY = safeTop;
                newH = dragState.initialRoomY + dragState.initialRoomH - safeTop;
            }

            setDragState(prev => ({
                ...prev,
                currentX: newX,
                currentY: newY,
                currentW: newW,
                currentH: newH
            }));
        }
    };

    const handleMouseUp = () => {
        if (dragState && onUpdateRoom) {
            if (dragState.action === 'move') {
                onUpdateRoom(dragState.originalIndex, { x: dragState.currentX, y: dragState.currentY });
            } else if (dragState.action === 'resize') {
                onUpdateRoom(dragState.originalIndex, { 
                    x: dragState.currentX, 
                    y: dragState.currentY,
                    w: dragState.currentW,
                    h: dragState.currentH
                });
            }
        }
        setDragState(null);
    };

    if (dragState) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, onUpdateRoom, scale]);

  const handleMouseDown = (e, room, originalIndex, action = 'move', handle = null) => {
      if (!onUpdateRoom) return;
      e.preventDefault();
      e.stopPropagation();
      setDragState({
          originalIndex,
          action,
          handle,
          startX: e.clientX,
          startY: e.clientY,
          initialRoomX: room.x,
          initialRoomY: room.y,
          initialRoomW: room.w,
          initialRoomH: room.h,
          currentX: room.x,
          currentY: room.y,
          currentW: room.w,
          currentH: room.h
      });
  }; 

  const roomColors = {
      living: "url(#living-tile)",
      kitchen: "url(#living-tile)",
      bedroom: "url(#wood)",
      master: "url(#wood)",
      guest: "url(#wood)",
      bathroom: "url(#tile-small)",
      bath: "url(#tile-small)",
      parking: "url(#garage-tile)",
      garage: "url(#garage-tile)",
      office: "url(#wood)",
      garden: "url(#grass)",
      balcony: "url(#wood)",
      stairs: "url(#wood)",
      corridor: "url(#tile)",
      default: "#f3f4f6"
  };

  const getRoomFill = (type) => {
      if (!type) return roomColors.default;
      const key = Object.keys(roomColors).find(k => type.toLowerCase().includes(k));
      return key ? roomColors[key] : roomColors.default;
  };

  const ResizeHandle = ({ x, y, cursor, onMouseDown }) => (
      <rect
          x={x - 4}
          y={y - 4}
          width={8}
          height={8}
          fill="white"
          stroke="var(--primary)"
          strokeWidth="1"
          style={{ cursor }}
          onMouseDown={onMouseDown}
      />
  );

  const formatDimension = (val) => {
    const feet = Math.floor(val);
    const inches = Math.round((val - feet) * 12);
    if (inches === 12) return `${feet + 1}' 0"`;
    return `${feet}' ${inches}"`;
  };

  const renderGarageVehicles = (w, h) => {
      const isHorizontal = w > h;
      const contentW = isHorizontal ? h : w;
      const contentH = isHorizontal ? w : h;
      
      const groupTransform = isHorizontal 
          ? `translate(${w}, 0) rotate(90)` 
          : ``;

      return (
          <g transform={groupTransform}>
              {/* White background to ensure clarity if image has transparency */}
              <rect width={contentW} height={contentH} fill="white" />
              <image 
                  href="/intended_image/garage.png" 
                  x="0" 
                  y="0" 
                  width={contentW} 
                  height={contentH} 
                  preserveAspectRatio="none"
                  style={{ imageRendering: 'high-quality' }}
              />
          </g>
      );
  };

  const renderBathroomInterior = (w, h) => {
      const isHorizontal = w > h;
      const contentW = isHorizontal ? h : w;
      const contentH = isHorizontal ? w : h;
      
      const groupTransform = isHorizontal 
          ? `translate(${w}, 0) rotate(90)` 
          : ``;

      return (
          <g transform={groupTransform}>
              <image 
                  href="/intended_image/bathrrom.png" 
                  x="0" 
                  y="0" 
                  width={contentW} 
                  height={contentH} 
                  preserveAspectRatio="none"
                  style={{ imageRendering: 'high-quality' }}
              />
          </g>
      );
  };

  const renderGardenLandscape = (w, h) => {
      const isHorizontal = w > h;
      const contentW = isHorizontal ? h : w;
      const contentH = isHorizontal ? w : h;
      
      const groupTransform = isHorizontal 
          ? `translate(${w}, 0) rotate(90)` 
          : ``;

      return (
          <g transform={groupTransform}>
              <image 
                  href="/intended_image/garden.png" 
                  x="0" 
                  y="0" 
                  width={contentW} 
                  height={contentH} 
                  preserveAspectRatio="none"
                  style={{ imageRendering: 'high-quality' }}
              />
          </g>
      );
  };

  const renderKitchen = (w, h) => {
      const isHorizontal = w > h;
      const contentW = isHorizontal ? h : w;
      const contentH = isHorizontal ? w : h;
      
      const groupTransform = isHorizontal 
          ? `translate(${w}, 0) rotate(90)` 
          : ``;

      return (
          <g transform={groupTransform}>
              <image 
                  href="/intended_image/kitchen.png" 
                  x="0" 
                  y="0" 
                  width={contentW} 
                  height={contentH} 
                  preserveAspectRatio="none"
                  style={{ imageRendering: 'high-quality' }}
              />
          </g>
      );
  };

  const renderGuestBedroom = (w, h) => {
      const isHorizontal = w > h;
      const contentW = isHorizontal ? h : w;
      const contentH = isHorizontal ? w : h;
      
      const groupTransform = isHorizontal 
          ? `translate(${w}, 0) rotate(90)` 
          : ``;

      return (
          <g transform={groupTransform}>
              <image 
                  href="/intended_image/guestroomupdated.png" 
                  x="0" 
                  y="0" 
                  width={contentW} 
                  height={contentH} 
                  preserveAspectRatio="none"
                  style={{ imageRendering: 'high-quality' }}
              />
          </g>
      );
  };

  const renderKidsBedroom = (w, h) => {
      const isHorizontal = w > h;
      const contentW = isHorizontal ? h : w;
      const contentH = isHorizontal ? w : h;
      
      const groupTransform = isHorizontal 
          ? `translate(${w}, 0) rotate(90)` 
          : ``;

      return (
          <g transform={groupTransform}>
              <image 
                  href="/intended_image/kidsbedroom.png" 
                  x="0" 
                  y="0" 
                  width={contentW} 
                  height={contentH} 
                  preserveAspectRatio="none"
                  style={{ imageRendering: 'high-quality' }}
              />
          </g>
      );
  };

  const renderMasterBedroom = (w, h) => {
      const isHorizontal = w > h;
      const contentW = isHorizontal ? h : w;
      const contentH = isHorizontal ? w : h;
      
      const groupTransform = isHorizontal 
          ? `translate(${w}, 0) rotate(90)` 
          : ``;

      return (
          <g transform={groupTransform}>
              <image 
                  href="/intended_image/mastersbedroom.png" 
                  x="0" 
                  y="0" 
                  width={contentW} 
                  height={contentH} 
                  preserveAspectRatio="none"
                  style={{ imageRendering: 'high-quality' }}
              />
          </g>
      );
  };

  const renderLivingRoomFurniture = (w, h) => {
      const isHorizontal = w > h;
      const contentW = isHorizontal ? h : w;
      const contentH = isHorizontal ? w : h;
      
      const groupTransform = isHorizontal 
          ? `translate(${w}, 0) rotate(90)` 
          : ``;

      return (
          <g transform={groupTransform}>
              <image 
                  href="/intended_image/livingroom.png" 
                  x="0" 
                  y="0" 
                  width={contentW} 
                  height={contentH} 
                  preserveAspectRatio="none"
                  style={{ imageRendering: 'high-quality' }}
              />
          </g>
      );
  };

  const renderFurniture = (room) => {
    const type = room.type.toLowerCase();
    const w = room.w * scale;
    const h = room.h * scale;
    const cx = w / 2;
    const cy = h / 2;
    const stroke = "#555";
    
    // Furniture Shadow & Gradient
    const dropShadow = "url(#furniture-shadow)";
    const bedGradient = "url(#bed-gradient)";
    const pillowGradient = "url(#pillow-gradient)";

    if (type.includes('guest')) {
        return (
            <g>
                {renderGuestBedroom(w, h)}
            </g>
        );
    }
    
    if (type.includes('kids') || type.includes('child')) {
        return (
            <g>
                {renderKidsBedroom(w, h)}
            </g>
        );
    }

    if (type.includes('master')) {
        return (
            <g>
                {renderMasterBedroom(w, h)}
            </g>
        );
    }

    if (type.includes('bed')) {
        const isMaster = type.includes('master');
        const bedW = (isMaster ? 6 : 5) * scale;
        const bedH = (isMaster ? 7 : 6.5) * scale;
        return (
            <g transform={`translate(${cx - bedW/2}, ${cy - bedH/2})`} filter={dropShadow}>
                {/* Bed Frame */}
                <rect width={bedW} height={bedH} rx="2" fill="#e5e7eb" stroke={stroke} strokeWidth="0.5" />
                {/* Mattress/Sheets */}
                <rect x="2" y="2" width={bedW-4} height={bedH-4} rx="2" fill={bedGradient} />
                {/* Folded Blanket at bottom */}
                <rect x="2" y={bedH * 0.6} width={bedW-4} height={bedH * 0.4 - 2} rx="2" fill="#9ca3af" opacity="0.8" />
                
                {/* Pillows */}
                <rect x={6} y={6} width={bedW/2 - 10} height={1.2*scale} rx="4" fill={pillowGradient} stroke="#ddd" strokeWidth="0.5" />
                <rect x={bedW/2 + 4} y={6} width={bedW/2 - 10} height={1.2*scale} rx="4" fill={pillowGradient} stroke="#ddd" strokeWidth="0.5" />
            </g>
        );
    }
    if (type.includes('living')) {
        return (
            <g>
                {renderLivingRoomFurniture(w, h)}
            </g>
        );
    }
    if (type.includes('kitchen')) {
        return (
            <g>
                {renderKitchen(w, h)}
            </g>
        );
    }
    if (type.includes('bath')) {
        return (
            <g>
                {renderBathroomInterior(w, h)}
            </g>
        );
    }
    if (type.includes('garden')) {
        return (
            <g>
                {renderGardenLandscape(w, h)}
            </g>
        );
    }
    if (type.includes('parking') || type.includes('garage')) {
        return (
            <g>
                {renderGarageVehicles(w, h)}
            </g>
        );
    }
    return null;
  };

  const renderExternalDimensions = (items) => {
      if (items.length === 0) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      items.forEach(r => {
          if (r.x < minX) minX = r.x;
          if (r.y < minY) minY = r.y;
          if (r.x + r.w > maxX) maxX = r.x + r.w;
          if (r.y + r.h > maxY) maxY = r.y + r.h;
      });

      const pad = 20; // px offset for dimension lines
      const tick = 5;
      
      const x1 = minX * scale;
      const x2 = maxX * scale;
      const y1 = minY * scale;
      const y2 = maxY * scale;
      
      const dimColor = "var(--text)";

      return (
          <g className="external-dimensions" pointerEvents="none">
              {/* Top Width */}
              <line x1={x1} y1={y1 - pad} x2={x2} y2={y1 - pad} stroke={dimColor} strokeWidth="1" />
              <line x1={x1} y1={y1 - pad - tick} x2={x1} y2={y1 - pad + tick} stroke={dimColor} strokeWidth="1" />
              <line x1={x2} y1={y1 - pad - tick} x2={x2} y2={y1 - pad + tick} stroke={dimColor} strokeWidth="1" />
              <text x={(x1 + x2)/2} y={y1 - pad - 8} textAnchor="middle" fill={dimColor} fontSize="12" fontWeight="bold">
                  {formatDimension(maxX - minX)}
              </text>

              {/* Left Depth */}
              <line x1={x1 - pad} y1={y1} x2={x1 - pad} y2={y2} stroke={dimColor} strokeWidth="1" />
              <line x1={x1 - pad - tick} y1={y1} x2={x1 - pad + tick} y2={y1} stroke={dimColor} strokeWidth="1" />
              <line x1={x1 - pad - tick} y1={y2} x2={x1 - pad + tick} y2={y2} stroke={dimColor} strokeWidth="1" />
              <text x={x1 - pad - 8} y={(y1 + y2)/2} textAnchor="middle" transform={`rotate(-90, ${x1 - pad - 8}, ${(y1 + y2)/2})`} fill={dimColor} fontSize="12" fontWeight="bold">
                  {formatDimension(maxY - minY)}
              </text>
          </g>
      );
  };

  // Helper to render doors with swing arcs
  const renderDoor = (d, room) => {
    const cx = (room.x + d.x) * scale;
    const cy = (room.y + d.y) * scale;
    const doorSize = 3 * scale; // 3ft standard door
    const r = doorSize; 

    // Detect Wall
    const isLeft = d.x <= 0.5;
    const isRight = Math.abs(d.x - room.w) <= 0.5;
    const isTop = d.y <= 0.5;
    const isBottom = Math.abs(d.y - room.h) <= 0.5;

    let path = "";
    let labelX = cx;
    let labelY = cy;

    if (isTop) {
        // Hinge left, swing in-down
        path = `M ${cx - r/2},${cy} A ${r},${r} 0 0 1 ${cx + r/2},${cy + r}`;
        // Draw door leaf
        path += ` L ${cx - r/2},${cy + r}`; 
        labelY += 15;
    } else if (isBottom) {
        // Hinge left, swing in-up
        path = `M ${cx - r/2},${cy} A ${r},${r} 0 0 0 ${cx + r/2},${cy - r}`;
        path += ` L ${cx - r/2},${cy - r}`;
        labelY -= 15;
    } else if (isLeft) {
        // Hinge top, swing in-right
        path = `M ${cx},${cy - r/2} A ${r},${r} 0 0 0 ${cx + r},${cy + r/2}`;
        path += ` L ${cx + r},${cy - r/2}`;
        labelX += 15;
    } else if (isRight) {
        // Hinge top, swing in-left
        path = `M ${cx},${cy - r/2} A ${r},${r} 0 0 1 ${cx - r},${cy + r/2}`;
        path += ` L ${cx - r},${cy - r/2}`;
        labelX -= 15;
    }

    return (
        <g key={`${d.x}-${d.y}`}>
            {/* White line to clear wall - keep white to mask wall line? No, use dark background color */}
            <rect 
                x={isLeft || isRight ? cx - 2 : cx - r/2} 
                y={isTop || isBottom ? cy - 2 : cy - r/2} 
                width={isLeft || isRight ? 4 : r} 
                height={isTop || isBottom ? 4 : r} 
                fill="var(--surface)" 
            />
            {/* Swing Arc & Leaf */}
            <path d={path} stroke="#0ea5e9" fill="none" strokeWidth="4" strokeLinecap="round" />
            {/* <text x={labelX} y={labelY} fontSize="8" fill="#38bdf8" textAnchor="middle" alignmentBaseline="middle">D</text> */}
        </g>
    );
  };

  // Calculate dynamic dimensions
  const padding = 20;
  let maxX = plotWidth;
  let maxY = plotDepth;

  const currentRooms = rooms.filter(r => r.floor === floor);
  const currentStairs = stairs.filter(s => s.floor === floor);
  const currentExtras = extras.filter(e => e.floor === floor);

  [...currentRooms, ...currentStairs, ...currentExtras].forEach(item => {
      const itemRight = item.x + item.w;
      const itemBottom = item.y + item.h;
      if (itemRight > maxX) maxX = itemRight;
      if (itemBottom > maxY) maxY = itemBottom;
  });
  
  // Also check drag state if active
  if (dragState) {
      const dragRight = (dragState.currentX + dragState.currentW);
      const dragBottom = (dragState.currentY + dragState.currentH);
      if (dragRight > maxX) maxX = dragRight;
      if (dragBottom > maxY) maxY = dragBottom;
  }

  const svgWidth = maxX * scale + padding * 2;
  const svgHeight = maxY * scale + padding * 2;

  return ( 
    <svg 
      id={`floor-plan-svg-${floor}`} 
      viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
      width="100%" 
      height={fitToContainer ? "100%" : svgHeight} 
      preserveAspectRatio="xMidYMid meet"
      style={{ border: "1px solid var(--border)", background: "var(--surface)", borderRadius: "16px" }}
    > 
      <defs>
          {/* --- TEXTURES --- */}
          {/* 1. Tile (Living/Kitchen) */}
          <pattern id="tile" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill="#f8fafc" />
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
          </pattern>
          {/* 2. Small Tile (Bath) */}
          <pattern id="tile-small" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#f1f5f9" />
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#cbd5e1" strokeWidth="0.5"/>
          </pattern>
          {/* 3. Wood (Bedroom) */}
          <pattern id="wood" width="100" height="20" patternUnits="userSpaceOnUse">
              <rect width="100" height="20" fill="#fdf6e3" /> {/* Beige base */}
              <line x1="0" y1="19" x2="100" y2="19" stroke="#e6dccd" strokeWidth="1" />
              {/* Grain lines */}
              <path d="M 10 5 L 40 5 M 60 12 L 90 12" stroke="#e6dccd" strokeWidth="1" strokeLinecap="round" />
          </pattern>
          {/* Lawn Texture Pattern */}
           <pattern id="lawn-pattern" width="512" height="512" patternUnits="userSpaceOnUse">
               <image href="/intended_image/lawnupdated.png" x="0" y="0" width="512" height="512" preserveAspectRatio="xMidYMid slice" />
           </pattern>
          {/* 4. Grass (Garden) - Updated to use lawn texture */}
          <pattern id="grass" width="512" height="512" patternUnits="userSpaceOnUse">
              <rect width="512" height="512" fill="url(#lawn-pattern)" />
          </pattern>
          {/* 5. Concrete (Parking) -> Updated to Garage Tile */}
          <pattern id="garage-tile" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#e5e5e0" /> {/* Light warm grey */}
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d4d4d8" strokeWidth="1"/>
          </pattern>
          {/* 6. Living Room Tile (Beige) */}
          <pattern id="living-tile" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#fdfbf7" /> {/* Warm beige white */}
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e7e5e4" strokeWidth="1"/>
          </pattern>
          <pattern id="concrete" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#e5e7eb" />
              <circle cx="10" cy="10" r="0.5" fill="#9ca3af" />
              <circle cx="4" cy="16" r="0.5" fill="#9ca3af" />
          </pattern>

          {/* --- VEHICLE GRADIENTS --- */}
          <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="50%" stopColor="#111827" />
              <stop offset="100%" stopColor="#374151" />
          </linearGradient>
          <linearGradient id="car-glass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="50%" stopColor="#4b5563" />
              <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
          <linearGradient id="bike-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* --- GRADIENTS --- */}
          <linearGradient id="bed-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f3f4f6" />
          </linearGradient>
          <linearGradient id="pillow-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>

          {/* --- FILTERS --- */}
          <filter id="furniture-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="2" dy="2" result="offsetblur" />
              <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
              </feMerge>
          </filter>

          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="1"/>
          </pattern>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-light)" />
          </marker>
      </defs>
      {/* Background */}
      <rect width="1000%" height="1000%" x="-500%" y="-500%" fill="#FEFDF5" />
      
      {/* External Dimensions */}
      {renderExternalDimensions(currentRooms)}

      {/* Plot Boundary */}
      <rect 
        x={0} y={0} 
        width={plotWidth * scale} height={plotDepth * scale} 
        fill="none" 
        stroke="var(--primary)" 
        strokeWidth="2" 
        strokeDasharray="10 5"
        style={{filter: 'drop-shadow(0 0 5px rgba(37, 99, 235, 0.25))'}}
      />

      {/* Extras (Garden, Parking) - Rendered first to be below rooms */}
      {extras
        .filter(e => e.floor === floor)
        .map((extra, i) => {
            const fill = getRoomFill(extra.type);
            const centerX = extra.x * scale + (extra.w * scale) / 2;
            const centerY = extra.y * scale + (extra.h * scale) / 2;
            
            return (
                <g key={`extra-${i}`}>
                    <rect 
                        x={extra.x * scale} 
                        y={extra.y * scale} 
                        width={extra.w * scale} 
                        height={extra.h * scale} 
                        fill={fill}
                        stroke="#666"
                        strokeWidth={(extra.type.toLowerCase().includes('parking') || extra.type.toLowerCase().includes('garage')) ? "5" : "1"}
                        rx="0"
                    />
                     {/* Car/Bike for Parking/Garage */}
                    {(extra.type.toLowerCase().includes('parking') || extra.type.toLowerCase().includes('garage')) && (
                        <g transform={`translate(${extra.x * scale}, ${extra.y * scale})`}>
                            {renderGarageVehicles(extra.w * scale, extra.h * scale)}
                        </g>
                    )}
                    {(!extra.type.toLowerCase().includes('parking') && !extra.type.toLowerCase().includes('garage') && !extra.type.toLowerCase().includes('garden')) && (
                        <>
                            <text 
                                x={centerX} 
                                y={centerY - 12} 
                                fontSize="24" 
                                fontWeight="bold"
                                stroke="white" 
                                strokeWidth="4" 
                                strokeLinejoin="round"
                                fill="var(--text)"
                                textAnchor="middle"
                                style={{ paintOrder: "stroke" }}
                            > 
                            {extra.type ? extra.type.charAt(0).toUpperCase() + extra.type.slice(1) : "Area"} 
                            </text>
                            <text 
                                x={centerX} 
                                y={centerY + 22} 
                                fontSize="18" 
                                fontWeight="bold"
                                stroke="white" 
                                strokeWidth="3" 
                                strokeLinejoin="round"
                                fill="var(--text)"
                                textAnchor="middle"
                                style={{ paintOrder: "stroke" }}
                            > 
                            {formatDimension(extra.w)} x {formatDimension(extra.h)}
                            </text>
                        </>
                    )}
                </g>
            );
        })}

      {/* Rooms */} 
      {rooms 
        .filter(r => r.floor === floor) 
        .map((room, i) => {
          const originalIndex = rooms.indexOf(room);
          const isDragging = dragState && dragState.originalIndex === originalIndex;
          
          // Use dragged position if active, otherwise room position
          const rX = isDragging ? dragState.currentX : room.x;
          const rY = isDragging ? dragState.currentY : room.y;
          const rW = isDragging ? dragState.currentW : room.w;
          const rH = isDragging ? dragState.currentH : room.h;
          
          const centerX = rX * scale + (rW * scale) / 2;
          const centerY = rY * scale + (rH * scale) / 2;
          const fill = getRoomFill(room.type);

          return ( 
          <g 
            key={i} 
            onMouseDown={(e) => handleMouseDown(e, room, originalIndex)}
            style={{ cursor: onUpdateRoom ? 'move' : 'default' }}
          > 
            {/* Room Shell */}
            <rect 
              x={rX * scale} 
              y={rY * scale} 
              width={rW * scale} 
              height={rH * scale} 
              fill={fill}
              fillOpacity={isDragging ? "0.8" : "1"}
              stroke="rgb(28, 55, 74)" 
              strokeWidth={(room.type.toLowerCase().includes('garden')) ? "5" : (room.type.toLowerCase().includes('parking') || room.type.toLowerCase().includes('garage')) ? "5" : (room.type.toLowerCase().includes('bath')) ? "7" : "15"}
              strokeLinejoin="round"
              rx="0"
            /> 
            
            {/* Furniture */}
            <g transform={`translate(${rX * scale}, ${rY * scale})`}>
                {renderFurniture({ ...room, w: rW, h: rH })}
            </g>
            
            {/* Room Text */}
            {(!room.type.toLowerCase().includes('parking') && !room.type.toLowerCase().includes('garage') && !room.type.toLowerCase().includes('garden') && !room.type.toLowerCase().includes('bath') && !room.type.toLowerCase().includes('bathroom')) && (
                <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <text 
                        x={centerX} 
                        y={centerY - 12} 
                        fontSize="24" 
                        fontWeight="bold"
                        stroke="white" 
                        strokeWidth="4" 
                        strokeLinejoin="round"
                        fill="#1f2937"
                        textAnchor="middle"
                        style={{ paintOrder: "stroke" }}
                    > 
                    {room.type ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : "Room"} 
                    </text> 
                    <text 
                        x={centerX} 
                        y={centerY + 22} 
                        fontSize="18" 
                        fontWeight="bold"
                        stroke="white" 
                        strokeWidth="3" 
                        strokeLinejoin="round"
                        fill="#1f2937"
                        textAnchor="middle"
                        style={{ paintOrder: "stroke" }}
                    > 
                    {formatDimension(rW)} x {formatDimension(rH)}
                    </text>
                </g>
            )}

            {/* Delete Control */}
            {onDeleteRoom && (
              <g 
                transform={`translate(${(rX + rW) * scale - 14}, ${rY * scale + 6})`} 
                onMouseDown={(e) => { e.stopPropagation(); }} 
                onClick={(e) => { e.stopPropagation(); onDeleteRoom(originalIndex); }}
                style={{ cursor: 'pointer' }}
              >
                <rect x="0" y="0" width="12" height="12" rx="3" fill="var(--surface)" stroke="var(--border)" />
                <line x1="3" y1="3" x2="9" y2="9" stroke="var(--danger)" strokeWidth="1.5" />
                <line x1="9" y1="3" x2="3" y2="9" stroke="var(--danger)" strokeWidth="1.5" />
              </g>
            )}

            {/* Resize Handles */}
            {onUpdateRoom && (
                <g>
                    {/* Corners */}
                    <ResizeHandle x={rX * scale} y={rY * scale} cursor="nw-resize" onMouseDown={(e) => handleMouseDown(e, room, originalIndex, 'resize', 'nw')} />
                    <ResizeHandle x={(rX + rW) * scale} y={rY * scale} cursor="ne-resize" onMouseDown={(e) => handleMouseDown(e, room, originalIndex, 'resize', 'ne')} />
                    <ResizeHandle x={(rX + rW) * scale} y={(rY + rH) * scale} cursor="se-resize" onMouseDown={(e) => handleMouseDown(e, room, originalIndex, 'resize', 'se')} />
                    <ResizeHandle x={rX * scale} y={(rY + rH) * scale} cursor="sw-resize" onMouseDown={(e) => handleMouseDown(e, room, originalIndex, 'resize', 'sw')} />
                    
                    {/* Edges */}
                    <ResizeHandle x={(rX + rW/2) * scale} y={rY * scale} cursor="n-resize" onMouseDown={(e) => handleMouseDown(e, room, originalIndex, 'resize', 'n')} />
                    <ResizeHandle x={(rX + rW/2) * scale} y={(rY + rH) * scale} cursor="s-resize" onMouseDown={(e) => handleMouseDown(e, room, originalIndex, 'resize', 's')} />
                    <ResizeHandle x={rX * scale} y={(rY + rH/2) * scale} cursor="w-resize" onMouseDown={(e) => handleMouseDown(e, room, originalIndex, 'resize', 'w')} />
                    <ResizeHandle x={(rX + rW) * scale} y={(rY + rH/2) * scale} cursor="e-resize" onMouseDown={(e) => handleMouseDown(e, room, originalIndex, 'resize', 'e')} />
                </g>
            )}

            {/* Doors */}
            <g transform={`translate(${(rX - room.x) * scale}, ${(rY - room.y) * scale})`}>
                {room.doors && room.doors.map((d) => renderDoor(d, room))}
            </g>
          </g> 
          ); 
        })} 

      {/* Stairs */}
      {stairs.filter(s => s.floor === floor).map((s, i) => (
          <g key={`stair-${i}`}>
              <rect 
                  x={s.x * scale} 
                  y={s.y * scale} 
                  width={s.w * scale} 
                  height={s.h * scale} 
                  fill="url(#grid)" 
                  stroke="var(--text-light)" 
                  strokeWidth="1"
              />
              {/* Stair Steps */}
              {Array.from({ length: 8 }).map((_, stepI) => (
                  <line 
                      key={stepI}
                      x1={s.x * scale} 
                      y1={(s.y + stepI * (s.h/8)) * scale} 
                      x2={(s.x + s.w) * scale} 
                      y2={(s.y + stepI * (s.h/8)) * scale} 
                      stroke="var(--text-light)" 
                      strokeWidth="1"
                />
            ))}
            <text x={(s.x + s.w/2) * scale} y={(s.y + s.h/2) * scale} fill="var(--text-light)" fontSize="16" textAnchor="middle">UP</text>
        </g>
      ))}

      {/* Columns */}
      {columns.filter(c => c.floor === floor).map((c, i) => (
          <rect 
              key={`col-${i}`}
              x={c.x * scale - 2} 
              y={c.y * scale - 2} 
              width="4" 
              height="4" 
              fill="var(--danger)" 
          />
      ))}

    </svg> 
  ); 
}
