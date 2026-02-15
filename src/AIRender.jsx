import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

export default function AIRender({ 
  aiMode, 
  setAiMode, 
  generatedImages, 
  isGeneratingImage, 
  aiError, 
  onGenerate 
}) {
  const currentImage = generatedImages?.[aiMode];
  
  // Dependency Logic: Exterior requires Interior (Floor Plan) to be generated first
  const canGenerate = aiMode === 'interior' || !!generatedImages?.interior;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface-sunken)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ padding: '10px', display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--border)', zIndex: 10 }}>
          <div className="segmented">
            <button 
              className="segmented__btn" 
              aria-pressed={aiMode === 'exterior'}
              onClick={() => setAiMode('exterior')}
            >
              Exterior View
            </button>
            <button 
              className="segmented__btn" 
              aria-pressed={aiMode === 'interior'}
              onClick={() => setAiMode('interior')}
            >
              2D Floor Plan
            </button>
          </div>
        </div>

        {currentImage ? (
            <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <img src={currentImage} alt={`AI Generated ${aiMode === 'exterior' ? 'Exterior' : 'Floor Plan'}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <button 
                    className="btn-secondary" 
                    style={{ position: 'absolute', bottom: 20, right: 20, background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    onClick={onGenerate}
                    disabled={isGeneratingImage}
                >
                    {isGeneratingImage ? 'Regenerating...' : 'Regenerate'} <Zap size={16} style={{marginLeft: 8}} />
                </button>
            </div>
        ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, width: '100%' }}>
                <div style={{ display: 'inline-flex', padding: 16, background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '50%', marginBottom: 20 }}>
                    <Zap size={32} style={{ color: 'var(--primary)' }} />
                </div>
                <h3 style={{ marginBottom: 8 }}>
                    {aiMode === 'exterior' ? 'Generate Exterior Visualization' : 'Generate Floor Plan Visualization'}
                </h3>
                <p style={{ color: 'var(--text-light)', maxWidth: 400, margin: '0 auto 30px' }}>
                    {aiMode === 'exterior' 
                        ? 'Use AI to create a photorealistic rendering of your house exterior.' 
                        : 'Create a brochure-style floor plan with realistic textures and furniture.'}
                </p>
                
                {aiError && (
                    <div style={{ color: 'var(--error)', marginBottom: 20, maxWidth: 400, marginInline: 'auto', padding: 12, background: 'rgba(255,0,0,0.1)', borderRadius: 8 }}>
                        {aiError}
                    </div>
                )}
                
                {!canGenerate && aiMode === 'exterior' && (
                     <div style={{ color: 'var(--warning)', marginBottom: 20, maxWidth: 400, marginInline: 'auto', padding: 12, background: 'rgba(255, 165, 0, 0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                        <AlertTriangle size={32} />
                        <span style={{ fontSize: '0.9em' }}>
                            <strong>Prerequisite Missing:</strong> Please generate the <strong>2D Floor Plan</strong> first. The exterior render relies on the approved AI floor plan layout.
                        </span>
                    </div>
                )}

                <button 
                    className="btn-primary" 
                    onClick={onGenerate} 
                    disabled={isGeneratingImage || !canGenerate}
                    style={{ opacity: canGenerate ? 1 : 0.5, cursor: canGenerate ? 'pointer' : 'not-allowed' }}
                >
                    {isGeneratingImage ? 'Generating...' : `Generate ${aiMode === 'exterior' ? 'Exterior' : 'Floor Plan'}`} <Zap size={18} style={{marginLeft: 8}} />
                </button>
                
                {!canGenerate && (
                    <div style={{ marginTop: 15 }}>
                        <button 
                            className="btn-link"
                            onClick={() => setAiMode('interior')}
                            style={{ color: 'var(--primary)', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                            Switch to 2D Floor Plan
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
}
