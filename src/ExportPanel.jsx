import { exportDXF } from "./export/dxfExporter";
import { Download, Video, FileCode, Image } from "lucide-react";

export default function ExportPanel({ data, floor }) {
  
  const handleCaptureImage = () => {
    const canvas = document.getElementById("floor-plan-3d-canvas");
    if (!canvas) {
        alert("3D Canvas not found. Make sure 3D view is visible.");
        return;
    }
    
    // Create a high-quality capture
    const url = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.href = url;
    link.download = "architectural_render.png";
    link.click();
  };

  const handleExportSVG = () => {
    const svg = document.getElementById(`floor-plan-svg-${floor}`);
    if (!svg) {
        alert("SVG not found. Make sure 2D plan is visible.");
        return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `floor_${floor + 1}.svg`;
    link.click();
  };

  const handleExportDXF = () => {
      exportDXF(data.rooms, data.stairs, data.extras, data.columns);
  };

  const handleRecordWalkthrough = () => {
      const canvas = document.getElementById("floor-plan-3d-canvas");
      if (!canvas) {
          alert("3D Canvas not found. Make sure 3D view is visible.");
          return;
      }

      // Check for support
      if (!canvas.captureStream) {
          alert("Your browser does not support canvas recording.");
          return;
      }

      try {
        const stream = canvas.captureStream(30); // 30 FPS
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' }); // Use webm for broader support, or check types
        
        const chunks = [];
        recorder.ondataavailable = e => {
            if (e.data.size > 0) chunks.push(e.data);
        };
        
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "walkthrough.webm"; // MP4 often requires proprietary codecs not always available in MediaRecorder API in all browsers. WebM is safer.
            link.click();
        };

        recorder.start();
        alert("Recording started... (will stop in 10 seconds)");

        setTimeout(() => {
            if (recorder.state === "recording") {
                recorder.stop();
                alert("Recording finished! Downloading...");
            }
        }, 10000);
      } catch (e) {
          console.error(e);
          alert("Error recording: " + e.message);
      }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{fontSize: '1rem', color: 'var(--primary)', marginTop: 0}}>Export & Share</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="btn-secondary" onClick={handleCaptureImage} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}>
            <Image size={18} /> Capture 3D Image
        </button>
        <button className="btn-secondary" onClick={handleExportSVG} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}>
            <FileCode size={18} /> Export SVG (Floor {floor + 1})
        </button>
        <button className="btn-secondary" onClick={handleExportDXF} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}>
            <Download size={18} /> Export DXF (CAD)
        </button>
        <button className="btn-secondary" onClick={handleRecordWalkthrough} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}>
            <Video size={18} /> Record 3D Walkthrough (10s)
        </button>
      </div>
    </div>
  );
}
