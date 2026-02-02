import React from 'react';

export default function SiteReport({ site, soil, zone, cost, earthquakeRecs }) { 
  if (!site || !soil || !zone || !cost) return null;

  return ( 
    <div className="glass-panel" style={{ 
        marginTop: '20px', 
        padding: '20px'
    }}> 
      <h2 style={{ borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '10px', marginTop: 0, fontSize: '1.2rem' }}>🏗️ Site Analysis & Costing</h2> 
      
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {/* Site Data */}
          <div>
              <h3 style={{fontSize: '1rem', color: 'var(--primary)'}}>📍 Site Data</h3>
              <div style={{fontSize: '0.9rem', color: 'var(--text-light)'}}>
                  <p style={{margin: '5px 0'}}><strong>Coordinates:</strong> {site.lat.toFixed(4)}, {site.lng.toFixed(4)}</p>
                  <p style={{margin: '5px 0'}}><strong>Soil Type:</strong> {soil.type}</p>
                  <p style={{margin: '5px 0'}}><strong>Bearing Capacity:</strong> {soil.bearingCapacity} kN/m²</p>
                  <p style={{margin: '5px 0'}}><strong>Foundation:</strong> {soil.foundationType}</p>
                  <div style={{ 
                      display: 'inline-block', 
                      padding: '5px 10px', 
                      borderRadius: '4px', 
                      backgroundColor: soil.riskLevel === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: soil.riskLevel === 'High' ? '#ef4444' : '#10b981',
                      fontWeight: 'bold',
                      marginTop: '5px',
                      fontSize: '0.8rem'
                  }}>
                      Risk Level: {soil.riskLevel}
                  </div>
              </div>
          </div>

          {/* Compliance */}
          <div>
              <h3 style={{fontSize: '1rem', color: 'var(--primary)'}}>🌍 Compliance (Seismic)</h3>
              <p style={{margin: '5px 0', fontSize: '0.9rem'}}><strong>Zone:</strong> {zone} (India Std)</p>
              <ul style={{ fontSize: '0.8rem', paddingLeft: '20px', color: 'var(--text-light)', margin: '5px 0' }}>
                  {earthquakeRecs.map((rec, i) => (
                      <li key={i}>{rec}</li>
                  ))}
              </ul>
          </div>
      </div>

      <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />

      {/* Cost Estimation */}
      <div>
          <h3 style={{fontSize: '1rem', color: 'var(--primary)'}}>💰 Cost Estimation</h3>
          <p style={{margin: '5px 0', fontSize: '0.9rem'}}><strong>Total Built-Up Area:</strong> {cost.totalArea} sq.ft</p>
          <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--success)', margin: '10px 0' }}>
              Estimated: ₹{cost.estimatedCost.toLocaleString()}
          </p>
          
          <div style={{ marginTop: '10px' }}>
              <h4 style={{fontSize: '0.9rem', margin: '5px 0'}}>Breakdown:</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr', gap: '5px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  <li style={{display: 'flex', justifyContent: 'space-between'}}><span>🧱 Structure:</span> <span>₹{cost.breakdown.structure.toLocaleString()}</span></li>
                  <li style={{display: 'flex', justifyContent: 'space-between'}}><span>🎨 Finishes:</span> <span>₹{cost.breakdown.finishes.toLocaleString()}</span></li>
                  <li style={{display: 'flex', justifyContent: 'space-between'}}><span>⚡ Electrical:</span> <span>₹{cost.breakdown.electrical.toLocaleString()}</span></li>
                  <li style={{display: 'flex', justifyContent: 'space-between'}}><span>🚿 Plumbing:</span> <span>₹{cost.breakdown.plumbing.toLocaleString()}</span></li>
                  <li style={{display: 'flex', justifyContent: 'space-between'}}><span>🛠️ Misc/Labor:</span> <span>₹{cost.breakdown.misc.toLocaleString()}</span></li>
              </ul>
          </div>
      </div>
    </div> 
  ); 
} 
