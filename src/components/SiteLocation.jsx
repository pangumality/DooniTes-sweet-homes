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
    <div className="site-location">
      <div className="site-location__map">
        <MapContainer center={[20, 78]} zoom={4} style={{ height: "100%", width: "100%" }}> 
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            className="map-tiles"
          /> 
          <LocationPicker onSelect={setLocation} /> 
          {location && <Marker position={[location.lat, location.lng]} />}
        </MapContainer> 
      </div>

      <div className="site-location__toolbar">
        <div className="site-location__control">
          <label htmlFor="manual-lat">Latitude</label>
          <input 
            id="manual-lat"
            className="input-field"
            type="number" 
            value={manualLat} 
            onChange={e => setLat(Number(e.target.value))} 
            placeholder="Enter coordinate" 
          />
        </div>

        <div className="site-location__control">
          <label htmlFor="manual-lng">Longitude</label>
          <input 
            id="manual-lng"
            className="input-field"
            type="number" 
            value={manualLng} 
            onChange={e => setLng(Number(e.target.value))} 
            placeholder="Enter coordinate" 
          />
        </div>

        <div className="site-location__control site-location__control--action">
          <button className="btn-primary site-location__btn" onClick={handleManualUpdate}>Validate Location</button>
        </div>
      </div>

      {location && (
        <div className="site-location__selected">
          <span className="site-location__selectedLabel">Selected</span>
          <span className="site-location__selectedValue">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
        </div>
      )}
    </div>
  ); 
} 
