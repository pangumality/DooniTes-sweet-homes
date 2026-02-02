import { useState } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, MapPin, Home, Layers, Zap, LayoutDashboard } from "lucide-react";

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

export default function App() { 
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Unified Form State
  const [formData, setFormData] = useState({
      width: 40,
      depth: 60,
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

  return ( 
    <div className="app-container">
      {/* Header */}
      <header style={{ 
          background: 'rgba(30, 27, 46, 0.8)', 
          backdropFilter: 'blur(10px)', 
          padding: '20px', 
          position: 'sticky', 
          top: 0, 
          zIndex: 100,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '8px', borderRadius: '8px', color: 'white'}}>
                <Zap size={24} />
            </div>
            <h1 style={{margin: 0, fontSize: '1.5rem', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 20px rgba(217, 70, 239, 0.5)'}}>
                doonITes – Sweet Home
            </h1>
        </div>
        {step < 6 && (
            <div style={{display: 'flex', gap: '10px'}}>
                {steps.map(s => (
                    <div key={s.id} style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        color: step >= s.id ? '#6366f1' : '#cbd5e1',
                        fontWeight: step === s.id ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                    }}>
                        <div style={{
                            width: '24px', height: '24px', 
                            borderRadius: '50%', 
                            background: step >= s.id ? '#6366f1' : '#e2e8f0',
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem'
                        }}>
                            {step > s.id ? <Check size={14} /> : s.id}
                        </div>
                        <span style={{display: window.innerWidth < 600 ? 'none' : 'block'}}>{s.title}</span>
                    </div>
                ))}
            </div>
        )}
      </header>

      <main style={{padding: '40px 20px', maxWidth: '1200px', margin: '0 auto'}}>
        <AnimatePresence mode="wait">
            
            {/* Step 1: Location */}
            {step === 1 && (
                <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-panel wizard-step"
                >
                    <h2>Where are we building?</h2>
                    <p className="text-light">Select the site location to analyze soil and seismic risks.</p>
                    
                    <div style={{margin: '20px 0'}}>
                        <SiteLocation setLocation={setSiteLocation} location={siteLocation} />
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
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
                >
                    <h2>Plot & Structure</h2>
                    <p className="text-light">Define the physical constraints of your project.</p>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0'}}>
                        <div>
                            <label>Plot Width (ft)</label>
                            <input className="input-field" type="number" value={formData.width} onChange={e => updateField('width', Number(e.target.value))} />
                        </div>
                        <div>
                            <label>Plot Depth (ft)</label>
                            <input className="input-field" type="number" value={formData.depth} onChange={e => updateField('depth', Number(e.target.value))} />
                        </div>
                        <div>
                            <label>Number of Floors</label>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <input 
                                    type="range" min="1" max="10" 
                                    value={formData.floors} 
                                    onChange={e => updateField('floors', Number(e.target.value))}
                                    style={{flex: 1}}
                                />
                                <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', width: '30px'}}>{formData.floors}</span>
                            </div>
                        </div>
                        <div>
                            <label>Entrance Facing</label>
                            <div style={{display: 'flex', gap: '10px'}}>
                                {['North', 'South', 'East', 'West'].map(dir => (
                                    <button 
                                        key={dir}
                                        type="button"
                                        onClick={() => updateField('facing', dir)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: formData.facing === dir ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            background: formData.facing === dir ? 'rgba(217, 70, 239, 0.1)' : 'rgba(255,255,255,0.05)',
                                            color: formData.facing === dir ? 'var(--primary)' : 'var(--text)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {dir}
                                    </button>
                                ))}
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
                >
                    <h2>Room Configuration</h2>
                    <p className="text-light">Configure the internal layout requirements.</p>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px 0'}}>
                        {/* Bedrooms */}
                        <div className="glass-panel" style={{padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                <label>Bedrooms per Floor</label>
                                <span style={{fontWeight: 'bold', color: 'var(--primary)'}}>{formData.bedrooms}</span>
                            </div>
                            <input 
                                type="range" min="1" max="5" 
                                value={formData.bedrooms} 
                                onChange={e => updateField('bedrooms', Number(e.target.value))}
                                style={{width: '100%'}}
                            />
                            
                            <div style={{marginTop: '15px'}}>
                                <label>Master Bedroom Size</label>
                                <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                                    {['Standard', 'Big', 'Small'].map(size => (
                                        <button 
                                            key={size}
                                            onClick={() => updateField('masterBedroomSize', size)}
                                            className={formData.masterBedroomSize === size ? 'btn-primary' : 'btn-secondary'}
                                            style={{flex: 1, padding: '8px', fontSize: '0.9rem'}}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bathrooms */}
                        <div className="glass-panel" style={{padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                <label>Bathrooms per Floor</label>
                                <span style={{fontWeight: 'bold', color: 'var(--primary)'}}>{formData.bathrooms}</span>
                            </div>
                            <input 
                                type="range" min="1" max="4" 
                                value={formData.bathrooms} 
                                onChange={e => updateField('bathrooms', Number(e.target.value))}
                                style={{width: '100%'}}
                            />

                            <div style={{marginTop: '15px'}}>
                                <label>Bathroom Size</label>
                                <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                                    {['Standard', 'Big', 'Small'].map(size => (
                                        <button 
                                            key={size}
                                            onClick={() => updateField('bathroomSize', size)}
                                            className={formData.bathroomSize === size ? 'btn-primary' : 'btn-secondary'}
                                            style={{flex: 1, padding: '8px', fontSize: '0.9rem'}}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Kitchens */}
                        <div>
                            <label>Kitchens</label>
                            <input className="input-field" type="number" min="1" max="2" value={formData.kitchens} onChange={e => updateField('kitchens', Number(e.target.value))} />
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
                >
                    <h2>Extras & Finishes</h2>
                    <p className="text-light">Select additional features and construction quality.</p>

                    <div style={{margin: '20px 0'}}>
                        <label style={{marginBottom: '15px', display: 'block'}}>Additional Zones</label>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                            {Object.keys(formData.features).filter(k => k !== 'garage').map(feature => (
                                <div 
                                    key={feature}
                                    onClick={() => updateFeature(feature, !formData.features[feature])}
                                    style={{
                                        padding: '15px',
                                        borderRadius: '8px',
                                        border: formData.features[feature] ? '2px solid var(--success)' : '1px solid var(--border)',
                                        background: formData.features[feature] ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '20px', height: '20px', 
                                        borderRadius: '4px', 
                                        border: '1px solid var(--border)',
                                        background: formData.features[feature] ? 'var(--success)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        {formData.features[feature] && <Check size={14} />}
                                    </div>
                                    <span style={{textTransform: 'capitalize'}}>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{marginTop: '30px'}}>
                            <label style={{marginBottom: '15px', display: 'block'}}>Construction Quality Tier</label>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                                {['Super', 'Semi-Luxury', 'Luxury'].map(tier => (
                                    <div 
                                        key={tier}
                                        onClick={() => updateField('quality', tier)}
                                        style={{
                                            padding: '15px',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            border: formData.quality === tier ? '2px solid var(--accent)' : '1px solid var(--border)',
                                            background: formData.quality === tier ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {formData.quality === tier && (
                                            <div style={{position: 'absolute', top: 0, right: 0, background: 'var(--accent)', color: 'white', padding: '2px 6px', fontSize: '0.6rem', borderBottomLeftRadius: '6px'}}>
                                                SELECTED
                                            </div>
                                        )}
                                        <div style={{fontWeight: 'bold', color: formData.quality === tier ? 'var(--accent)' : 'var(--text)'}}>{tier}</div>
                                        <div style={{fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '5px'}}>
                                            {tier === 'Super' ? 'Standard Finishes' : tier === 'Semi-Luxury' ? 'Premium Finishes' : 'High-End Imports'}
                                        </div>
                                    </div>
                                ))}
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
                    style={{textAlign: 'center'}}
                >
                    <div style={{marginBottom: '30px'}}>
                        <div style={{width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white'}}>
                            <Zap size={40} />
                        </div>
                        <h2>Ready to Build?</h2>
                        <p className="text-light">We have all the data needed to generate your architectural plan.</p>
                    </div>

                    <div style={{background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '30px'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.9rem'}}>
                            <div><strong>Site:</strong> {siteLocation.lat.toFixed(2)}, {siteLocation.lng.toFixed(2)}</div>
                            <div><strong>Plot:</strong> {formData.width}' x {formData.depth}'</div>
                            <div><strong>Structure:</strong> {formData.floors} Floors</div>
                            <div><strong>Facing:</strong> {formData.facing}</div>
                            <div><strong>Config:</strong> {formData.bedrooms}BHK x {formData.floors}</div>
                            <div><strong>Quality:</strong> {formData.quality}</div>
                        </div>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                        <button className="btn-secondary" onClick={prevStep}>Back</button>
                        <button className="btn-primary" onClick={handleGenerate} style={{padding: '12px 30px', fontSize: '1.1rem'}}>
                            {loading ? 'Generating...' : 'Generate Blueprints'}
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
                    style={{display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px'}}
                 >
                    {/* Sidebar */}
                    <div className="glass-panel" style={{padding: '20px', height: 'fit-content'}}>
                        <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <LayoutDashboard size={20} color="var(--primary)" /> Project Dashboard
                        </h3>
                        
                        <div style={{margin: '20px 0'}}>
                            <label>View Floor</label>
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

                        {reportData && <SiteReport {...reportData} />}

                        <div style={{marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px'}}>
                            <ExportPanel data={data} floor={floor} />
                        </div>

                        <button 
                            className="btn-secondary" 
                            style={{marginTop: '20px', width: '100%'}}
                            onClick={() => setStep(1)}
                        >
                            Start New Project
                        </button>
                    </div>

                    {/* Main Content */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                        {/* 3D View */}
                        <div className="glass-panel" style={{padding: 0, height: '500px', position: 'relative', overflow: 'hidden'}}>
                            <div style={{position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '10px'}}>
                                <div style={{background: 'rgba(255,255,255,0.8)', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', color: '#000'}}>
                                    3D Walkthrough
                                </div>
                                <button 
                                    onClick={() => setViewMode(viewMode === 'floorplan' ? 'exterior' : 'floorplan')}
                                    style={{
                                        background: viewMode === 'exterior' ? 'var(--primary)' : 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 15px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {viewMode === 'floorplan' ? 'Switch to Exterior View' : 'Switch to Floor Plan'}
                                </button>
                            </div>
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

                        {/* 2D View */}
                        <div className="glass-panel" style={{padding: '20px'}}>
                            <h3>2D Blueprint - Floor {floor + 1}</h3>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <FloorPlan2D 
                                    rooms={data.rooms} 
                                    stairs={data.stairs} 
                                    extras={data.extras} 
                                    columns={data.columns}
                                    floor={floor} 
                                    plotWidth={data.width} 
                                    plotDepth={data.depth} 
                                /> 
                            </div>
                        </div>
                    </div>
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
          background: 'rgba(30, 27, 46, 0.5)'
      }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Powered by Bharat Construction</p>
          <p style={{ margin: '5px 0' }}>© 2026 doonITes Webbed Services</p>
          <p style={{ margin: '5px 0' }}>📞 +91-9258622022</p>
      </footer>
    </div> 
  ); 
} 
