import { useState, useEffect } from "react";

export default function FloorPlan2D({ rooms, stairs, extras = [], columns = [], floor, plotWidth, plotDepth, onUpdateRoom, onDeleteRoom, fitToContainer = false }) { 
  const scale = 10; 
  const [dragState, setDragState] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
        if (!dragState) return;
        const dx = (e.clientX - dragState.startX) / scale;
        const dy = (e.clientY - dragState.startY) / scale;
        
        if (dragState.action === 'move') {
            setDragState(prev => ({
                ...prev,
                currentX: prev.initialRoomX + dx,
                currentY: prev.initialRoomY + dy
            }));
        } else if (dragState.action === 'resize') {
            let newW = dragState.initialRoomW;
            let newH = dragState.initialRoomH;
            let newX = dragState.initialRoomX;
            let newY = dragState.initialRoomY;

            const handle = dragState.handle;

            if (handle.includes('e')) newW = Math.max(2, dragState.initialRoomW + dx);
            if (handle.includes('w')) {
                const maxDx = dragState.initialRoomW - 2;
                const safeDx = Math.min(dx, maxDx);
                newW = dragState.initialRoomW - safeDx;
                newX = dragState.initialRoomX + safeDx;
            }
            if (handle.includes('s')) newH = Math.max(2, dragState.initialRoomH + dy);
            if (handle.includes('n')) {
                const maxDy = dragState.initialRoomH - 2;
                const safeDy = Math.min(dy, maxDy);
                newH = dragState.initialRoomH - safeDy;
                newY = dragState.initialRoomY + safeDy;
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
      living: "#eab308",   // Yellow
      kitchen: "#f97316",  // Orange
      bedroom: "#d946ef",  // Pink
      master: "#c026d3",   // Darker Pink
      guest: "#a855f7",    // Purple
      bathroom: "#06b6d4", // Cyan
      bath: "#06b6d4",     // Cyan (alias)
      parking: "#3b82f6",  // Blue
      garage: "#3b82f6",   // Blue
      office: "#8b5cf6",   // Violet
      garden: "#10b981",   // Green
      balcony: "#f43f5e",  // Rose
      stairs: "#64748b",   // Slate
      corridor: "#e2e8f0", // Light Slate
      default: "#6366f1"   // Indigo
  };

  const CAR_IMAGE_URL = "/icons/vecteezy_car-3d-illustration-icon_28213286.png";

  const getRoomColor = (type) => {
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
            <path d={path} stroke="#38bdf8" fill="none" strokeWidth="1.5" />
            <text x={labelX} y={labelY} fontSize="8" fill="#38bdf8" textAnchor="middle" alignmentBaseline="middle">D</text>
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
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="1"/>
          </pattern>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-light)" />
          </marker>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

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
            const color = getRoomColor(extra.type);
            const centerX = extra.x * scale + (extra.w * scale) / 2;
            const centerY = extra.y * scale + (extra.h * scale) / 2;
            
            return (
                <g key={`extra-${i}`}>
                    <rect 
                        x={extra.x * scale} 
                        y={extra.y * scale} 
                        width={extra.w * scale} 
                        height={extra.h * scale} 
                        fill={color}
                        fillOpacity="0.2"
                        stroke={color}
                        strokeWidth="2"
                        rx="4"
                    />
                     {/* Car Image for Parking/Garage */}
                    {(extra.type.toLowerCase().includes('parking') || extra.type.toLowerCase().includes('garage')) && (
                        <image
                            href={CAR_IMAGE_URL}
                            x={extra.x * scale + (extra.w * scale - Math.min(extra.w, extra.h) * scale * 0.8) / 2}
                            y={extra.y * scale + (extra.h * scale - Math.min(extra.w, extra.h) * scale * 1.6) / 2} 
                            width={Math.min(extra.w, extra.h) * scale * 0.8} 
                            height={Math.min(extra.w, extra.h) * scale * 1.6} 
                            preserveAspectRatio="none"
                            style={{ pointerEvents: 'none', opacity: 0.9 }}
                            transform={`rotate(${extra.h > extra.w ? 0 : -90}, ${centerX}, ${centerY})`}
                        />
                    )}
                    <text 
                        x={centerX} 
                        y={centerY} 
                        fontSize="12" 
                        fontWeight="bold"
                        stroke="white" 
                        strokeWidth="3" 
                        strokeLinejoin="round"
                        fill="var(--text)"
                        textAnchor="middle"
                        style={{ paintOrder: "stroke" }}
                    > 
                    {extra.type ? extra.type.charAt(0).toUpperCase() + extra.type.slice(1) : "Area"} 
                    </text>
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
          const color = getRoomColor(room.type);

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
              fill={color}
              fillOpacity={isDragging ? "0.5" : "0.2"}
              stroke={color}
              strokeWidth="2"
              rx="4"
            /> 

            {/* Car Image for Parking/Garage */}
            {(room.type.toLowerCase().includes('parking') || room.type.toLowerCase().includes('garage')) && (
                <image
                    href={CAR_IMAGE_URL}
                    x={rX * scale + (rW * scale - Math.min(rW, rH) * scale * 0.8) / 2}
                    y={rY * scale + (rH * scale - Math.min(rW, rH) * scale * 1.6) / 2} 
                    width={Math.min(rW, rH) * scale * 0.8} 
                    height={Math.min(rW, rH) * scale * 1.6} // Assuming 1:2 aspect ratio for car
                    preserveAspectRatio="none"
                    style={{ pointerEvents: 'none', opacity: 0.9 }}
                    transform={`rotate(${rH > rW ? 0 : -90}, ${centerX}, ${centerY})`}
                />
            )}
            
            {/* Room Text */}
            <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
                <text 
                    x={centerX} 
                    y={centerY - 5} 
                    fontSize="12" 
                    fontWeight="bold"
                    stroke="white" 
                    strokeWidth="3" 
                    strokeLinejoin="round"
                    fill="var(--text)"
                    textAnchor="middle"
                    style={{ paintOrder: "stroke" }}
                > 
                {room.type ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : "Room"} 
                </text> 
                <text 
                    x={centerX} 
                    y={centerY + 10} 
                    fontSize="10" 
                    stroke="white" 
                    strokeWidth="3" 
                    strokeLinejoin="round"
                    fill="var(--text-light)"
                    textAnchor="middle"
                    style={{ paintOrder: "stroke" }}
                > 
                {formatDimension(rW)} x {formatDimension(rH)}
                </text>
            </g>

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
              <text x={(s.x + s.w/2) * scale} y={(s.y + s.h/2) * scale} fill="var(--text-light)" fontSize="10" textAnchor="middle">UP</text>
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
