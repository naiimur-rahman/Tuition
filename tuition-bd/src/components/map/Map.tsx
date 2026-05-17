"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent({
  type,
  subject,
  classLevel,
}: {
  type: string;
  subject: string;
  classLevel: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [dbTutors, setDbTutors] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
      const url = `/api/jobs?subject=${encodeURIComponent(subject)}&classLevel=${encodeURIComponent(classLevel)}`;
      fetch(url)
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
  }, [type, subject, classLevel, isMounted]);

  if (!isMounted) {
    return (
      <div className="h-[750px] lg:h-[800px] w-full bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-slate-400 font-mono text-xs uppercase tracking-wider">Syncing map coordinates...</p>
      </div>
    );
  }

  const center: [number, number] = [23.8103, 90.4125]; // Central Dhaka Center

  const items = type === "tutor" ? dbTutors : dbJobs;

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

        {userLocation && (
          <>
            {/* 5 km Radius Search Horizon */}
            <Circle
              center={userLocation}
              radius={5000} // 5 km search radius
              pathOptions={{
                color: "#38bdf8", // Sky blue dashed outer boundary
                fillColor: "#0ea5e9",
                fillOpacity: 0.05,
                weight: 1.5,
                dashArray: "6 8",
              }}
            />
            {/* Core User Beacon */}
            <Circle
              center={userLocation}
              radius={120} // Core radius marker
              pathOptions={{
                color: "#38bdf8",
                fillColor: "#0ea5e9",
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-2.5 font-sans min-w-[160px] text-slate-200">
                  <p className="font-bold text-sky-400 font-mono text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                    </span>
                    User Position
                  </p>
                  <div className="h-px bg-slate-800 my-1.5" />
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    A <span className="text-sky-300 font-semibold font-mono">5 km search horizon</span> is established around your location. Scan markers within this sector.
                  </p>
                </div>
              </Popup>
            </Circle>
          </>
        )}

        {items.map((item: any) => {
          const isTutor = type === "tutor";
          const themeColor = isTutor ? "#10b981" : "#6366f1"; // Emerald for Tutors, Indigo for Jobs

          return (
            <Circle
              key={item.id}
              center={[item.approxLat, item.approxLng]}
              radius={800} // 800 meters radius approximation
              pathOptions={{
                color: themeColor,
                fillColor: themeColor,
                fillOpacity: 0.15,
                weight: 2,
                dashArray: "4 4",
              }}
            >
              <Popup>
                <div className="p-3 font-sans min-w-[220px] text-slate-200">
                    <div className="flex flex-col gap-1.5 mb-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border w-fit font-extrabold ${
                        isTutor
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}>
                        {isTutor
                          ? `TC-${String(item.tutorSeq && item.tutorSeq > 0 ? item.tutorSeq : 1).padStart(3, '0')}`
                          : `TT-${String(item.jobSeq && item.jobSeq > 0 ? item.jobSeq : 1).padStart(4, '0')}`}
                      </span>
                      <h3 className="font-bold text-sm text-white leading-tight font-heading mt-1 flex flex-wrap items-center gap-1.5">
                        {isTutor ? (
                          <>
                            <span>Tutor Profile</span>
                            <span className="select-none pointer-events-none filter blur-[4.5px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none border border-slate-800/60 inline-block">
                              undefined
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

                  <div className="mt-3 flex items-center justify-between gap-2">
                    {item.verified && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                        Verified Credentials
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    {isTutor ? (
                      <div className="space-y-2">
                        <p className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Parent Access (Free)
                        </p>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono text-[10px]">
                          <p className="text-slate-500">Contact Email:</p>
                          <p className="text-slate-200 font-bold">
                            tutor.tc-{String(item.tutorSeq && item.tutorSeq > 0 ? item.tutorSeq : 1).padStart(3, '0')}@tuition-console.net
                          </p>
                          <p className="text-slate-500 mt-1">Coordination Status:</p>
                          <p className="text-emerald-400 font-bold">Available</p>
                        </div>
                        <a 
                          href={`mailto:tutor.tc-${String(item.tutorSeq && item.tutorSeq > 0 ? item.tutorSeq : 1).padStart(3, '0')}@tuition-console.net?subject=Tuition Roster Coordination Inquiry`}
                          className="bg-emerald-500 text-slate-950 px-3 py-2 rounded-lg text-xs font-bold w-full hover:bg-emerald-600 transition duration-200 cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>Send Message (Free)</span>
                        </a>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] text-yellow-500 mb-2 font-mono flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Approximate Area Overlay
                        </p>
                        <button
                          onClick={async () => {
                            const res = await fetch("/api/payment", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                jobId: item.id,
                                amount: 50,
                                type: "UNLOCK_FEE",
                              }),
                            });
                            const data = await res.json();
                            if (data.paymentUrl) window.location.href = data.paymentUrl;
                          }}
                          className="bg-emerald-500 text-slate-950 px-3 py-2 rounded-lg text-xs font-bold w-full hover:bg-emerald-600 transition duration-200 cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Unlock Location (50 BDT)</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}
