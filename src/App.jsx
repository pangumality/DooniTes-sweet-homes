import { useEffect, useState } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, MapPin, Home, Layers, Zap, LayoutDashboard, Briefcase, Car, Leaf, Building, FileText, Image, Ruler, ClipboardList, ShieldCheck, MessageCircle, ArrowRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import FloorPlan3D from "./FloorPlan3D"; 
import FloorPlan2D from "./FloorPlan2D"; 
import AIRender from "./AIRender";
import { generatePlanVariants } from "./generatePlan"; 
import { generateColumns } from "./structure/columns"; 

import ExportPanel from "./ExportPanel";
import SiteLocation from "./components/SiteLocation";
import SiteReport from "./components/SiteReport";
import RoomsPalette from "./components/RoomsPalette";
import { analyzeSoil } from "./analysis/soil";
import { getEarthquakeZone, earthquakeRecommendations } from "./analysis/earthquake";
import { estimateCost } from "./estimation/cost";
import { generateHouseImage, analyzeImageAndGeneratePrompt } from "./services/openai";
import html2canvas from "html2canvas";
import "./styles/layout.css";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "services", label: "Services" },
  { id: "features", label: "Features" },
  { id: "gallery", label: "Gallery" }
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80";
const ABOUT_IMAGE = "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80";
const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80"
];

const SERVICES = [
  { title: "AI Floor Planning", copy: "Generate optimized layouts with instant zoning and lighting insights.", icon: LayoutDashboard },
  { title: "3D Exterior Modeling", copy: "Preview realistic facades and walkthrough-ready visualizations.", icon: Home },
  { title: "Site Intelligence", copy: "Soil, seismic, and climate-aware recommendations in one report.", icon: ShieldCheck }
];

const FEATURES = [
  { title: "Smart Space Allocation", copy: "Balance room sizes with automatic circulation optimization." },
  { title: "Collaborative Review", copy: "Share versions, annotate, and export deliverables instantly." },
  { title: "Compliance Ready", copy: "Built-in checks for zoning constraints and safety guidelines." },
  { title: "Export Anywhere", copy: "Deliver DXF, PDF, and presentation-ready assets." }
];

const useMediaQuery = (query) => {
  const getMatches = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);
    handleChange();

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [query]);

  return matches;
};

const getRoute = () => {
  const hash = window.location.hash.replace("#", "").trim();
  return hash || "home";
};

const HeroSection = () => (
  <section className="landing-hero">
    <div className="landing-hero__content">
      <span className="pill">AI-Powered Architecture</span>
      <h1>Design the Future of Living with AI</h1>
      <p>Automate your architectural designs and floor plans with our advanced AI platform. Generate stunning, professional models in minutes.</p>
      <div className="landing-hero__actions">
        <a className="btn-primary" href="#planner">Start Generating</a>
        <a className="btn-outline" href="#features">Explore Features</a>
      </div>
      <div className="landing-hero__stats">
        <div>
          <strong>14K+</strong>
          <span>Concepts generated</span>
        </div>
        <div>
          <strong>92%</strong>
          <span>Client approval rate</span>
        </div>
        <div>
          <strong>36 hrs</strong>
          <span>Average time saved</span>
        </div>
      </div>
    </div>
    <div className="landing-hero__media">
      <div className="hero-card">
        <img src={HERO_IMAGE} alt="Modern smart home" />
      </div>
      <div className="hero-badge">
        <span className="hero-badge__title">Real-time iterations</span>
        <span className="hero-badge__copy">Instantly compare layout options</span>
      </div>
    </div>
  </section>
);

const HomePage = () => (
  <main className="landing-main">
    <HeroSection />
    <section className="landing-section" id="about">
      <div className="section-header">
        <div>
          <p className="section-kicker">About Us</p>
          <h2>Design intelligence crafted for modern builders</h2>
        </div>
        <a className="text-link" href="#about">Learn more <ArrowRight size={16} /></a>
      </div>
      <div className="about-grid">
        <div className="about-card">
          <img src={ABOUT_IMAGE} alt="Architect working" />
        </div>
        <div className="about-content">
          <p>Sweet Home blends AI planning, code-aware optimization, and collaborative workflows to help teams move from idea to approval with confidence.</p>
          <ul className="checklist">
            <li><Check size={16} />Scenario-based layout generation</li>
            <li><Check size={16} />Climate and site-aware recommendations</li>
            <li><Check size={16} />Studio-grade exports ready for client delivery</li>
          </ul>
        </div>
      </div>
    </section>
    <section className="landing-section" id="services">
      <div className="section-header">
        <div>
          <p className="section-kicker">Services</p>
          <h2>Everything you need to launch a premium concept</h2>
        </div>
      </div>
      <div className="card-grid">
        {SERVICES.map(({ title, copy, icon: Icon }) => (
          <div className="info-card" key={title}>
            <div className="info-card__icon"><Icon size={20} /></div>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="landing-section" id="features">
      <div className="section-header">
        <div>
          <p className="section-kicker">Features</p>
          <h2>Precision tools for every stage of planning</h2>
        </div>
      </div>
      <div className="feature-grid">
        {FEATURES.map(({ title, copy }) => (
          <div className="feature-card" key={title}>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="landing-section" id="gallery">
      <div className="section-header">
        <div>
          <p className="section-kicker">Gallery</p>
          <h2>Concepts produced with Sweet Home AI</h2>
        </div>
      </div>
      <div className="gallery-grid">
        {GALLERY_IMAGES.map((src, index) => (
          <div className="gallery-card" key={src}>
            <img src={src} alt={`Concept ${index + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  </main>
);

const PageShell = ({ title, subtitle, image, children }) => (
  <main className="landing-main">
    <section className="page-hero">
      <div>
        <p className="section-kicker">Sweet Home</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="page-hero__actions">
          <a className="btn-primary" href="#planner">Launch Builder</a>
          <a className="btn-outline" href="#home">Back to Home</a>
        </div>
      </div>
      <div className="page-hero__media">
        <img src={image} alt={title} />
      </div>
    </section>
    {children}
  </main>
);

const AboutPage = () => (
  <PageShell
    title="Design-led innovation for every project"
    subtitle="We help teams generate accurate, beautiful floor plans while staying ahead of compliance and client expectations."
    image={ABOUT_IMAGE}
  >
    <section className="landing-section">
      <div className="card-grid">
        <div className="info-card">
          <h3>Our mission</h3>
          <p>Accelerate sustainable, client-ready architecture with data-driven layouts and AI-assisted collaboration.</p>
        </div>
        <div className="info-card">
          <h3>Our promise</h3>
          <p>Beautiful outputs, fast iterations, and quality checks built into every step of the workflow.</p>
        </div>
        <div className="info-card">
          <h3>Our team</h3>
          <p>Designers, engineers, and planners working together to deliver outstanding living spaces.</p>
        </div>
      </div>
    </section>
  </PageShell>
);

const ServicesPage = () => (
  <PageShell
    title="Services that unlock productivity"
    subtitle="From rapid concepting to full client deliverables, Sweet Home keeps your team aligned."
    image={HERO_IMAGE}
  >
    <section className="landing-section">
      <div className="card-grid">
        {SERVICES.map(({ title, copy, icon: Icon }) => (
          <div className="info-card" key={title}>
            <div className="info-card__icon"><Icon size={20} /></div>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        ))}
      </div>
    </section>
  </PageShell>
);

const FeaturesPage = () => (
  <PageShell
    title="Features built for modern studios"
    subtitle="Everything you need to create, validate, and deliver architectural plans faster."
    image="https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80"
  >
    <section className="landing-section">
      <div className="feature-grid">
        {FEATURES.map(({ title, copy }) => (
          <div className="feature-card" key={title}>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        ))}
      </div>
    </section>
  </PageShell>
);


const GalleryPage = () => (
  <PageShell
    title="Showcase-ready renders and layouts"
    subtitle="Browse recently generated plans and visualization concepts."
    image="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80"
  >
    <section className="landing-section">
      <div className="gallery-grid">
        {GALLERY_IMAGES.map((src, index) => (
          <div className="gallery-card" key={src}>
            <img src={src} alt={`Gallery ${index + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  </PageShell>
);

const AuthPage = ({ title, subtitle, actionLabel }) => {
  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, validate credentials here.
    // For now, simply redirect to the planner.
    window.location.hash = "#planner";
  };

  return (
    <PageShell
      title={title}
      subtitle={subtitle}
      image="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    >
      <section className="landing-section">
        <div className="auth-card">
          <h3>{title}</h3>
          <p>{subtitle}</p>
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Email address
              <input className="input-field" type="email" placeholder="you@studio.com" required />
            </label>
            <label>
              Password
              <input className="input-field" type="password" placeholder="••••••••" required />
            </label>
            {actionLabel === "Create account" && (
              <label>
                Organization name
                <input className="input-field" type="text" placeholder="Studio name" />
              </label>
            )}
            <button className="btn-primary" type="submit">{actionLabel}</button>
          </form>
        </div>
      </section>
    </PageShell>
  );
};

const SiteHeader = ({ activeRoute }) => (
  <header className="landing-header">
    <div className="landing-header__inner">
      <div className="app-brand">
        <div className="app-brand__mark" aria-hidden="true">
          <Zap size={18} />
        </div>
        <div className="app-brand__text">
          <div className="app-brand__name">doonITes</div>
          <div className="app-brand__sub">Sweet Home</div>
        </div>
      </div>
      <nav className="landing-nav">
        {NAV_ITEMS.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`landing-nav__link ${activeRoute === item.id ? "is-active" : ""}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="landing-header__actions">
        <a className="text-link" href="#signin">Sign In</a>
        <a className="btn-primary" href="#signup">Sign Up</a>
      </div>
    </div>
  </header>
);

export default function App() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (route === "planner") {
    return <PlannerApp />;
  }

  let pageContent = null;
  switch (route) {
    case "about":
      pageContent = <AboutPage />;
      break;
    case "services":
      pageContent = <ServicesPage />;
      break;
    case "features":
      pageContent = <FeaturesPage />;
      break;
    case "gallery":
      pageContent = <GalleryPage />;
      break;
    case "signin":
      pageContent = <AuthPage title="Welcome back" subtitle="Sign in to continue your latest project." actionLabel="Sign in" />;
      break;
    case "signup":
      pageContent = <AuthPage title="Create your account" subtitle="Get started with Sweet Home AI in minutes." actionLabel="Create account" />;
      break;
    default:
      pageContent = <HomePage />;
  }

  return (
    <div className="landing-shell">
      <SiteHeader activeRoute={route === "home" ? "home" : route} />
      {pageContent}
      <footer className="landing-footer">
        <div>
          <strong>Powered by Bharat Construction</strong>
          <span>© 2026 doonITes Webbed Services</span>
        </div>
        <div>
          <span>📞 +91-9258622022</span>
          <span>hello@doonites.com</span>
        </div>
      </footer>
      <button className="chatbot-fab" type="button" aria-label="Open chatbot">
        <MessageCircle size={20} />
      </button>
    </div>
  );
}

function PlannerApp() { 
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Unified Form State
  const [formData, setFormData] = useState({
      width: 40,
      depth: 60,
      floors: 2,
      facing: "South",
      masterBedrooms: 1,
      kidsBedrooms: 2,
      guestRooms: 1,
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
  const [animationMode, setAnimationMode] = useState('none'); // 'none' | 'orbit' | 'walkthrough'
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [fullScreen, setFullScreen] = useState(false);

  // AI Generation State
  const [generatedImages, setGeneratedImages] = useState({ exterior: null, interior: null });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiMode, setAiMode] = useState('exterior'); // 'exterior' | 'interior'
  const [dashboardMode, setDashboardMode] = useState('model'); // 'model' | 'ai'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [debugImage, setDebugImage] = useState(null);
  const [roomsPanelOpen, setRoomsPanelOpen] = useState(true);
  const [dataVariants, setDataVariants] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const isWide = useMediaQuery("(min-width: 1200px)");
  const isMedium = useMediaQuery("(min-width: 768px)");
  const gridClass = isWide ? "grid-12" : isMedium ? "grid-8" : "grid-4";

  const updateField = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFeature = (feature, value) => {
      setFormData(prev => ({
          ...prev,
          features: { ...prev.features, [feature]: value }
      }));
  };

  const handleGenerateAI = async () => {
    setIsGeneratingImage(true);
    setAiError(null);
    try {
      let prompt = "";
      
      const featuresList = Object.keys(formData.features)
          .filter(k => formData.features[k])
          .map(k => k.charAt(0).toUpperCase() + k.slice(1)) // Capitalize
          .join(", ");

      if (aiMode === 'exterior') {
        const qualityDesc = {
            'Super': 'high-quality standard modern finishes',
            'Semi-Luxury': 'premium materials with elegant textures',
            'Luxury': 'ultra-luxury high-end materials, extensive glass, and stone cladding'
        }[formData.quality] || 'modern standard finishes';

        // Analyze Model Data for Exterior
        const groundFloorRooms = data.rooms.filter(r => r.floor === 0).map(r => r.type);
        const upperFloorRooms = data.rooms.filter(r => r.floor > 0).map(r => r.type);
        
        const uniqueGroundRooms = [...new Set(groundFloorRooms)].join(", ");
        const uniqueUpperRooms = [...new Set(upperFloorRooms)].join(", ");

        const exteriorFeatures = data.extras.map(e => e.type).join(", ");
        
        // Determine visible layout features
        const hasBalcony = data.rooms.some(r => r.type.toLowerCase().includes('balcony'));
        const hasPorch = data.rooms.some(r => r.type.toLowerCase().includes('porch') || r.type.toLowerCase().includes('veranda'));
        const hasGarage = data.rooms.some(r => r.type.toLowerCase().includes('garage') || r.type.toLowerCase().includes('parking'));

        // Fix: Explicit floor count handling
        const floorDesc = formData.floors === 1 
            ? "SINGLE-STORY (1 Floor ONLY, NO upper levels, Bungalow style)" 
            : `${formData.floors}-story`;

        prompt = `A photorealistic architectural rendering of a ${floorDesc} modern house. 
        STRICTLY FOLLOW THE GENERATED MODEL LAYOUT:
        
        1. STRUCTURE & MASSING:
        - TOTAL FLOORS: Exactly ${formData.floors}. (Ground + ${formData.floors - 1} Upper).
        - Ground Floor contains: ${uniqueGroundRooms || 'Open plan living area'}.
        - Upper Floors: ${formData.floors === 1 ? 'NONE (Single Story Only)' : `contain ${uniqueUpperRooms || 'Bedrooms'}`}.
        - ${hasBalcony ? 'MUST show prominent Balconies on upper levels.' : ''}
        - ${hasPorch ? 'Include a welcoming Entrance Porch/Veranda.' : ''}
        - ${hasGarage ? 'Show a Garage or Parking area integrated into the facade.' : ''}
        
        2. ORIENTATION & SETTING:
        - Front facade MUST face ${formData.facing}.
        - Plot Size: ${formData.width}ft width x ${formData.depth}ft depth.
        - Visible Model Extras: ${exteriorFeatures}.
        - Amenities: ${featuresList} (Must be clearly visible if exterior-facing like Garden/Parking/Balcony).
        
        3. STYLE & ATMOSPHERE:
        - Construction Quality: ${qualityDesc}.
        - Design Style: Modern, clean lines, elegant aesthetic.
        - Environment: Realistic daylight, clear sky, professional architectural photography style.
        - View: Eye-level perspective showing the main entrance and facade.
        - IMPORTANT: DO NOT add any text, labels, dimensions, or annotations to the image. It must be a clean photorealistic rendering.
        
        High resolution, 8k.`;
      } else {
        // Interior / Floor Plan Prompt - VISUAL CAPTURE PIPELINE

        // 1. Capture the hidden FloorPlan2D (Snapshot of the actual layout)
        const element = document.getElementById("floorplan-capture-target");
        if (!element) {
             throw new Error("Floor plan capture target not found. Please regenerate the plan.");
        }
        
        // Brief delay to ensure rendering
        await new Promise(resolve => setTimeout(resolve, 200));

        // Capture high-quality screenshot
        const canvas = await html2canvas(element, { 
            scale: 1, 
            useCORS: true, 
            logging: false,
            backgroundColor: "#ffffff",
            width: 1024,
            height: 1024
        });
        const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);
        setDebugImage(imageBase64);

        // Auto-download the captured input image
        const link = document.createElement('a');
        link.href = imageBase64;
        link.download = `floorplan-ai-input-floor-${floor + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 2. Prepare Context for Vision Model
        const floorLabel = `Floor ${floor + 1} of ${formData.floors}`;
        const aspectRatio = formData.depth > formData.width ? "Long and Narrow" : formData.width > formData.depth ? "Wide" : "Square";

        const visionContext = `
        - Project: ${formData.floors}-story modern house.
        - Current View: ${floorLabel}.
        - Plot Size: ${formData.width}' x ${formData.depth}' (${aspectRatio}).
        - Entrance Facing: ${formData.facing}.
        - Amenities to include: ${featuresList}.
        - Quality Level: ${formData.quality}.
        - Style: Modern, clean lines, brochure quality.
        - Requirement: Create a professional marketing floor plan that matches this layout EXACTLY.
        `;

        // 3. Analyze with GPT-4o Vision to get a precise prompt
        // This effectively "feeds" the image layout to the generation process
        const visionPrompt = await analyzeImageAndGeneratePrompt(imageBase64, visionContext);
        
        // 4. Use the Vision-generated prompt for DALL-E 3
        prompt = visionPrompt;
      }

      console.log(`Generating AI Render (${aiMode}) Prompt:`, prompt);
      const imageUrl = await generateHouseImage(prompt);
      setGeneratedImages(prev => ({ ...prev, [aiMode]: imageUrl }));
    } catch (error) {
      setAiError(error.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRoomUpdate = (index, newProps) => {
    if (dataVariants && dataVariants.length) {
      setDataVariants(prev => {
        const arr = [...prev];
        const cur = { ...arr[selectedVariant] };
        const newRooms = [...cur.rooms];
        newRooms[index] = { ...newRooms[index], ...newProps };
        arr[selectedVariant] = { ...cur, rooms: newRooms };
        return arr;
      });
    } else {
      setData(prev => {
          const newRooms = [...prev.rooms];
          newRooms[index] = { ...newRooms[index], ...newProps };
          return { ...prev, rooms: newRooms };
      });
    }
    setLastUpdated(Date.now());
  };

  const handleGenerate = async () => {
      setLoading(true);
      
      // Simulate processing time for animation
      // await new Promise(resolve => setTimeout(resolve, 1500));
      
      let kaegroSoil = null;
      if (siteLocation) {
        try {
            const res = await fetch(`/api/kaegro/farms/api/soil?lat=${siteLocation.lat}&lon=${siteLocation.lng}`);
            const contentType = res.headers.get("content-type");
            if(res.ok && contentType && contentType.includes("application/json")) {
                kaegroSoil = await res.json();
            } else {
                console.warn("Kaegro API Response Warning:", res.status, res.statusText, "Content-Type:", contentType);
                if (contentType && contentType.includes("text/html")) {
                    console.error("Received HTML instead of JSON. Please restart the dev server (npm run dev) to apply proxy settings.");
                }
            }
        } catch(err) {
            console.error("Kaegro API Error:", err);
        }
      }

      const variants = generatePlanVariants(formData);
      const withColumns = variants.map(v => ({
        ...v,
        columns: generateColumns({ 
          rooms: v.rooms, 
          floors: formData.floors, 
          floorHeight: 10, 
          spacing: 15, 
          columnSize: 1 
        }),
        width: formData.width,
        depth: formData.depth
      }));

      setData(withColumns[0]);
      setDataVariants(withColumns);
      setSelectedVariant(0);
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
              kaegroSoil,
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

      <main className={`app-main ${step === 6 ? "fullWidth" : ""}`}>
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

                        {/* Master Bedrooms */}
                        <div className="room-row">
                            <div className="room-type room-cell" data-label="Room Type">
                                <div className="room-type__name">Master Bedrooms</div>
                                <div className="room-type__hint">With attached bath</div>
                            </div>
                            <div className="room-cell" data-label="Quantity">
                                <div className="stepper">
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('masterBedrooms', clampNumber(formData.masterBedrooms - 1, 1, 3))}
                                        disabled={formData.masterBedrooms <= 1}
                                        aria-label="Decrease master bedrooms"
                                    >
                                        −
                                    </button>
                                    <input
                                        className="input-field stepper__input"
                                        type="number"
                                        min="1"
                                        max="3"
                                        value={formData.masterBedrooms}
                                        onChange={e => updateField('masterBedrooms', clampNumber(Number(e.target.value), 1, 3))}
                                        aria-label="Master Bedrooms"
                                    />
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('masterBedrooms', clampNumber(formData.masterBedrooms + 1, 1, 3))}
                                        disabled={formData.masterBedrooms >= 3}
                                        aria-label="Increase master bedrooms"
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

                        {/* Kids Bedrooms */}
                        <div className="room-row">
                            <div className="room-type room-cell" data-label="Room Type">
                                <div className="room-type__name">Kids Bedrooms</div>
                                <div className="room-type__hint">Per floor</div>
                            </div>
                            <div className="room-cell" data-label="Quantity">
                                <div className="stepper">
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('kidsBedrooms', clampNumber(formData.kidsBedrooms - 1, 0, 4))}
                                        disabled={formData.kidsBedrooms <= 0}
                                        aria-label="Decrease kids bedrooms"
                                    >
                                        −
                                    </button>
                                    <input
                                        className="input-field stepper__input"
                                        type="number"
                                        min="0"
                                        max="4"
                                        value={formData.kidsBedrooms}
                                        onChange={e => updateField('kidsBedrooms', clampNumber(Number(e.target.value), 0, 4))}
                                        aria-label="Kids Bedrooms"
                                    />
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('kidsBedrooms', clampNumber(formData.kidsBedrooms + 1, 0, 4))}
                                        disabled={formData.kidsBedrooms >= 4}
                                        aria-label="Increase kids bedrooms"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="room-cell" data-label="Size Selection">
                                <span className="text-light text-sm">Standard</span>
                            </div>
                        </div>

                        {/* Guest Rooms */}
                        <div className="room-row">
                            <div className="room-type room-cell" data-label="Room Type">
                                <div className="room-type__name">Guest Rooms</div>
                                <div className="room-type__hint">Per floor</div>
                            </div>
                            <div className="room-cell" data-label="Quantity">
                                <div className="stepper">
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('guestRooms', clampNumber(formData.guestRooms - 1, 0, 3))}
                                        disabled={formData.guestRooms <= 0}
                                        aria-label="Decrease guest rooms"
                                    >
                                        −
                                    </button>
                                    <input
                                        className="input-field stepper__input"
                                        type="number"
                                        min="0"
                                        max="3"
                                        value={formData.guestRooms}
                                        onChange={e => updateField('guestRooms', clampNumber(Number(e.target.value), 0, 3))}
                                        aria-label="Guest Rooms"
                                    />
                                    <button
                                        type="button"
                                        className="stepper__btn"
                                        onClick={() => updateField('guestRooms', clampNumber(formData.guestRooms + 1, 0, 3))}
                                        disabled={formData.guestRooms >= 3}
                                        aria-label="Increase guest rooms"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="room-cell" data-label="Size Selection">
                                <span className="text-light text-sm">Standard</span>
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
                    className={`dashboard-container fullWidth layoutGrid ${gridClass} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
                 >
                    {!fullScreen && (
                      <div className="dashboard-topbar section">
                        <div>
                          <h2 className="sectionTitle">Project Workspace</h2>
                          <p className="sectionSubtitle text-light">Review, refine, and export your plan.</p>
                        </div>
                        <div className="topbarActions">
                          <button className="btn-primary" onClick={() => setFullScreen(true)}>Full Screen</button>
                          <a className="btn-secondary" href="#export-panel">Export</a>
                          <button className="btn-secondary" onClick={() => setStep(1)}>Start New Project</button>
                        </div>
                      </div>
                    )}
                    {fullScreen && (
                      <div className="fullScreenOverlay fullWidth">
                        <div className="fullScreenHeader section">
                          <div>
                            <h2 className="sectionTitle">Workspace</h2>
                            <p className="sectionSubtitle text-light">Full screen</p>
                          </div>
                          <div className="segmented dashboard-toggle segmented--singleRow" role="group" aria-label="Dashboard mode">
                                <button
                                    type="button"
                                    className="segmented__btn"
                                    aria-pressed={dashboardMode === 'model'}
                                    onClick={() => setDashboardMode('model')}
                                >
                                    Model View
                                </button>
                                <button
                                    type="button"
                                    className="segmented__btn"
                                    aria-pressed={dashboardMode === 'ai'}
                                    onClick={() => setDashboardMode('ai')}
                                >
                                    AI Render
                                </button>
                          </div>

                          <button className="btn-secondary" onClick={() => setFullScreen(false)}>Exit Full Screen</button>
                        </div>

                        {dashboardMode === 'ai' ? (
                            <div className="glass-panel dashboard-card dashboard-card--media card fullScreenCard">
                                <div className="dashboard-card__media fullScreenMedia">
                                    <AIRender 
                                        aiMode={aiMode}
                                        setAiMode={setAiMode}
                                        generatedImages={generatedImages}
                                        isGeneratingImage={isGeneratingImage}
                                        aiError={aiError}
                                        onGenerate={handleGenerateAI}
                                    />
                                    {debugImage && aiMode === 'interior' && (
                                        <div className="debugPanel section">
                                            <h3 className="debugTitle">Debug: Input Image for Vision Model</h3>
                                            <div className="debugFrame">
                                                <img 
                                                    src={debugImage} 
                                                    alt="Debug Capture" 
                                                    className="debugImage"
                                                />
                                            </div>
                                            <p className="debugCopy">
                                                This exact snapshot is sent to GPT-4o to analyze the layout.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <section className={`fullScreenGrid ${isWide ? "split" : "stack"}`}>
                            <div className="glass-panel dashboard-card dashboard-card--media card fullScreenCard">
                                <div className="dashboard-card__header viewHeader">
                                <div className="viewHeader__left">
                                  <h3 className="dashboard-card__title">3D Walkthrough & Model</h3>
                                  <span className="viewBadge">{viewMode === 'exterior' ? 'Exterior' : 'Interior'}</span>
                                </div>
                                <div className="segmented dashboard-toggle segmented--singleRow" role="group" aria-label="3D view mode">
                                    <button
                                        type="button"
                                        className="segmented__btn"
                                        aria-pressed={viewMode === 'floorplan' || viewMode === '2d'}
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
                                <div className="dashboard-card__media fullScreenMedia viewFrame">
                                    <div className="viewFrame__content">
                                      <FloorPlan3D 
                                          key={lastUpdated}
                                          rooms={data.rooms} 
                                          stairs={data.stairs} 
                                          extras={data.extras} 
                                          columns={data.columns}
                                          plotWidth={data.width} 
                                          plotDepth={data.depth}
                                          viewMode={(viewMode === '2d' || viewMode === 'floorplan') ? 'floorplan' : 'exterior'}
                                          animationMode={animationMode}
                                      /> 
                                    </div>
                                </div>
                            </div>
                            <div className="glass-panel dashboard-card card fullScreenCard">
                                <div className="dashboard-card__header cardHeader">
                                  <h3 className="dashboard-card__title cardHeaderTitle">2D Blueprint</h3>
                                  <div className="dashboard-card__meta">Floor {floor + 1}</div>
                                  {dataVariants && (
                                    <div className="segmented" role="group" aria-label="2D plan variant">
                                      {Array.from({ length: dataVariants.length }, (_, i) => i).map(i => (
                                        <button 
                                          key={i}
                                          type="button" 
                                          className="segmented__btn" 
                                          aria-pressed={selectedVariant === i}
                                          onClick={() => setSelectedVariant(i)}
                                        >
                                          Variant {i+1}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => setRoomsPanelOpen(o => !o)}
                                    title={roomsPanelOpen ? "Collapse Rooms panel" : "Expand Rooms panel"}
                                  >
                                    {roomsPanelOpen ? "Hide Rooms" : "Show Rooms"}
                                  </button>
                                </div>
                                <div 
                                className={`dashboard-card__body planGrid ${roomsPanelOpen ? "planGrid--withPaletteWide" : ""}`}
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
                                    const newRoom = { type, x, y, w, h, floor, doors: [], windows: [] };
                                    if (dataVariants && dataVariants.length) {
                                      setDataVariants(prev => {
                                        const arr = [...prev];
                                        const cur = { ...arr[selectedVariant] };
                                        arr[selectedVariant] = { ...cur, rooms: [...cur.rooms, newRoom] };
                                        return arr;
                                      });
                                    } else {
                                      setData(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
                                    }
                                }}
                                >
                                <div className="planScroll">
                                        <FloorPlan2D 
                                        rooms={(dataVariants ? dataVariants[selectedVariant].rooms : data.rooms)} 
                                        stairs={(dataVariants ? dataVariants[selectedVariant].stairs : data.stairs)} 
                                        extras={(dataVariants ? dataVariants[selectedVariant].extras : data.extras)} 
                                        columns={(dataVariants ? dataVariants[selectedVariant].columns : data.columns)}
                                        floor={floor} 
                                        plotWidth={(dataVariants ? dataVariants[selectedVariant].width : data.width)} 
                                        plotDepth={(dataVariants ? dataVariants[selectedVariant].depth : data.depth)} 
                                        onUpdateRoom={handleRoomUpdate}
                                        onDeleteRoom={(index) => {
                                            if (dataVariants && dataVariants.length) {
                                              setDataVariants(prev => {
                                                const arr = [...prev];
                                                const cur = { ...arr[selectedVariant] };
                                                arr[selectedVariant] = { 
                                                  ...cur, 
                                                  rooms: cur.rooms.filter((_, i) => i !== index) 
                                                };
                                                return arr;
                                              });
                                            } else {
                                              setData(prev => ({
                                                  ...prev,
                                                  rooms: prev.rooms.filter((_, i) => i !== index)
                                              }));
                                            }
                                        }}
                                        fitToContainer={true}
                                    /> 
                                </div>
                                {roomsPanelOpen && (
                                  <div className="palettePane palettePane--wide">
                                      <RoomsPalette collapsed={!roomsPanelOpen} onToggle={() => setRoomsPanelOpen(o => !o)} />
                                  </div>
                                )}
                                </div>
                            </div>
                            </section>
                        )}
                      </div>
                    )}
                    <aside className={`glass-panel dashboard-sidebar card section layoutSidebar ${sidebarCollapsed ? 'collapsed' : ''} ${fullScreen ? 'is-hidden' : ''}`}>
                        <div className="dashboard-sidebar__header">
                            <div className="dashboard-sidebar__icon" aria-hidden="true">
                                <LayoutDashboard size={18} />
                            </div>
                            <div className="dashboard-sidebar__titles">
                                <h3 className="dashboard-sidebar__title">Project Dashboard</h3>
                                <p className="dashboard-sidebar__subtitle text-light">Generated plan workspace</p>
                            </div>
                            <button 
                                className="btn-icon iconButton" 
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                            </button>
                        </div>

                        <div className="dashboard-sidebar__stack">
                            <div className="section-card card">
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

                            <div className="section-card card">
                                <div className="section-card__header">
                                    <h3 className="section-card__title">View Floor</h3>
                                </div>
                                <div className="section-card__body">
                                    <select
                                        className="input-field"
                                        onChange={e => setFloor(Number(e.target.value))}
                                        value={floor}
                                    >
                                        {Array.from({ length: formData.floors }, (_, i) => i).map(f => (
                                            <option key={f} value={f}>
                                                Floor {f + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {reportData && (
                                <div className="section-card card">
                                    <div className="section-card__header">
                                        <h3 className="section-card__title">Site Analysis & Costing</h3>
                                    </div>
                                    <div className="section-card__body">
                                        <SiteReport {...reportData} />
                                    </div>
                                </div>
                            )}

                            <div className="section-card card" id="export-panel">
                                <div className="section-card__header">
                                    <h3 className="section-card__title">Export & Share</h3>
                                </div>
                                <div className="section-card__body">
                                    <ExportPanel 
                                        data={data} 
                                        floor={floor} 
                                        reportData={reportData} 
                                        setAnimationMode={setAnimationMode}
                                        generatedImages={generatedImages}
                                        dashboardMode={dashboardMode}
                                        setDashboardMode={setDashboardMode}
                                    />
                                </div>
                            </div>

                        </div>
                    </aside>

                    <section className="dashboard-main layoutMain">
                        {/* 3D View / AI Render */}
                        <div className="glass-panel dashboard-card dashboard-card--media card">
                            <div className="dashboard-card__header viewHeader">
                                <div className="viewHeader__left">
                                <h3 className="dashboard-card__title">
                                    {dashboardMode === 'ai' ? 'AI Visualization' : '3D Walkthrough & Model'}
                                </h3>
                                <span className="viewBadge">
                                  {dashboardMode === 'ai'
                                    ? 'AI Render'
                                    : viewMode === 'exterior'
                                      ? 'Exterior'
                                      : viewMode === '2d'
                                        ? '2D Plan'
                                        : 'Interior'}
                                </span>
                                </div>
                                <div className="headerActions headerActions--singleRow">
                                    {/* Main Mode Toggle */}
                                    <div className="segmented dashboard-toggle segmented--singleRow" role="group" aria-label="Dashboard mode">
                                        <button
                                            type="button"
                                            className="segmented__btn"
                                            aria-pressed={dashboardMode === 'model'}
                                            onClick={() => setDashboardMode('model')}
                                        >
                                            Model View
                                        </button>
                                        <button
                                            type="button"
                                            className="segmented__btn"
                                            aria-pressed={dashboardMode === 'ai'}
                                            onClick={() => setDashboardMode('ai')}
                                        >
                                            AI Render
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {dashboardMode === 'model' && (
                              <div className="viewSubRow">
                                <div className="segmented dashboard-toggle segmented--singleRow viewToggleRow" role="group" aria-label="3D view mode">
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
                                    <button
                                        type="button"
                                        className="segmented__btn"
                                        aria-pressed={viewMode === '2d'}
                                        onClick={() => setViewMode('2d')}
                                    >
                                        2D Plan
                                    </button>
                                </div>
                                <div className="viewSubRow__actions">
                                  {viewMode === '2d' && (
                                    <button 
                                      type="button" 
                                      className="btn-secondary" 
                                      onClick={() => setRoomsPanelOpen(o => !o)}
                                      title={roomsPanelOpen ? "Collapse Rooms panel" : "Expand Rooms panel"}
                                    >
                                      {roomsPanelOpen ? "Hide Rooms" : "Show Rooms"}
                                    </button>
                                  )}
                                  {viewMode === '2d' && dataVariants && (
                                    <div className="segmented segmented--singleRow" role="group" aria-label="2D plan variant">
                                      {Array.from({ length: dataVariants.length }, (_, i) => i).map(i => (
                                        <button 
                                          key={i}
                                          type="button" 
                                          className="segmented__btn" 
                                          aria-pressed={selectedVariant === i}
                                          onClick={() => setSelectedVariant(i)}
                                        >
                                          Variant {i+1}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className={`dashboard-card__media ${dashboardMode === 'model' ? "viewFrame" : ""}`}>
                                {dashboardMode === 'ai' ? (
                                    <AIRender 
                                        aiMode={aiMode}
                                        setAiMode={setAiMode}
                                        generatedImages={generatedImages}
                                        isGeneratingImage={isGeneratingImage}
                                        aiError={aiError}
                                        onGenerate={handleGenerateAI}
                                    />
                                ) : viewMode === 'exterior' || viewMode === 'floorplan' ? (
                                    <div className="viewFrame__content">
                                      <FloorPlan3D 
                                          key={lastUpdated}
                                          rooms={data.rooms} 
                                          stairs={data.stairs} 
                                          extras={data.extras} 
                                          columns={data.columns}
                                          plotWidth={data.width} 
                                          plotDepth={data.depth}
                                          viewMode={viewMode}
                                          animationMode={animationMode}
                                      /> 
                                    </div>
                                ) : (
                                    <div 
                                        className={`dashboard-card__body planGrid ${roomsPanelOpen ? "planGrid--withPalette" : ""}`}
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
                                            const newRoom = { type, x, y, w, h, floor, doors: [], windows: [] };
                                            if (dataVariants && dataVariants.length) {
                                              setDataVariants(prev => {
                                                const arr = [...prev];
                                                const cur = { ...arr[selectedVariant] };
                                                arr[selectedVariant] = { ...cur, rooms: [...cur.rooms, newRoom] };
                                                return arr;
                                              });
                                            } else {
                                              setData(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
                                            }
                                        }}
                                    >
                                        <div className="planCanvas">
                                            <FloorPlan2D 
                                                rooms={(dataVariants ? dataVariants[selectedVariant].rooms : data.rooms)} 
                                                stairs={(dataVariants ? dataVariants[selectedVariant].stairs : data.stairs)} 
                                                extras={(dataVariants ? dataVariants[selectedVariant].extras : data.extras)} 
                                                columns={(dataVariants ? dataVariants[selectedVariant].columns : data.columns)}
                                                floor={floor} 
                                                plotWidth={(dataVariants ? dataVariants[selectedVariant].width : data.width)} 
                                                plotDepth={(dataVariants ? dataVariants[selectedVariant].depth : data.depth)} 
                                                onUpdateRoom={handleRoomUpdate}
                                                onDeleteRoom={(index) => {
                                                    if (dataVariants && dataVariants.length) {
                                                      setDataVariants(prev => {
                                                        const arr = [...prev];
                                                        const cur = { ...arr[selectedVariant] };
                                                        arr[selectedVariant] = { 
                                                          ...cur, 
                                                          rooms: cur.rooms.filter((_, i) => i !== index) 
                                                        };
                                                        return arr;
                                                      });
                                                    } else {
                                                      setData(prev => ({
                                                          ...prev,
                                                          rooms: prev.rooms.filter((_, i) => i !== index)
                                                      }));
                                                    }
                                                }}
                                                fitToContainer={true}
                                            /> 
                                        </div>
                                        {roomsPanelOpen && (
                                          <div className="palettePane">
                                              <RoomsPalette collapsed={!roomsPanelOpen} onToggle={() => setRoomsPanelOpen(o => !o)} />
                                          </div>
                                        )}
                                    </div>
                                )}
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

      {/* Hidden Capture Container for AI Input */}
      {(data || (dataVariants && dataVariants.length)) && (
        <div 
          id="floorplan-capture-target" 
          style={{ 
            position: 'fixed', 
            left: '-9999px', 
            top: 0, 
            width: '1024px', 
            height: '1024px', 
            background: 'white',
            zIndex: -1,
            pointerEvents: 'none'
          }}
        >
            <FloorPlan2D 
              rooms={(dataVariants ? dataVariants[selectedVariant].rooms : data.rooms)} 
              stairs={(dataVariants ? dataVariants[selectedVariant].stairs : data.stairs)} 
              extras={(dataVariants ? dataVariants[selectedVariant].extras : data.extras)} 
              columns={(dataVariants ? dataVariants[selectedVariant].columns : data.columns)} 
              floor={floor} 
              plotWidth={(dataVariants ? dataVariants[selectedVariant].width : data.width)} 
              plotDepth={(dataVariants ? dataVariants[selectedVariant].depth : data.depth)} 
              onUpdateRoom={() => {}} 
              onDeleteRoom={() => {}} 
              fitToContainer={true}
            />
        </div>
      )}
    </div> 
  ); 
} 
