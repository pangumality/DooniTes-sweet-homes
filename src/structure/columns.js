export function generateColumns({ rooms, floors, floorHeight, spacing = 15, columnSize = 1 }) { 
  const columns = []; 
  const processed = new Set(); // To avoid duplicates

  for (let floor = 0; floor < floors; floor++) { 
    rooms 
      .filter(r => r.floor === floor) 
      .forEach(room => { 
        // Ensure we cover the edges if they align, or at least the corners if possible?
        // The user's snippet used Math.floor.
        // If room starts at 10. floor(10/15)*15 = 0. 0 is outside.
        // If we want columns INSIDE or ON EDGE.
        // If I use Math.ceil, for 10, ceil(10/15)*15 = 15. 15 is inside.
        // But what about the corner at 10? The grid might not align with walls.
        // User said: "Place grid columns along main walls (edges of rooms) Maintain interior columns at a fixed spacing"
        // If the grid is 15ft, and room is at 10ft, the grid line is at 15ft.
        // To place columns along main walls, we should probably add columns at room corners explicitly?
        // The user's code:
        // `const xStart = Math.floor(room.x / spacing) * spacing;`
        // `for (let x = xStart; x <= xEnd; x += spacing)`
        // This iterates a global grid.
        // If x < room.x, it's outside.
        // I should probably filter x to be within [room.x, room.x + room.w].
        // Or maybe the intention is that the grid drives the structure and walls might be slightly off?
        // But "Columns respect rooms" implies they should be valid.
        // I will add a check to ensure column is inside or on boundary of the room.
        
        // Actually, let's look at the user's snippet again.
        // `const xStart = Math.floor(room.x / spacing) * spacing;`
        // `for (let x = xStart; x <= xEnd; x += spacing)`
        // This will include points to the left of the room if `room.x % spacing !== 0`.
        // I will stick to the user's snippet but add a boundary check to be safe and clean.
        
        const xGridStart = Math.floor(room.x / spacing) * spacing;
        const yGridStart = Math.floor(room.y / spacing) * spacing;
        const xEnd = room.x + room.w; 
        const yEnd = room.y + room.h; 

        for (let x = xGridStart; x <= xEnd + 0.1; x += spacing) { 
          for (let y = yGridStart; y <= yEnd + 0.1; y += spacing) { 
            
            // Boundary Check: strictly strictly inside or on edge
            // Allow a small epsilon
            if (x < room.x - 0.1 || x > room.x + room.w + 0.1) continue;
            if (y < room.y - 0.1 || y > room.y + room.h + 0.1) continue;

            // Avoid overlapping doors
            // Note: d.x is relative to room.x
            const occupied = room.doors.some(d => Math.abs((d.x + room.x) - x) < 2 && Math.abs((d.y + room.y) - y) < 2); 
            
            if (!occupied) { 
               const key = `${x},${y},${floor}`;
               if (processed.has(key)) continue;
               processed.add(key);

              columns.push({ 
                x, 
                y, 
                floor, 
                size: columnSize, 
                height: floorHeight 
              }); 
            } 
          } 
        } 
      }); 
  } 

  return columns; 
} 
