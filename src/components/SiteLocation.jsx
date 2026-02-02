import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"; 
import "leaflet/dist/leaflet.css"; 
import { useState } from "react";
import L from "leaflet";

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ onSelect }) { 
  useMapEvents({ 
    click(e) { 
      onSelect(e.latlng); 
    } 
  }); 
  return null; 
} 

export default function SiteLocation({ setLocation, location }) { 
  const [manualLat, setLat] = useState(20);
  const [manualLng, setLng] = useState(78);

  const handleManualUpdate = () => {
      setLocation({ lat: manualLat, lng: manualLng });
  };

  return ( 
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '300px', width: '100%', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer center={[20, 78]} zoom={4} style={{ height: "100%", width: "100%" }}> 
                <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                    className="map-tiles"
                /> 
                <LocationPicker onSelect={setLocation} /> 
                {location && <Marker position={[location.lat, location.lng]} />}
            </MapContainer> 
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>Lat:</label>
            <input 
                className="input-field"
                type="number" 
                value={manualLat} 
                onChange={e => setLat(Number(e.target.value))} 
                placeholder="Latitude" 
                style={{ width: '100px' }}
            />
            <label>Lng:</label>
            <input 
                className="input-field"
                type="number" 
                value={manualLng} 
                onChange={e => setLng(Number(e.target.value))} 
                placeholder="Longitude" 
                style={{ width: '100px' }}
            />
            <button className="btn-secondary" onClick={handleManualUpdate}>Update</button>
        </div>
        {location && (
            <p style={{ fontSize: '0.9em', color: '#666', margin: 0 }}>
                Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
        )}
    </div>
  ); 
} 
