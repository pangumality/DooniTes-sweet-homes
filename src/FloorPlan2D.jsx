import { analyzeRoom } from "./analysis/environment";

export default function FloorPlan2D({ rooms, stairs, extras = [], columns = [], floor, plotWidth, plotDepth }) { 
  const scale = 10; 

  const roomColors = {
      living: "#eab308",   // Yellow
      kitchen: "#f97316",  // Orange
      bedroom: "#d946ef",  // Pink
      master: "#c026d3",   // Darker Pink
      bathroom: "#06b6d4", // Cyan
      parking: "#3b82f6",  // Blue
      garage: "#3b82f6",   // Blue
      office: "#8b5cf6",   // Violet
      garden: "#10b981",   // Green
      balcony: "#f43f5e",  // Rose
      stairs: "#64748b",   // Slate
      default: "#6366f1"   // Indigo
  };

  const getRoomColor = (type) => {
      if (!type) return roomColors.default;
      const key = Object.keys(roomColors).find(k => type.toLowerCase().includes(k));
      return key ? roomColors[key] : roomColors.default;
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
    let rotation = 0;

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
                fill="#1e1b2e" 
            />
            {/* Swing Arc & Leaf */}
            <path d={path} stroke="#38bdf8" fill="none" strokeWidth="1.5" />
            <text x={labelX} y={labelY} fontSize="8" fill="#38bdf8" textAnchor="middle" alignmentBaseline="middle">D</text>
        </g>
    );
  };

  return ( 
    <svg id={`floor-plan-svg-${floor}`} width="600" height="600" style={{ border: "1px solid var(--border)", background: "var(--surface)", borderRadius: "16px" }}> 
      <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#332f46" strokeWidth="1"/>
          </pattern>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Plot Boundary */}
      <rect 
        x={0} y={0} 
        width={plotWidth * scale} height={plotDepth * scale} 
        fill="none" 
        stroke="#d946ef" 
        strokeWidth="2" 
        strokeDasharray="10 5"
        style={{filter: 'drop-shadow(0 0 5px rgba(217, 70, 239, 0.5))'}}
      />

      {/* Rooms */} 
      {rooms 
        .filter(r => r.floor === floor) 
        .map((room, i) => {
          const centerX = room.x * scale + (room.w * scale) / 2;
          const centerY = room.y * scale + (room.h * scale) / 2;
          const color = getRoomColor(room.type);

          return ( 
          <g key={i}> 
            {/* Room Shell */}
            <rect 
              x={room.x * scale} 
              y={room.y * scale} 
              width={room.w * scale} 
              height={room.h * scale} 
              fill={color}
              fillOpacity="0.2"
              stroke={color}
              strokeWidth="2"
              rx="4"
            /> 
            
            {/* Room Text */}
            <text 
                x={centerX} 
                y={centerY - 5} 
                fontSize="12" 
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                style={{textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}
            > 
              {room.type ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : "Room"} 
            </text> 
            <text 
                x={centerX} 
                y={centerY + 10} 
                fontSize="10" 
                fill="#e2e8f0"
                textAnchor="middle"
            > 
              {Math.round(room.w)}' x {Math.round(room.h)}' 
            </text>

            {/* Doors */}
            {room.doors && room.doors.map((d, j) => renderDoor(d, room))}
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
                  stroke="#94a3b8" 
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
                      stroke="#475569" 
                      strokeWidth="1"
                  />
              ))}
              <text x={(s.x + s.w/2) * scale} y={(s.y + s.h/2) * scale} fill="#94a3b8" fontSize="10" textAnchor="middle">UP</text>
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
              fill="#ef4444" 
          />
      ))}

    </svg> 
  ); 
}