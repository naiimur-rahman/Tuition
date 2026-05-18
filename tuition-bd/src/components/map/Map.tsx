"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useSession } from "next-auth/react";

const L = typeof window !== "undefined" ? require("leaflet") : null;

function RecenterControl({ userLocation }: { userLocation: [number, number] | null }) {
  const map = useMap();
  
  if (!userLocation) return null;

  return (
    <div className="absolute bottom-6 right-6 z-[1000] pointer-events-auto">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          map.setView(userLocation, 14, { animate: true });
        }}
        className="bg-slate-950/95 backdrop-blur-md hover:bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:border-pink-500 hover:text-pink-400 group"
        title="Recenter to my location"
      >
        <svg
          className="w-4 h-4 text-pink-500 group-hover:scale-110 transition duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">My Location</span>
      </button>
    </div>
  );
}

function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoomChange(map.getZoom());
    const onZoom = () => {
      onZoomChange(map.getZoom());
    };
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [map, onZoomChange]);
  return null;
}

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapComponent({
  type,
  subjects,
  classLevels,
  searchRadius,
  setSearchRadius,
  onMetricsChange,
}: {
  type: string;
  subjects: string[];
  classLevels: string[];
  searchRadius: 1.5 | 3 | 5;
  setSearchRadius: (r: 1.5 | 3 | 5) => void;
  onMetricsChange?: (metrics: { total: number; within: number; outside: number }) => void;
}) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id || "";
  const userRole = (session?.user as any)?.role || "";

  const [isMounted, setIsMounted] = useState(false);
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [dbTutors, setDbTutors] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [payLaterJob, setPayLaterJob] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  const handleApply = async (jobId: string) => {
    if (!session) {
      alert("Please login first to apply for jobs.");
      return;
    }
    setApplyingJobId(jobId);
    try {
      const res = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, action: "apply" }),
      });
      if (res.ok) {
        alert("✓ Applied successfully! Check your tutor dashboard assigned section to complete the commission match payment.");
        window.location.reload();
      } else {
        alert("Failed to submit application. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setApplyingJobId(null);
    }
  };

  // Initialize client geolocation coordinates
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("GPS access blocked or unavailable, centering on central Dhaka coordinates.", error);
          setUserLocation([23.8103, 90.4125]);
        }
      );
    } else {
      setUserLocation([23.8103, 90.4125]);
    }
  }, []);

  // Fix Leaflet marker icons in Next.js
  useEffect(() => {
    setIsMounted(true);
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/marker-icon-2x.png",
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
    });
  }, []);

  // Fetch data on filters change
  useEffect(() => {
    if (!isMounted) return;

    if (type !== "tutor") {
      fetch("/api/jobs")
        .then((res) => res.json())
        .then((data) => setDbJobs(data))
        .catch((err) => console.error(err));
    } else {
      fetch("/api/users?role=TUTOR")
        .then((res) => res.json())
        .then((data) => {
          const mapTutors = data
            .filter((u: any) => u.profile)
            .map((u: any) => {
              const reviews = u.receivedReviews || [];
              const confirmedCount = u.appliedJobs?.length || 0;
              const hasConfirmedTuition = confirmedCount > 0 || reviews.length > 0;
              const avgRating = reviews.length > 0
                ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : "0.0";

              return {
                id: u.id,
                name: u.name,
                approxLat: u.profile.approxLatitude || 23.734,
                approxLng: u.profile.approxLongitude || 90.3928,
                verified: u.profile.verificationStatus === "VERIFIED",
                subject: u.profile.bio || "Various Subjects",
                hasConfirmedTuition,
                avgRating,
                reviews,
                tutorSeq: u.profile.tutorSeq,
              };
            });
          
          // Fallback mockup tutor if SQLite database user table doesn't have tutors yet
          if (mapTutors.length === 0) {
            setDbTutors([
              {
                id: "mock1",
                name: "Rahim (DU Physics Major)",
                approxLat: 23.734,
                approxLng: 90.3928,
                verified: true,
                subject: "Physics, Advanced Mathematics",
                tutorSeq: 1,
              },
              {
                id: "mock2",
                name: "Nusrat (NSU English Dept)",
                approxLat: 23.7925,
                approxLng: 90.4078,
                verified: false,
                subject: "English Literature, IELTS Preparation",
                tutorSeq: 2,
              },
            ]);
          } else {
            setDbTutors(mapTutors);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [type, isMounted]);

  // Sync calculated proximity metrics back to parent dashboard outside-of-map controls.
  // Calculated at top level so that it runs unconditionally (no Rules of Hooks violations!).
  useEffect(() => {
    if (!onMetricsChange) return;

    let items = type === "tutor" ? dbTutors : dbJobs;
    if (type !== "tutor") {
      items = items.filter((job: any) => !job.locationUnlocked && job.status === "OPEN");
    }

    if (subjects && subjects.length > 0) {
      items = items.filter((item: any) => {
        const itemSubject = (item.subject || item.bio || "").toLowerCase();
        return subjects.some((sub) => itemSubject.includes(sub.toLowerCase()));
      });
    }

    if (classLevels && classLevels.length > 0) {
      items = items.filter((item: any) => {
        const itemClass = (item.classLevel || item.education || "").toLowerCase();
        return classLevels.some((cl) => {
          const queryCl = cl.toLowerCase();
          if (queryCl === "o level") {
            return itemClass.includes("o level") || itemClass.includes("o-level") || itemClass.includes("english medium");
          }
          if (queryCl === "a level") {
            return itemClass.includes("a level") || itemClass.includes("a-level") || itemClass.includes("english medium");
          }
          return itemClass.includes(queryCl);
        });
      });
    }

    const within = items.filter((item: any) => {
      return userLocation
        ? getDistanceInKm(userLocation[0], userLocation[1], item.approxLat, item.approxLng) <= searchRadius
        : true;
    }).length;

    onMetricsChange({
      total: items.length,
      within,
      outside: items.length - within,
    });
  }, [
    dbTutors,
    dbJobs,
    type,
    subjects,
    classLevels,
    userLocation,
    searchRadius,
    onMetricsChange
  ]);

  if (!isMounted) {
    return (
      <div className="h-[750px] lg:h-[800px] w-full bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-slate-400 font-mono text-xs uppercase tracking-wider">Syncing map coordinates...</p>
      </div>
    );
  }

  const center: [number, number] = [23.8103, 90.4125]; // Central Dhaka Center

  // Filter coordinates based on proximity range and unlock status
  let filteredItems = type === "tutor" ? dbTutors : dbJobs;

  if (type !== "tutor") {
    // Immediate coordinates vanish: hide if unlocked or status is not open
    filteredItems = filteredItems.filter((job: any) => !job.locationUnlocked && job.status === "OPEN");
  }

  // Apply checkbox subject filters
  if (subjects && subjects.length > 0) {
    filteredItems = filteredItems.filter((item: any) => {
      const itemSubject = (item.subject || item.bio || "").toLowerCase();
      return subjects.some((sub) => itemSubject.includes(sub.toLowerCase()));
    });
  }

  // Apply checkbox class level filters
  if (classLevels && classLevels.length > 0) {
    filteredItems = filteredItems.filter((item: any) => {
      const itemClass = (item.classLevel || item.education || "").toLowerCase();
      return classLevels.some((cl) => {
        const queryCl = cl.toLowerCase();
        if (queryCl === "o level") {
          return itemClass.includes("o level") || itemClass.includes("o-level") || itemClass.includes("english medium");
        }
        if (queryCl === "a level") {
          return itemClass.includes("a level") || itemClass.includes("a-level") || itemClass.includes("english medium");
        }
        return itemClass.includes(queryCl);
      });
    });
  }

  const withinProximityCount = filteredItems.filter((item: any) => {
    return userLocation
      ? getDistanceInKm(userLocation[0], userLocation[1], item.approxLat, item.approxLng) <= searchRadius
      : true;
  }).length;

  const outOfProximityCount = filteredItems.length - withinProximityCount;

  // Proximity metrics synced cleanly via top-level unconditional useEffect

  return (
    <div className="h-[750px] lg:h-[800px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative z-0">

      <MapContainer
        center={userLocation || center}
        zoom={12}
        scrollWheelZoom={true}
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterControl userLocation={userLocation} />
        <ZoomTracker onZoomChange={setZoomLevel} />

        {userLocation && (
          <>
            {/* Dynamic Horizon Circle */}
            <Circle
              center={userLocation}
              radius={searchRadius * 1000} // Dynamic search radius in meters
              pathOptions={{
                color: "#e2136e",
                fillColor: "#e2136e",
                fillOpacity: 0.03,
                weight: 1.5,
                dashArray: "6 8",
              }}
            />
            {/* Core User Beacon */}
            <Circle
              center={userLocation}
              radius={150} // Core radius marker (slightly larger)
              pathOptions={{
                color: "#e2136e",
                fillColor: "#e2136e",
                fillOpacity: 0.85,
                weight: 2,
                className: "leaflet-animated-marker", // Pulse animation
              }}
            >
              <Popup>
                <div className="p-2.5 font-sans min-w-[160px] text-slate-200">
                  <p className="font-bold text-pink-400 font-mono text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
                    </span>
                    User Position
                  </p>
                  <div className="h-px bg-slate-800 my-1.5" />
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    A <span className="text-pink-400 font-extrabold font-mono">{searchRadius} km range</span> is established around your location. Scan markers within this sector.
                  </p>
                </div>
              </Popup>
            </Circle>
          </>
        )}

        {filteredItems.map((item: any) => {
          const isTutor = type === "tutor";
          const themeColor = isTutor ? "#10b981" : "#8b5cf6"; // Emerald for Tutors, Purple for Jobs
          const isWithinRadius = userLocation
            ? getDistanceInKm(userLocation[0], userLocation[1], item.approxLat, item.approxLng) <= searchRadius
            : true;

          const customIcon = L ? L.divIcon({
            className: "custom-map-pin",
            html: `
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 border-2 ${
                isTutor ? "border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]" : "border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.6)]"
              }">
                ${isTutor ? `
                  <svg class="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                ` : `
                  <svg class="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .414-.336.75-.75.75H4.5a.75.75 0 01-.75-.75v-4.25m16.5 0a3 3 0 00-3-3H7.05a3 3 0 00-3 3m16.5 0V9a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9v5.15" />
                  </svg>
                `}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
          }) : null;

          const popupContent = (
            <Popup>
              <div className="p-3 font-sans min-w-[220px] text-slate-200">
                  <div className="flex flex-col gap-1.5 mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border w-fit font-extrabold ${
                      isTutor
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    }`}>
                      {isTutor
                        ? `TC-${String(item.tutorSeq && item.tutorSeq > 0 ? item.tutorSeq : 1).padStart(3, '0')}`
                        : `TCT-${String(item.jobSeq && item.jobSeq > 0 ? item.jobSeq : 1).padStart(3, '0')}`}
                    </span>
                    <h3 className="font-bold text-sm text-white leading-tight font-heading mt-1 flex flex-wrap items-center gap-1.5">
                      {isTutor ? (
                        <>
                          <span>Tutor Profile</span>
                          <span className="select-none pointer-events-none filter blur-[4.5px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none border border-slate-800/60 inline-block">
                            {item.name}
                          </span>
                        </>
                      ) : (
                        item.title
                      )}
                    </h3>
                  </div>

                <div className="h-px bg-slate-800 my-2" />

                <div className="text-xs space-y-1.5 text-slate-300">
                  {item.salary && (
                    <p className="flex justify-between">
                      <span className="text-slate-500 font-mono">Salary:</span>
                      <span className="font-bold text-white">{item.salary} BDT</span>
                    </p>
                  )}
                  {item.classLevel && (
                    <p className="flex justify-between">
                      <span className="text-slate-500 font-mono">Class:</span>
                      <span className="text-slate-200">{item.classLevel}</span>
                    </p>
                  )}
                  {item.subject && (
                    <p className="flex flex-col gap-0.5 mt-1">
                      <span className="text-slate-500 font-mono">Subject/Bio:</span>
                      <span className="text-slate-200 text-[11px] leading-relaxed bg-slate-950 border border-slate-800 p-1.5 rounded-lg font-mono">
                        {item.subject}
                      </span>
                    </p>
                  )}

                  {/* Rating system appears only after tuition has been confirmed */}
                  {item.hasConfirmedTuition && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg space-y-1 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-mono text-[9px] uppercase">Educator Rating</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono text-[11px]">
                          ★ {item.avgRating}
                        </span>
                      </div>
                      {item.reviews && item.reviews.length > 0 && (
                        <div className="text-[10px] text-slate-400 italic mt-1 max-h-[50px] overflow-y-auto border-t border-slate-900 pt-1 leading-normal font-sans">
                          "{item.reviews[0].comment}"
                          <span className="block text-[8px] text-slate-500 not-italic mt-0.5 font-mono text-right flex items-center justify-end gap-1">
                            — 
                            <span className="select-none pointer-events-none filter blur-[3px] bg-slate-800/40 text-slate-500 px-1 py-px rounded text-[8px] font-mono leading-none border border-slate-700/20 inline-block">
                              {item.reviews[0].author?.name || "Parent"}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {item.verified && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold">
                      Verified Credentials
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold border ${
                    isWithinRadius 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {isWithinRadius ? "Within Proximity" : "Out of Proximity"}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  {isTutor ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Parent Verification Access
                      </p>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tutor Code:</span>
                          <span className="text-emerald-400 font-bold">TC-{String(item.tutorSeq && item.tutorSeq > 0 ? item.tutorSeq : 1).padStart(3, '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Coordination Status:</span>
                          <span className={isWithinRadius ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                            {isWithinRadius ? "Active Match" : "Out of Proximity"}
                          </span>
                        </div>
                      </div>
                      <div className={`p-2.5 rounded-xl text-[9px] font-mono leading-relaxed border ${
                        isWithinRadius
                          ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400/90"
                          : "bg-amber-500/5 border-amber-500/10 text-amber-400/90"
                      }`}>
                        {isWithinRadius 
                          ? "Request coordinate matching for this educator from the Tuition Console portal. Direct contact details are securely managed."
                          : `This educator is located outside your active search boundary (${searchRadius} km). You can still coordinate matching via our admin desks.`
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] text-yellow-500 mb-2 font-mono flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Tuition Match Console
                      </p>
                      
                      {item.tutorId === userId ? (
                        <div className="space-y-2">
                          {item.locationUnlocked ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-center font-mono text-[10px] text-emerald-400 font-extrabold flex items-center justify-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Verified Match Unlocked!
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg text-[9px] font-mono text-amber-500 leading-normal text-center">
                                Application received! Pay the 20% commission fee ({Math.floor(item.salary * 0.2)} BDT) to unlock parents exact details.
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <Link href={`/payment?jobId=${item.id}`} className="block w-full">
                                  <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2 py-1.5 rounded-lg text-[10px] font-bold w-full transition duration-200 cursor-pointer shadow-md flex items-center justify-center space-x-1 border-none h-8">
                                    <span>Pay Now (Instant Access)</span>
                                  </button>
                                </Link>
                                <button 
                                  onClick={() => setPayLaterJob(item)}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1.5 rounded-lg text-[10px] font-bold w-full transition duration-200 cursor-pointer shadow-md flex items-center justify-center space-x-1 border-none h-8"
                                >
                                  <span>Pay Later</span>
                                </button>
                              </div>
                              <div className="text-center text-[8px] font-mono text-slate-500 mt-1">
                                Support Hotline: <span className="text-emerald-500 font-bold">096-96-847-847</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : item.tutorId !== null ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-center font-mono text-[10px] text-red-400 font-extrabold">
                          ✗ Tuition Match Assigned (Closed)
                        </div>
                      ) : userRole === "TUTOR" ? (
                        <button
                          onClick={() => handleApply(item.id)}
                          disabled={applyingJobId === item.id}
                          className="bg-emerald-500 text-slate-950 px-3 py-2 rounded-lg text-xs font-bold w-full hover:bg-emerald-600 transition duration-200 cursor-pointer shadow-md flex items-center justify-center space-x-1.5 border-none disabled:opacity-50"
                        >
                          {applyingJobId === item.id ? (
                            <>
                              <div className="animate-spin h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />
                              <span>Applying...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                              </svg>
                              <span>Apply for Tuition (Free)</span>
                            </>
                          )}
                        </button>
                      ) : !session ? (
                        <Link href="/login" className="block w-full">
                          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold w-full transition duration-200 cursor-pointer shadow-md flex items-center justify-center space-x-1.5 border-none">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <span>Login as Tutor to Apply</span>
                          </button>
                        </Link>
                      ) : (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-center font-mono text-[9px] text-slate-500">
                          Available strictly for verified educators.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          );

          if (zoomLevel <= 13) {
            return (
              <Marker
                key={item.id}
                position={[item.approxLat, item.approxLng]}
                icon={customIcon}
              >
                {popupContent}
              </Marker>
            );
          }

          return (
            <Circle
              key={item.id}
              center={[item.approxLat, item.approxLng]}
              radius={180} // Increased from 120 to 180 meters for improved visibility
              pathOptions={{
                color: themeColor,
                fillColor: themeColor,
                fillOpacity: 0.8,
                weight: 2,
                className: "leaflet-animated-marker", // Pulse animation
              }}
            >
              {popupContent}
            </Circle>
          );
        })}
      </MapContainer>

      {/* Dynamic Pay Later Coordination Modal */}
      {payLaterJob && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-center space-y-6 transform scale-100 transition-all duration-300">
            {/* Decorative hotline icon header */}
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-heading font-extrabold text-white">Pay Later Coordination</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                To activate the match coordinates for **{payLaterJob.title}** and settle the commission after matching, please contact the Tuition Console Hotline.
              </p>
            </div>

            {/* Hotline information box */}
            <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-2 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Official Hotline</span>
              <a href="tel:09696847847" className="text-2xl font-heading font-black text-emerald-400 block hover:underline hover:text-emerald-300 transition duration-200">
                096-96-847-847
              </a>
              <span className="text-[9px] text-slate-500 block font-mono">Available 24/7 for swift activation</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a 
                href="tel:09696847847"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 cursor-pointer shadow-md flex items-center justify-center space-x-1.5 border-none h-10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call Support</span>
              </a>
              <button 
                onClick={() => setPayLaterJob(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 cursor-pointer shadow-md flex items-center justify-center border-none h-10"
              >
                <span>Close Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
