"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

let L: any = null;
if (typeof window !== "undefined") {
  L = require("leaflet");
}

interface AdminLocationMismatchMapProps {
  lat: number;
  lng: number;
  actualLat: number;
  actualLng: number;
  name: string;
}

export default function AdminLocationMismatchMap({ lat, lng, actualLat, actualLng, name }: AdminLocationMismatchMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (L) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/marker-icon-2x.png",
        iconUrl: "/marker-icon.png",
        shadowUrl: "/marker-shadow.png",
      });
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[250px] w-full bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-500 font-mono">Loading inspection map...</span>
      </div>
    );
  }

  // Create custom colored pins to differentiate Provided and Actual location
  const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const center: [number, number] = [(lat + actualLat) / 2, (lng + actualLng) / 2];

  return (
    <div className="h-[250px] w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative z-0">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Provided Location Pin */}
        <Marker position={[lat, lng]} icon={greenIcon}>
          <Popup>
            <div className="text-xs text-slate-900 font-sans">
              <p className="font-bold text-emerald-700">Provided Coordinates</p>
              <p className="text-[10px] mt-0.5 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
              <p className="text-[10px] text-slate-500 mt-1">Claimed location for matches.</p>
            </div>
          </Popup>
        </Marker>

        {/* Actual Geolocation Pin */}
        <Marker position={[actualLat, actualLng]} icon={redIcon}>
          <Popup>
            <div className="text-xs text-slate-900 font-sans">
              <p className="font-bold text-red-650">Actual Device GPS</p>
              <p className="text-[10px] mt-0.5 font-mono">{actualLat.toFixed(5)}, {actualLng.toFixed(5)}</p>
              <p className="text-[10px] text-slate-500 mt-1">Captured during registration/config.</p>
            </div>
          </Popup>
        </Marker>

        {/* Distance Line */}
        <Polyline 
          positions={[[lat, lng], [actualLat, actualLng]]} 
          pathOptions={{ color: '#6366f1', dashArray: '6, 6', weight: 3 }}
        />
      </MapContainer>
    </div>
  );
}
