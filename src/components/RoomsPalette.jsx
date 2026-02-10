 
import { Home, Soup, Car, Trees, Building, Bath, BedDouble, Sofa } from "lucide-react";

const ITEMS = [
  { key: "living", label: "Living Room", icon: Sofa, w: 16, h: 12 },
  { key: "bedroom", label: "Bedroom", icon: BedDouble, w: 12, h: 12 },
  { key: "master", label: "Master Bedroom", icon: BedDouble, w: 14, h: 14 },
  { key: "guest", label: "Guest Room", icon: BedDouble, w: 12, h: 10 },
  { key: "kitchen", label: "Kitchen", icon: Soup, w: 10, h: 10 },
  { key: "bathroom", label: "Bathroom", icon: Bath, w: 8, h: 6 },
  { key: "office", label: "Office", icon: Home, w: 12, h: 10 },
  { key: "parking", label: "Parking", icon: Car, w: 16, h: 10 },
  { key: "garage", label: "Garage", icon: Car, w: 16, h: 12 },
  { key: "garden", label: "Garden", icon: Trees, w: 20, h: 12 },
  { key: "balcony", label: "Balcony", icon: Building, w: 10, h: 6 },
  { key: "corridor", label: "Corridor", icon: Building, w: 20, h: 4 }
];

export default function RoomsPalette({ title = "Rooms", ariaLabel = "Draggable rooms" }) {
  const onDragStart = (e, item) => {
    const payload = JSON.stringify({ type: item.key, w: item.w, h: item.h, label: item.label });
    e.dataTransfer.setData("application/json", payload);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      className="section-card"
      style={{ width: "100%", alignSelf: "stretch", boxSizing: "border-box", padding: 8 }}
    >
      <div className="section-card__header" style={{ paddingBottom: 6 }}>
        <h3 className="section-card__title" style={{ fontSize: "0.95rem" }}>{title}</h3>
      </div>
      <div className="section-card__body" role="list" aria-label={ariaLabel} style={{ overflow: "auto", padding: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
          {ITEMS.map(({ key, label, icon: Icon, w, h }) => (
            <div
              key={key}
              role="listitem"
              draggable
              onDragStart={(e) => onDragStart(e, { key, label, w, h })}
              className="feature-tile"
              aria-grabbed="false"
              style={{ cursor: "grab", padding: 6 }}
              >
              <span className="feature-tile__left">
                <span className="feature-tile__icon">
                  <Icon size={16} />
                </span>
                <span className="feature-tile__label" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", fontSize: "0.95rem" }}>{label}</span>
              </span>
              <span className="room-muted">{w}′×{h}′</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
