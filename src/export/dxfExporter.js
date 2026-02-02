import DxfWriter from "dxf-writer"; 

export function exportDXF(rooms, stairs, extras, columns) { 
  const dxf = new DxfWriter(); 
  dxf.setUnits('Feet');

  dxf.addLayer("rooms", DxfWriter.ACI.RED, 'CONTINUOUS'); 
  dxf.addLayer("stairs", DxfWriter.ACI.BLUE, 'CONTINUOUS'); 
  dxf.addLayer("extras", DxfWriter.ACI.GREEN, 'CONTINUOUS'); 
  dxf.addLayer("columns", DxfWriter.ACI.MAGENTA, 'CONTINUOUS'); 

  dxf.setActiveLayer('rooms');
  rooms.forEach(r => { 
    // Draw rectangle using polyline
    // (x, y) -> (x+w, y) -> (x+w, y+h) -> (x, y+h) -> (x, y)
    dxf.drawPolyline([
        [r.x, r.y],
        [r.x + r.w, r.y],
        [r.x + r.w, r.y + r.h],
        [r.x, r.y + r.h],
        [r.x, r.y]
    ]);
  }); 

  dxf.setActiveLayer('stairs');
  stairs.forEach(s => { 
    dxf.drawPolyline([
        [s.x, s.y],
        [s.x + s.w, s.y],
        [s.x + s.w, s.y + s.h],
        [s.x, s.y + s.h],
        [s.x, s.y]
    ]);
  }); 

  dxf.setActiveLayer('extras');
  extras.forEach(e => { 
    dxf.drawPolyline([
        [e.x, e.y],
        [e.x + e.w, e.y],
        [e.x + e.w, e.y + e.h],
        [e.x, e.y + e.h],
        [e.x, e.y]
    ]);
  }); 

  if (columns) {
    dxf.setActiveLayer('columns');
    columns.forEach(c => {
        dxf.drawPolyline([
            [c.x, c.y],
            [c.x + c.size, c.y],
            [c.x + c.size, c.y + c.size],
            [c.x, c.y + c.size],
            [c.x, c.y]
        ]);
    });
  }

  const blob = new Blob([dxf.toDxfString()], { type: "application/dxf" }); 
  const url = URL.createObjectURL(blob); 
  const link = document.createElement("a"); 
  link.href = url; 
  link.download = "plan.dxf"; 
  link.click(); 
} 
