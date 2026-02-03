import { exportDXF } from "./export/dxfExporter";
import { exportSoilReportPDF } from "./export/pdfExporter";
import { Download, Video, FileCode, Image, FileText } from "lucide-react";

export default function ExportPanel({ data, floor, reportData }) {
  
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

  const handleExportReport = () => {
    if (!reportData) {
        alert("Report data not available yet.");
        return;
    }
    exportSoilReportPDF(reportData);
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
    <div className="export-panel">
      <div className="export-panel__list">
        <button className="btn-secondary export-panel__btn" onClick={handleCaptureImage}>
          <span className="export-panel__icon" aria-hidden="true"><Image size={18} /></span>
          <span>Capture 3D Image</span>
        </button>
        <button className="btn-secondary export-panel__btn" onClick={handleExportSVG}>
          <span className="export-panel__icon" aria-hidden="true"><FileCode size={18} /></span>
          <span>Export SVG (Floor {floor + 1})</span>
        </button>
        <button className="btn-secondary export-panel__btn" onClick={handleExportDXF}>
          <span className="export-panel__icon" aria-hidden="true"><Download size={18} /></span>
          <span>Export DXF (CAD)</span>
        </button>
        <button className="btn-secondary export-panel__btn" onClick={handleExportReport}>
          <span className="export-panel__icon" aria-hidden="true"><FileText size={18} /></span>
          <span>Export Soil & Site Report (PDF)</span>
        </button>
        <button className="btn-secondary export-panel__btn" onClick={handleRecordWalkthrough}>
          <span className="export-panel__icon" aria-hidden="true"><Video size={18} /></span>
          <span>Record 3D Walkthrough (10s)</span>
        </button>
      </div>
    </div>
  );
}