
export default function SiteReport({ site, soil, zone, cost, earthquakeRecs }) { 
  if (!site || !soil || !zone || !cost) return null;

  const riskTone = soil.riskLevel === 'High' ? 'danger' : soil.riskLevel === 'Low' ? 'success' : 'warning';

  return ( 
    <div className="site-report">
      <div className="site-report__grid">
        <div className="site-report__block">
          <h4 className="site-report__heading">Site Data</h4>
          <div className="spec-table">
            <div className="spec-row">
              <div className="spec-key">Coordinates</div>
              <div className="spec-val">{site.lat.toFixed(4)}, {site.lng.toFixed(4)}</div>
            </div>
            <div className="spec-row">
              <div className="spec-key">Soil Type</div>
              <div className="spec-val">{soil.type}</div>
            </div>
            <div className="spec-row">
              <div className="spec-key">Bearing Capacity</div>
              <div className="spec-val">{soil.bearingCapacity} kN/m²</div>
            </div>
            <div className="spec-row">
              <div className="spec-key">Foundation</div>
              <div className="spec-val">{soil.foundationType}</div>
            </div>
            <div className="spec-row">
              <div className="spec-key">Risk Level</div>
              <div className="spec-val">
                <span className={`badge badge--${riskTone}`}>{soil.riskLevel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="site-report__block">
          <h4 className="site-report__heading">Compliance (Seismic)</h4>
          <div className="site-report__zone">Zone: <strong>{zone}</strong> (India Std)</div>
          <ul className="site-report__list">
            {earthquakeRecs.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-report__divider" />

      <div className="site-report__block">
        <h4 className="site-report__heading">Cost Estimation</h4>
        <div className="site-report__costTop">
          <div className="site-report__costMeta">Total Built-Up Area: <strong>{cost.totalArea}</strong> sq.ft</div>
          <div className="site-report__costValue">₹{cost.estimatedCost.toLocaleString()}</div>
        </div>

        <div className="site-report__breakdown">
          <div className="site-report__breakdownTitle">Breakdown</div>
          <div className="site-report__breakdownList">
            <div className="site-report__breakdownRow"><span>Structure</span><span>₹{cost.breakdown.structure.toLocaleString()}</span></div>
            <div className="site-report__breakdownRow"><span>Finishes</span><span>₹{cost.breakdown.finishes.toLocaleString()}</span></div>
            <div className="site-report__breakdownRow"><span>Electrical</span><span>₹{cost.breakdown.electrical.toLocaleString()}</span></div>
            <div className="site-report__breakdownRow"><span>Plumbing</span><span>₹{cost.breakdown.plumbing.toLocaleString()}</span></div>
            <div className="site-report__breakdownRow"><span>Misc / Labor</span><span>₹{cost.breakdown.misc.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  ); 
}
