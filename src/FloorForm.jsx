
export default function FloorForm({ onSubmit }) { 
  const handleSubmit = e => { 
    e.preventDefault(); 
    const data = new FormData(e.target); 

    onSubmit({ 
      width: Number(data.get("width")), 
      depth: Number(data.get("depth")), 
      floors: Number(data.get("floors")), 
      masterBedrooms: Number(data.get("masterBedrooms")),
      kidsBedrooms: Number(data.get("kidsBedrooms")),
      guestRooms: Number(data.get("guestRooms")),
      kitchens: Number(data.get("kitchens")),  
      bathrooms: Number(data.get("bathrooms")),
      bathroomSize: data.get("bathroomSize"),
      masterBedroomSize: data.get("masterBedroomSize"),
      quality: data.get("quality"),
      facing: data.get("facing"),
      features: {
        office: data.get("office") === "on",
        parking: data.get("parking") === "on",
        garden: data.get("garden") === "on",
        garage: false, // Legacy support if needed, or mapped to parking
        balcony: data.get("balcony") === "on"
      }
    }); 
  }; 

  return ( 
    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', marginBottom: '20px'}}> 
      <input name="width" placeholder="Plot width (ft)" required defaultValue="40" /> 
      <input name="depth" placeholder="Plot depth (ft)" required defaultValue="40" /> 
      
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <label style={{fontSize: '0.9em'}}>Number of Floors:</label>
        <input type="number" name="floors" min="1" max="10" required defaultValue="2" />
      </div>

      <input name="masterBedrooms" placeholder="Master Bedrooms (with attached bath)" required defaultValue="1" />
      <input name="kidsBedrooms" placeholder="Kids Bedrooms" required defaultValue="2" />
      <input name="guestRooms" placeholder="Guest Rooms" required defaultValue="1" />
      
      <input name="kitchens" placeholder="Kitchens" required defaultValue="1" /> 
      
      {/* Bathrooms */}
      <div style={{display: 'flex', gap: '5px'}}>
        <input name="bathrooms" placeholder="Bathrooms" required defaultValue="2" style={{flex: 1}} />
        <select name="bathroomSize" defaultValue="Standard" style={{flex: 1}}>
            <option value="Big">Big Bath</option>
            <option value="Standard">Std Bath</option>
            <option value="Small">Small Bath</option>
        </select>
      </div>

      {/* Master Bedroom */}
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <label style={{fontSize: '0.9em'}}>Master Bedroom Size:</label>
        <select name="masterBedroomSize" defaultValue="Standard">
            <option value="Big">Big</option>
            <option value="Standard">Standard</option>
            <option value="Small">Small</option>
        </select>
      </div>

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <label style={{fontSize: '0.9em'}}>Entrance Facing:</label>
        <select name="facing" defaultValue="South" style={{padding: '5px'}}> 
            <option value="North">North</option> 
            <option value="South">South</option> 
            <option value="East">East</option> 
            <option value="West">West</option> 
        </select> 
      </div>

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <label style={{fontSize: '0.9em'}}>Construction Quality:</label>
        <select name="quality" defaultValue="Super" style={{padding: '5px'}}> 
            <option value="Super">Super (Standard)</option> 
            <option value="Semi-Luxury">Semi-Luxury</option> 
            <option value="Luxury">Luxury</option> 
        </select> 
      </div>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '5px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px'}}>
        <label style={{fontWeight: 'bold'}}>Extras:</label>
        <label><input type="checkbox" name="office" /> Office Space</label>
        <label><input type="checkbox" name="parking" defaultChecked /> Parking Facility</label>
        <label><input type="checkbox" name="garden" defaultChecked /> Garden</label>
        <label><input type="checkbox" name="balcony" defaultChecked /> Balcony</label>
      </div>

      <button type="submit">Generate</button> 
    </form> 
  ); 
} 
