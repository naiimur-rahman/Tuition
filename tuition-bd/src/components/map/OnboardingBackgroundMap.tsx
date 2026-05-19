"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function OnboardingBackgroundMap() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-25 filter grayscale contrast-[1.2]">
      <MapContainer
        center={[23.79, 90.40]} // Centered on Bangladesh Gulshan/Dhanmondi sectors
        zoom={13}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
