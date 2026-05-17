"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for React Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), {
  ssr: false,
});

// Mock data - In a real app, this comes from Prisma/API
const MOCK_JOBS = [
  { id: 1, title: "Math Tutor Needed for Class 10", approxLat: 23.8103, approxLng: 90.4125, salary: "5000 BDT", locationUnlocked: false },
  { id: 2, title: "English Tutor Class 8", approxLat: 23.7937, approxLng: 90.4066, salary: "4000 BDT", locationUnlocked: false },
];

const MOCK_TUTORS = [
  { id: 1, name: "Rahim (DU Student)", approxLat: 23.7340, approxLng: 90.3928, verified: true, subject: "Physics" },
];

export default function MapComponent({ type }: { type: string }) {
  const [isMounted, setIsMounted] = useState(false);

  // Fix Leaflet marker icons in Next.js
  useEffect(() => {
    setIsMounted(true);
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default?.src || "/marker-icon-2x.png",
      iconUrl: require("leaflet/dist/images/marker-icon.png").default?.src || "/marker-icon.png",
      shadowUrl: require("leaflet/dist/images/marker-shadow.png").default?.src || "/marker-shadow.png",
    });
  }, []);

  if (!isMounted) return <div className="h-[600px] w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>;

  const center: [number, number] = [23.8103, 90.4125]; // Dhaka Center

  const items = type === 'tutor' ? MOCK_TUTORS : MOCK_JOBS;

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {items.map((item: any) => (
          // We use Circle to show approximate location
          <Circle
            key={item.id}
            center={[item.approxLat, item.approxLng]}
            radius={800} // 800 meters radius for approximation
            pathOptions={{ color: type === 'tutor' ? 'blue' : 'green', fillColor: type === 'tutor' ? 'blue' : 'green', fillOpacity: 0.2 }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{item.title || item.name}</h3>
                <p className="text-gray-600 mb-2">
                  {item.salary && `Salary: ${item.salary}`}
                  {item.subject && `Subject: ${item.subject}`}
                </p>
                {item.verified && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Verified</span>}
                <div className="mt-3">
                  <p className="text-xs text-red-500 mb-2">*Approximate Location</p>
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/payment', {
                        method: 'POST',
                        body: JSON.stringify({ jobId: item.id, amount: 50, type: 'UNLOCK_FEE' })
                      });
                      const data = await res.json();
                      if(data.paymentUrl) window.location.href = data.paymentUrl;
                    }}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm w-full hover:bg-indigo-700 transition"
                  >
                    Unlock Exact Location (Pay 50 BDT)
                  </button>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
