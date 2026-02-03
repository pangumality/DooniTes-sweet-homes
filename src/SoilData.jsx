import { useState, useEffect } from "react"; 

function SoilData({ lat, lon }) { 
  const [soil, setSoil] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    if (lat && lon) {
      fetchSoilData();
    }
  }, [lat, lon]);

  const fetchSoilData = async () => { 
    setLoading(true); 
    setError(null); 
    setSoil(null);

    try { 
      // Using the endpoint via Vite Proxy to avoid CORS
      const response = await fetch( 
        `/api/kaegro/farms/api/soil?lat=${lat}&lon=${lon}` 
      ); 

      if (!response.ok) { 
        throw new Error("Failed to fetch soil data"); 
      } 

      const data = await response.json(); 
      setSoil(data); 
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  return ( 
    <>
      {loading && <p style={{color: "#ccc"}}>Loading soil data...</p>} 
      {error && <p style={{ color: "#ff6b6b" }}>{error}</p>} 

      {soil && ( 
        <div style={{ marginTop: "1rem", background: "#1e293b", padding: "10px", borderRadius: "4px", color: "#a5f3fc" }}> 
          <pre style={{ margin: 0, overflow: "auto" }}> 
            {JSON.stringify(soil, null, 2)} 
          </pre> 
        </div> 
      )} 
    </> 
  ); 
} 

export default SoilData;