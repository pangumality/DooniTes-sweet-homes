import { exportDXF } from "./export/dxfExporter";
import { exportSoilReportPDF } from "./export/pdfExporter";
import { Download, Video, FileCode, Image, FileText, Package, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { forwardRef, useImperativeHandle, useState } from "react";

// Helper for video recording
const recordCanvas = (canvas, durationMs) => {
  return new Promise((resolve, reject) => {
    if (!canvas.captureStream) {
        reject(new Error("Canvas recording not supported"));
        return;
    }
    try {
        const stream = canvas.captureStream(30); // 30 FPS
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' }); 
        const chunks = [];
        recorder.ondataavailable = e => {
            if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            resolve(blob);
        };
        recorder.start();
        setTimeout(() => {
            if (recorder.state === "recording") recorder.stop();
        }, durationMs);
    } catch (e) {
        reject(e);
    }
  });
};

const ExportPanel = forwardRef(function ExportPanel({ data, floor, reportData, setAnimationMode, generatedImages, dashboardMode, setDashboardMode, viewMode, setViewMode }, ref) {
  const [isZipping, setIsZipping] = useState(false);
  const hasAiRenders = Boolean(generatedImages?.interior && generatedImages?.exterior);
  const [showMissingAiModal, setShowMissingAiModal] = useState(false);
  
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

  const handleRecordVideo = async (mode) => {
      const canvas = document.getElementById("floor-plan-3d-canvas");
      if (!canvas) {
          alert("3D Canvas not found. Make sure 3D view is visible.");
          return;
      }

      try {
        if (setAnimationMode) setAnimationMode(mode);
        
        alert(`Recording ${mode} video... (will stop in 15 seconds)`);

        // Wait for animation to start and textures to load
        await new Promise(r => setTimeout(r, 1500));
        
        const blob = await recordCanvas(canvas, 15000);
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${mode}_video.webm`; 
        link.click();
        
        if (setAnimationMode) setAnimationMode('none');
        alert("Recording finished! Downloading...");

      } catch (e) {
          console.error(e);
          alert("Error recording: " + e.message);
          if (setAnimationMode) setAnimationMode('none');
      }
  };

  const handleDownloadZip = async () => {
      if (!hasAiRenders) {
          setShowMissingAiModal(true);
          return;
      }
      // 1. Check prerequisites & Handle Mode Switching
      let canvas3d = document.getElementById("floor-plan-3d-canvas");
      let switchedMode = false;
      let switchedViewMode = false;
      const previousViewMode = viewMode;

      // If in AI mode, we need to switch to 3D model mode to capture the video
      if (!canvas3d && dashboardMode === 'ai' && setDashboardMode) {
          // alert("Switching to 3D Model View to record video...");
          setDashboardMode('model');
          switchedMode = true;
          // Wait for DOM update and Canvas init
          await new Promise(r => setTimeout(r, 2000));
          canvas3d = document.getElementById("floor-plan-3d-canvas");
      }

      if (!canvas3d && viewMode === '2d' && setViewMode) {
          setViewMode('exterior');
          switchedViewMode = true;
          await new Promise(r => setTimeout(r, 1500));
          canvas3d = document.getElementById("floor-plan-3d-canvas");
      }

      if (!canvas3d) {
          alert("Please switch to '3D Walkthrough' mode to generate the project zip (Video required).");
          return;
      }

      setIsZipping(true);
      try {
        const zip = new JSZip();
        const root = zip.folder(`Project_Floor_${floor + 1}`);

        // 2. Add AI Images
        if (generatedImages?.interior) {
            try {
                const resp = await fetch(generatedImages.interior);
                const blob = await resp.blob();
                root.file("AI_Interior_Render.png", blob);
            } catch (err) {
                console.error("Failed to add interior image", err);
            }
        }
        if (generatedImages?.exterior) {
            try {
                const resp = await fetch(generatedImages.exterior);
                const blob = await resp.blob();
                root.file("AI_Exterior_Render.png", blob);
            } catch (err) {
                console.error("Failed to add exterior image", err);
            }
        }

        // 3. Capture 2D Model View (Snapshot)
        const svgElement = document.getElementById(`floor-plan-svg-${floor}`);
        if (svgElement) {
            try {
                // Capture the parent container to get the full view
                const canvas2d = await html2canvas(svgElement.parentElement, { 
                    scale: 2, 
                    backgroundColor: "#ffffff",
                    logging: false
                });
                const blob2d = await new Promise(r => canvas2d.toBlob(r, 'image/png'));
                root.file("2D_Model_Blueprint.png", blob2d);
            } catch (err) {
                console.error("Failed to capture 2D plan", err);
            }
        }

        // 4. Record Video (10s spin)
        if (setAnimationMode) setAnimationMode('exterior'); // Start spin
        await new Promise(r => setTimeout(r, 1000)); // Wait for render
        const videoBlob = await recordCanvas(canvas3d, 10000); // 10s
        root.file("3D_Walkthrough_Video.webm", videoBlob);
        if (setAnimationMode) setAnimationMode('none');

        // 5. Generate Zip
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Project_Floor_${floor + 1}_Assets.zip`);

      } catch (e) {
          console.error("Zip generation failed:", e);
          alert("Failed to generate zip: " + e.message);
      } finally {
          setIsZipping(false);
          if (setAnimationMode) setAnimationMode('none');
          if (switchedViewMode && setViewMode) {
              setViewMode(previousViewMode);
          }
          
          // Switch back to AI mode if we auto-switched
          if (switchedMode && setDashboardMode) {
              setDashboardMode('ai');
          }
      }
  };

  useImperativeHandle(ref, () => ({
      downloadZip: handleDownloadZip
  }), [handleDownloadZip]);

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
        <button className="btn-secondary export-panel__btn" onClick={() => handleRecordVideo('walkthrough')}>
          <span className="export-panel__icon" aria-hidden="true"><Video size={18} /></span>
          <span>Record 3D Walkthrough (15s)</span>
        </button>
        <button className="btn-secondary export-panel__btn" onClick={() => handleRecordVideo('orbit')}>
          <span className="export-panel__icon" aria-hidden="true"><Video size={18} /></span>
          <span>Record 360 Drone Video (15s)</span>
        </button>

        <button 
            className="btn-primary export-panel__btn" 
            onClick={handleDownloadZip}
            disabled={isZipping}
            aria-disabled={!hasAiRenders}
            title={!hasAiRenders ? "Generate both Interior and Exterior AI renders to enable download." : undefined}
            style={{ marginTop: 10, justifyContent: 'center', backgroundColor: 'var(--primary)', color: 'white' }}
        >
          {isZipping ? (
              <span className="export-panel__icon spin"><Loader2 size={18} /></span>
          ) : (
              <span className="export-panel__icon"><Package size={18} /></span>
          )}
          <span>{isZipping ? 'Packaging Assets...' : 'Download Project Zip'}</span>
        </button>
      </div>
      {showMissingAiModal && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-labelledby="missing-ai-title">
          <div className="modalCard">
            <h3 id="missing-ai-title" className="modalTitle">Generate AI Renders</h3>
            <p className="text-light">Generate both Interior and Exterior AI renders to enable the project zip export.</p>
            <div className="modalActions">
              <button className="btn-secondary" onClick={() => setShowMissingAiModal(false)}>Close</button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowMissingAiModal(false);
                  if (setDashboardMode) setDashboardMode('ai');
                }}
              >
                Go to AI Render
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ExportPanel;
