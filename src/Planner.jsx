import { useState } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, MapPin, Home, Layers, Zap, LayoutDashboard, Briefcase, Car, Leaf, Building, FileText, Image, Ruler, ClipboardList, ShieldCheck } from "lucide-react";

import FloorPlan2D from "./FloorPlan2D"; 
import FloorPlan3D from "./FloorPlan3D"; 
import { generatePlan } from "./generatePlan"; 
import { generateColumns } from "./structure/columns"; 

import ExportPanel from "./ExportPanel";
import SiteLocation from "./components/SiteLocation";
import SiteReport from "./components/SiteReport";
import { analyzeSoil } from "./analysis/soil";
import { getEarthquakeZone, earthquakeRecommendations } from "./analysis/earthquake";
import { estimateCost } from "./estimation/cost";
import RoomsPalette from "./components/RoomsPalette";

export default function App() { 
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Unified Form State
  const [formData, setFormData] = useState({
      width: 60,
    depth: 80,
      floors: 2,
      facing: "South",
      bedrooms: 2,
      kitchens: 1,
      bathrooms: 2,
      bathroomSize: "Standard",
      masterBedroomSize: "Standard",
      quality: "Super",
      features: {
          office: false,
          parking: true,
          garden: true,
          balcony: true,
          garage: false
      }
  });

  const [siteLocation, setSiteLocation] = useState({ lat: 20, lng: 78 });
  
  // Results State
  const [data, setData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [floor, setFloor] = useState(0); 
  const [viewMode, setViewMode] = useState('floorplan'); // 'floorplan' | 'exterior'

  const updateField = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFeature = (feature, value) => {
      setFormData(prev => ({
          ...prev,
          features: { ...prev.features, [feature]: value }
      }));
  };

  const handleGenerate = async () => {
      setLoading(true);
      
      // Simulate processing time for animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = generatePlan(formData);
      
      const columns = generateColumns({ 
        rooms: result.rooms, 
        floors: formData.floors, 
        floorHeight: 10, 
        spacing: 15, 
        columnSize: 1 
      });

      setData({ ...result, columns, width: formData.width, depth: formData.depth });
      setFloor(0);

      // Generate Report Data
      if (siteLocation) {
          const soil = analyzeSoil(siteLocation.lat, siteLocation.lng);
          const zone = getEarthquakeZone(siteLocation.lat, siteLocation.lng);
          const earthquakeRecs = earthquakeRecommendations(zone);
          
          const builtUpArea = formData.width * formData.depth * formData.floors; // Simplified

          const cost = estimateCost({
              builtUpArea,
              floors: formData.floors,
              quality: formData.quality
          });

          setReportData({
              site: siteLocation,
              soil,
              zone,
              earthquakeRecs,
              cost
          });
      }

      setLoading(false);
      setStep(6); // Go to Dashboard
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const steps = [
      { id: 1, title: "Location", icon: MapPin },
      { id: 2, title: "Dimensions", icon: LayoutDashboard },
      { id: 3, title: "Rooms", icon: Home },
      { id: 4, title: "Extras", icon: Layers },
      { id: 5, title: "Review", icon: Check },
  ];

  const clampNumber = (value, min, max) => {
      if (!Number.isFinite(value)) return min;
      return Math.min(max, Math.max(min, value));
  };

  const facingToDeg = {
      North: 0,
      East: 90,
      South: 180,
      West: 270
  };

  const titleCase = (value) => {
      if (!value) return '';
      return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const selectedZones = Object.entries(formData.features)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => titleCase(key));

  const siteLabel = siteLocation
      ? `${siteLocation.lat.toFixed(2)}° N, ${siteLocation.lng.toFixed(2)}° E`
      : '—';

  const plotArea = Math.round(formData.width * formData.depth);
  const plotLabel = `${formData.width}' × ${formData.depth}' (${plotArea.toLocaleString()} sq ft)`;

  const qualitySubtitle = {
      'Super': 'Standard finishes, dependable materials',
      'Semi-Luxury': 'Premium finishes, upgraded fixtures',
      'Luxury': 'High-end imports, designer options'
  };

  return ( 
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-brand">
            <div className="app-brand__mark" aria-hidden="true">
              <Zap size={20} />
            </div>
            <div className="app-brand__text">
              <div className="app-brand__name">doonITes</div>
              <div className="app-brand__sub">Sweet Home</div>
            </div>
          </div>

          {step < 6 && (
            <nav className="app-stepper" aria-label="Project steps">
              <ol className="app-stepper__list">
                {steps.map(s => (
                  <li
                    key={s.id}
                    className={`app-stepper__item ${step === s.id ? 'is-active' : ''} ${step > s.id ? 'is-complete' : ''}`}
                  >
                    <div className="app-stepper__dot" aria-hidden="true">
                      {step > s.id ? <Check size={14} /> : s.id}
                    </div>
                    <span className="app-stepper__label">{s.title}</span>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
            
            {/* Step 1: Location */}
            {step === 1 && (
                <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-panel wizard-step"
                    style={{ maxWidth: '1000px' }}
                >
                    <div className="review-header">
                        <div className="review-header__icon" aria-hidden="true">
                            <MapPin size={22} />
                        </div>
                        <div className="review-header__text">
                            <h2>Define Site Coordinates</h2>
                            <p className="text-light">Pin the location to run soil and seismic analysis.</p>
                        </div>
                    </div>

                    <div className="section-card" style={{ marginTop: '16px' }}>
                        <div className="section-card__header">
                            <h3 className="section-card__title">Location</h3>
                        </div>
                        <div className="section-card__body">
                            <SiteLocation setLocation={setSiteLocation} location={siteLocation} />
                        </div>
                    </div>

                    <div className="wizard-actions wizard-actions--end" style={{ marginTop: '20px' }}>
                        <button className="btn-primary" onClick={nextStep}>
                            Next Step <ChevronRight size={18} style={{verticalAlign: 'middle'}} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Step 2: Dimensions & Structure */}
            {step === 2 && (
                <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-panel wizard-step"
                    style={{ maxWidth: '1000px' }}
                >
                    <h2>Plot & Structure</h2>
                    <p className="text-light">Define the physical constraints of your project.</p>

                    <div className="dimensions-grid" style={{ margin: '20px 0' }}>
                        <div className="section-card">
                            <div className="section-card__header">
                                <h3 className="section-card__title">Plot Constraints</h3>
                            </div>
                            <div className="section-card__body">
                                <div className="field-grid">
                                    <div>
                                        <label htmlFor="plot-width">Plot Width (ft)</label>
                                        <div className="input-group">
                                            <input
                                                id="plot-width"
                                                className="input-field"
                                                type="number"
                                                value={formData.width}
                                                onChange={e => updateField('width', Number(e.target.value))}
                                            />
                                            <span className="input-group__addon">ft</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="plot-depth">Plot Depth (ft)</label>
                                        <div className="input-group">
                                            <input
                                                id="plot-depth"
                                                className="input-field"
                                                type="number"
                                                value={formData.depth}
                                                onChange={e => updateField('depth', Number(e.target.value))}
                                            />
                                            <span className="input-group__addon">ft</span>
                                        </div>
                                    </div>

                                    <p className="helper-text">Define the precise physical constraints of the project site.</p>
                                </div>
                            </div>
                        </div>

                        <div className="section-card">
                            <div className="section-card__header">
                                <h3 className="section-card__title">Structure & Orientation</h3>
                            </div>
                            <div className="section-card__body">
                                <div className="field-grid">
                                    <div>
                                        <label>Number of Floors</label>
                                        <div className="segmented">
                                            {[1, 2].map(n => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    className="segmented__btn"
                                                    aria-pressed={formData.floors === n}
                                                    onClick={() => updateField('floors', n)}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                className="segmented__btn"
                                                aria-pressed={formData.floors >= 3}
                                                onClick={() => updateField('floors', Math.max(3, formData.floors))}
                                            >
                                                3+
                                            </button>
                                        </div>
                                        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px', alignItems: 'end' }}>
                                            <div>
                                                <p className="helper-text">Use quick picks or set an exact floor count.</p>
                                            </div>
                                            <div>
                                                <label htmlFor="floors-exact">Floors</label>
                                                <input
                                                    id="floors-exact"
                                                    className="input-field"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={formData.floors}
                                                    onChange={e => updateField('floors', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label>Entrance Facing</label>
                                        <div className="compass" role="group" aria-label="Entrance facing">
                                            <button
                                                type="button"
                                                className="compass__dir"
                                                aria-pressed={formData.facing === 'North'}
                                                onClick={() => updateField('facing', 'North')}
                                                style={{ gridColumn: 2, gridRow: 1 }}
                                            >
                                                N
                                            </button>
                                            <button
                                                type="button"
                                                className="compass__dir"
                                                aria-pressed={formData.facing === 'West'}
                                                onClick={() => updateField('facing', 'West')}
                                                style={{ gridColumn: 1, gridRow: 2 }}
                                            >
                                                W
                                            </button>
                                            <div className="compass__center" style={{ gridColumn: 2, gridRow: 2 }}>
                                                <div
                                                    className="compass__arrow"
                                                    style={{ transform: `rotate(${facingToDeg[formData.facing] ?? 0}deg)` }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="compass__dir"
                                                aria-pressed={formData.facing === 'East'}
                                                onClick={() => updateField('facing', 'East')}
                                                style={{ gridColumn: 3, gridRow: 2 }}
                                            >
                                                E
                                            </button>
                                            <button
                                                type="button"
                                                className="compass__dir"
                                                aria-pressed={formData.facing === 'South'}
                                                onClick={() => updateField('facing', 'South')}
                                                style={{ gridColumn: 2, gridRow: 3 }}
                                            >
                                                S
                                            </button>
                                        </div>
                                        <p className="helper-text" style={{ textAlign: 'center', marginTop: '10px' }}>Selected: {formData.facing}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                        <button className="btn-secondary" onClick={prevStep}>Back</button>
                        <button className="btn-primary" onClick={nextStep}>
                            Next Step <ChevronRight size={18} style={{verticalAlign: 'middle'}} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Step 3: Room Configuration */}
            {step === 3 && (
                <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-panel wizard-step"
                    style={{ maxWidth: '1000px' }}
                >
                    <h2>Room Configuration</h2>
                    <p className="text-light">Configure the internal layout requirements.</p>

                    <div className="room-table" style={{ margin: '20px 0' }}>
                        <div className="room-table__head">
                            <div>Room Type</div>
                            <div>Quantity</div>
                            <div>Size Selection</div>
                        </div>

                        <div className="room-row">
                            <div className="room-type room-cell" data-label="Room Type">
                                <div className="room-type__name">Bedrooms</div>
                                <div className="room-type__hint">Per floor</div>
                            </div>
                            <div className="room-cell" data-label="Quantity">
                                <div className="stepper">
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('bedrooms', clampNumber(formData.bedrooms - 1, 1, 5))}
                                        disabled={formData.bedrooms <= 1}
                                        aria-label="Decrease bedrooms"
                                    >
                                        −
                                    </button>
                                    <input
                                        className="input-field stepper__input"
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={formData.bedrooms}
                                        onChange={e => updateField('bedrooms', clampNumber(Number(e.target.value), 1, 5))}
                                        aria-label="Bedrooms"
                                    />
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('bedrooms', clampNumber(formData.bedrooms + 1, 1, 5))}
                                        disabled={formData.bedrooms >= 5}
                                        aria-label="Increase bedrooms"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="room-cell" data-label="Size Selection">
                                <div className="segmented">
                                    {['Standard', 'Big', 'Small'].map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            className="segmented__btn"
                                            aria-pressed={formData.masterBedroomSize === size}
                                            onClick={() => updateField('masterBedroomSize', size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="room-row">
                            <div className="room-type room-cell" data-label="Room Type">
                                <div className="room-type__name">Bathrooms</div>
                                <div className="room-type__hint">Per floor</div>
                            </div>
                            <div className="room-cell" data-label="Quantity">
                                <div className="stepper">
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('bathrooms', clampNumber(formData.bathrooms - 1, 1, 4))}
                                        disabled={formData.bathrooms <= 1}
                                        aria-label="Decrease bathrooms"
                                    >
                                        −
                                    </button>
                                    <input
                                        className="input-field stepper__input"
                                        type="number"
                                        min="1"
                                        max="4"
                                        value={formData.bathrooms}
                                        onChange={e => updateField('bathrooms', clampNumber(Number(e.target.value), 1, 4))}
                                        aria-label="Bathrooms"
                                    />
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('bathrooms', clampNumber(formData.bathrooms + 1, 1, 4))}
                                        disabled={formData.bathrooms >= 4}
                                        aria-label="Increase bathrooms"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="room-cell" data-label="Size Selection">
                                <div className="segmented">
                                    {['Standard', 'Big', 'Small'].map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            className="segmented__btn"
                                            aria-pressed={formData.bathroomSize === size}
                                            onClick={() => updateField('bathroomSize', size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="room-row">
                            <div className="room-type room-cell" data-label="Room Type">
                                <div className="room-type__name">Kitchens</div>
                                <div className="room-type__hint">Per floor</div>
                            </div>
                            <div className="room-cell" data-label="Quantity">
                                <div className="stepper">
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('kitchens', clampNumber(formData.kitchens - 1, 1, 2))}
                                        disabled={formData.kitchens <= 1}
                                        aria-label="Decrease kitchens"
                                    >
                                        −
                                    </button>
                                    <input
                                        className="input-field stepper__input"
                                        type="number"
                                        min="1"
                                        max="2"
                                        value={formData.kitchens}
                                        onChange={e => updateField('kitchens', clampNumber(Number(e.target.value), 1, 2))}
                                        aria-label="Kitchens"
                                    />
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('kitchens', clampNumber(formData.kitchens + 1, 1, 2))}
                                        disabled={formData.kitchens >= 2}
                                        aria-label="Increase kitchens"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="room-cell" data-label="Size Selection">
                                <span className="room-muted">—</span>
                            </div>
                        </div>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                        <button className="btn-secondary" onClick={prevStep}>Back</button>
                        <button className="btn-primary" onClick={nextStep}>
                            Next Step <ChevronRight size={18} style={{verticalAlign: 'middle'}} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Step 4: Extras & Quality */}
            {step === 4 && (
                <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-panel wizard-step"
                    style={{ maxWidth: '1000px' }}
                >
                    <h2>Extras & Finishes</h2>
                    <p className="text-light">Select additional features and construction quality.</p>

                    <div className="extras-layout" style={{ margin: '20px 0' }}>
                        <div className="section-card">
                            <div className="section-card__header">
                                <h3 className="section-card__title">Additional Zones</h3>
                            </div>
                            <div className="section-card__body">
                                <div className="feature-grid">
                                    {Object.keys(formData.features).filter(k => k !== 'garage').map(feature => {
                                        const Icon = feature === 'office' ? Briefcase : feature === 'parking' ? Car : feature === 'garden' ? Leaf : Building;
                                        const selected = Boolean(formData.features[feature]);

                                        return (
                                            <button
                                                key={feature}
                                                type="button"
                                                className="feature-tile"
                                                aria-pressed={selected}
                                                onClick={() => updateFeature(feature, !selected)}
                                            >
                                                <span className="feature-tile__left">
                                                    <span className="feature-tile__icon">
                                                        <Icon size={18} />
                                                    </span>
                                                    <span className="feature-tile__label">{feature}</span>
                                                </span>
                                                <span className="feature-tile__check">{selected && <Check size={14} />}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="section-card">
                            <div className="section-card__header">
                                <h3 className="section-card__title">Construction Quality Tiers</h3>
                            </div>
                            <div className="section-card__body">
                                <div className="quality-grid">
                                    {[
                                        {
                                            tier: 'Super',
                                            subtitle: 'Standard finishes, dependable materials',
                                            bullets: ['Code compliant', 'Locally sourced materials', 'Basic textures', 'Standard warranties']
                                        },
                                        {
                                            tier: 'Semi-Luxury',
                                            subtitle: 'Premium finishes, upgraded fixtures',
                                            bullets: ['Enhanced specs', 'Select imported materials', 'Upgraded fixtures', 'Extended warranties']
                                        },
                                        {
                                            tier: 'Luxury',
                                            subtitle: 'High-end imports, designer options',
                                            bullets: ['Top-tier specifications', 'Global sourcing', 'Designer fixtures', 'Lifetime warranty options']
                                        }
                                    ].map(({ tier, subtitle, bullets }) => (
                                        <button
                                            key={tier}
                                            type="button"
                                            className="quality-card"
                                            aria-pressed={formData.quality === tier}
                                            onClick={() => updateField('quality', tier)}
                                        >
                                            {formData.quality === tier && <span className="quality-card__badge">SELECTED</span>}
                                            <h4 className="quality-card__title">{tier}</h4>
                                            <p className="quality-card__subtitle">{subtitle}</p>
                                            <ul className="quality-card__list">
                                                {bullets.map(b => (
                                                    <li key={b}>{b}</li>
                                                ))}
                                            </ul>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                        <button className="btn-secondary" onClick={prevStep}>Back</button>
                        <button className="btn-primary" onClick={nextStep}>
                            Final Review <ChevronRight size={18} style={{verticalAlign: 'middle'}} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Step 5: Review & Generate */}
            {step === 5 && (
                <motion.div 
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-panel wizard-step"
                    style={{ maxWidth: '1000px' }}
                >
                    <div className="review-header">
                        <div className="review-header__icon" aria-hidden="true">
                            <Zap size={28} />
                        </div>
                        <div className="review-header__text">
                            <h2>Final Project Specification & Review</h2>
                            <p className="text-light">Confirm details before generating blueprints.</p>
                        </div>
                    </div>

                    <div className="review-grid" style={{ marginTop: '16px' }}>
                        <div className="section-card">
                            <div className="section-card__header">
                                <h3 className="section-card__title">Site & Structure</h3>
                            </div>
                            <div className="section-card__body">
                                <div className="spec-table">
                                    <div className="spec-row">
                                        <div className="spec-key"><MapPin size={16} /> Location</div>
                                        <div className="spec-val">{siteLabel}</div>
                                    </div>
                                    <div className="spec-row">
                                        <div className="spec-key"><LayoutDashboard size={16} /> Plot Dimensions</div>
                                        <div className="spec-val">{plotLabel}</div>
                                    </div>
                                    <div className="spec-row">
                                        <div className="spec-key"><Home size={16} /> Structure</div>
                                        <div className="spec-val">{formData.floors} Floor{formData.floors === 1 ? '' : 's'}</div>
                                    </div>
                                    <div className="spec-row">
                                        <div className="spec-key"><Ruler size={16} /> Entrance Facing</div>
                                        <div className="spec-val">{formData.facing}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section-card">
                            <div className="section-card__header">
                                <h3 className="section-card__title">Configuration & Extras</h3>
                            </div>
                            <div className="section-card__body">
                                <div className="spec-table">
                                    <div className="spec-row">
                                        <div className="spec-key"><Home size={16} /> Layout Config</div>
                                        <div className="spec-val">{formData.floors}x {formData.bedrooms}BHK</div>
                                    </div>
                                    <div className="spec-row">
                                        <div className="spec-key"><Layers size={16} /> Additional Zones</div>
                                        <div className="spec-val">{selectedZones.length ? selectedZones.join(', ') : 'None'}</div>
                                    </div>
                                    <div className="spec-row">
                                        <div className="spec-key"><Check size={16} /> Quality Tier</div>
                                        <div className="spec-val">
                                            <div className="spec-val__stack">
                                                <div className="spec-val__main">{formData.quality}</div>
                                                <div className="spec-val__sub">{qualitySubtitle[formData.quality] || ''}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-card" style={{ marginTop: '16px' }}>
                        <div className="section-card__header">
                            <h3 className="section-card__title">Project Deliverables</h3>
                        </div>
                        <div className="section-card__body">
                            <div className="deliverables-grid" role="list">
                                {[
                                    { Icon: FileText, title: 'Architectural Floor Plans', subtitle: 'PDF / DWG' },
                                    { Icon: Image, title: '3D Elevations & Renders', subtitle: 'Exterior + walkthrough' },
                                    { Icon: Ruler, title: 'Structural Drawings', subtitle: 'Columns + framing' },
                                    { Icon: ClipboardList, title: 'Material Bill of Quantities', subtitle: 'Estimation ready' },
                                    { Icon: ShieldCheck, title: 'Permit Documentation', subtitle: 'Submission set' }
                                ].map(({ Icon, title, subtitle }) => (
                                    <div key={title} className="deliverable" role="listitem">
                                        <div className="deliverable__icon" aria-hidden="true"><Icon size={18} /></div>
                                        <div className="deliverable__text">
                                            <div className="deliverable__title">{title}</div>
                                            <div className="deliverable__sub">{subtitle}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="review-actions" style={{ marginTop: '20px' }}>
                        <button className="btn-secondary" onClick={prevStep}>Back</button>
                        <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
                            {loading ? 'Generating…' : 'Generate Blueprints'}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Step 6: Dashboard (Final Page) */}
            {step === 6 && data && (
                 <motion.div 
                    key="step6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="dashboard-container"
                 >
                    {/* Sidebar */}
                    <aside className="glass-panel dashboard-sidebar">
                        <div className="dashboard-sidebar__header">
                            <div className="dashboard-sidebar__icon" aria-hidden="true">
                                <LayoutDashboard size={18} />
                            </div>
                            <div className="dashboard-sidebar__titles">
                                <h3 className="dashboard-sidebar__title">Project Dashboard</h3>
                                <p className="dashboard-sidebar__subtitle text-light">Generated plan workspace</p>
                            </div>
                        </div>

                        <div className="dashboard-sidebar__stack">
                            <div className="section-card">
                                <div className="section-card__header">
                                    <h3 className="section-card__title">Project Summary</h3>
                                </div>
                                <div className="section-card__body">
                                    <div className="spec-table">
                                        <div className="spec-row">
                                            <div className="spec-key"><MapPin size={16} /> Location</div>
                                            <div className="spec-val">{siteLabel}</div>
                                        </div>
                                        <div className="spec-row">
                                            <div className="spec-key"><LayoutDashboard size={16} /> Plot</div>
                                            <div className="spec-val">{plotLabel}</div>
                                        </div>
                                        <div className="spec-row">
                                            <div className="spec-key"><Home size={16} /> Structure</div>
                                            <div className="spec-val">{formData.floors} Floor{formData.floors === 1 ? '' : 's'}</div>
                                        </div>
                                        <div className="spec-row">
                                            <div className="spec-key"><Layers size={16} /> Zones</div>
                                            <div className="spec-val">{selectedZones.length ? selectedZones.join(', ') : 'None'}</div>
                                        </div>
                                        <div className="spec-row">
                                            <div className="spec-key"><Check size={16} /> Quality</div>
                                            <div className="spec-val">{formData.quality}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="section-card">
                                <div className="section-card__header">
                                    <h3 className="section-card__title">View Floor</h3>
                                </div>
                                <div className="section-card__body">
                                    <select
                                        className="input-field"
                                        onChange={e => setFloor(Number(e.target.value))}
                                        value={floor}
                                    >
                                        {[...new Set(data.rooms.map(r => r.floor))].map(f => (
                                            <option key={f} value={f}>
                                                Floor {f + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {reportData && (
                                <div className="section-card">
                                    <div className="section-card__header">
                                        <h3 className="section-card__title">Site Analysis & Costing</h3>
                                    </div>
                                    <div className="section-card__body">
                                        <SiteReport {...reportData} />
                                    </div>
                                </div>
                            )}

                            <div className="section-card">
                                <div className="section-card__header">
                                    <h3 className="section-card__title">Export & Share</h3>
                                </div>
                                <div className="section-card__body">
                                    <ExportPanel data={data} floor={floor} />
                                </div>
                            </div>

                            <button className="btn-secondary dashboard-sidebar__cta" onClick={() => setStep(1)}>
                                Start New Project
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="dashboard-main">
                        {/* 3D View */}
                        <div className="glass-panel dashboard-card dashboard-card--media">
                            <div className="dashboard-card__header">
                                <h3 className="dashboard-card__title">3D Walkthrough & Model</h3>
                                <div className="segmented dashboard-toggle" role="group" aria-label="3D view mode">
                                    <button
                                        type="button"
                                        className="segmented__btn"
                                        aria-pressed={viewMode === 'floorplan'}
                                        onClick={() => setViewMode('floorplan')}
                                    >
                                        Interior
                                    </button>
                                    <button
                                        type="button"
                                        className="segmented__btn"
                                        aria-pressed={viewMode === 'exterior'}
                                        onClick={() => setViewMode('exterior')}
                                    >
                                        Exterior
                                    </button>
                                </div>
                            </div>
                            <div className="dashboard-card__media">
                            <FloorPlan3D 
                                rooms={data.rooms} 
                                stairs={data.stairs} 
                                extras={data.extras} 
                                columns={data.columns}
                                plotWidth={data.width} 
                                plotDepth={data.depth}
                                viewMode={viewMode}
                            /> 
                            </div>
                        </div>

                        {/* 2D View */}
                        <div className="glass-panel dashboard-card">
                            <div className="dashboard-card__header">
                                <h3 className="dashboard-card__title">2D Blueprint</h3>
                                <div className="dashboard-card__meta">Floor {floor + 1}</div>
                            </div>
                            <div 
                                className="dashboard-card__body"
                                style={{ display: "flex", gap: 16, alignItems: "stretch" }}
                                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const payloadRaw = e.dataTransfer.getData("application/json");
                                    if (!payloadRaw) return;
                                    let payload;
                                    try { payload = JSON.parse(payloadRaw); } catch { return; }
                                    const svg = document.getElementById(`floor-plan-svg-${floor}`);
                                    if (!svg) return;
                                    const rect = svg.getBoundingClientRect();
                                    const scale = 10;
                                    const padding = 20;
                                    const x = Math.max(0, (e.clientX - rect.left - padding) / scale);
                                    const y = Math.max(0, (e.clientY - rect.top - padding) / scale);
                                    const w = payload.w || 10;
                                    const h = payload.h || 10;
                                    const type = payload.type || "room";
                                    const newRoom = { type, x, y, w, h, floor };
                                    setData(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
                                }}
                            >
                                <div style={{ flex: "1 1 auto" }}>
                                    <FloorPlan2D 
                                        rooms={data.rooms} 
                                        stairs={data.stairs} 
                                        extras={data.extras} 
                                        columns={data.columns}
                                        floor={floor} 
                                        plotWidth={data.width} 
                                        plotDepth={data.depth} 
                                        onUpdateRoom={(index, changes) => {
                                            setData(prev => ({
                                                ...prev,
                                                rooms: prev.rooms.map((r, i) => i === index ? { ...r, ...changes } : r)
                                            }));
                                        }}
                                    /> 
                                </div>
                                <RoomsPalette />
                            </div>
                        </div>
                    </section>
                 </motion.div>
            )}

        </AnimatePresence>
      </main>

      <footer style={{
          textAlign: 'center',
          padding: '20px',
          marginTop: '40px',
          color: 'var(--text-light)',
          fontSize: '0.9rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)'
      }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Powered by Bharat Construction</p>
          <p style={{ margin: '5px 0' }}>© 2026 doonITes Webbed Services</p>
          <p style={{ margin: '5px 0' }}>📞 +91-9258622022</p>
      </footer>
    </div> 
  ); 
} 
