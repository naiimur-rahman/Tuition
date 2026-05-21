"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import NavbarWrapper from "@/components/NavbarWrapper";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] sm:h-[600px] lg:h-[800px] w-full bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse flex flex-col items-center justify-center space-y-3">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      <p className="text-slate-400 font-mono text-xs uppercase tracking-wider">Syncing map coordinates...</p>
    </div>
  ),
});

function MapSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "tuition"; // 'tuition' or 'tutor'

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<string[]>([]);
  const [activeClasses, setActiveClasses] = useState<string[]>([]);

  // Hoisted state from Map component to place controls outside the map
  const [searchRadius, setSearchRadius] = useState<1.5 | 3 | 5>(1.5);
  const [metrics, setMetrics] = useState({ total: 0, within: 0, outside: 0 });

  const handleApplyFilters = () => {
    setActiveSubjects(selectedSubjects);
    setActiveClasses(selectedClasses);
  };

  const handleClearFilters = () => {
    setSelectedSubjects([]);
    setSelectedClasses([]);
    setActiveSubjects([]);
    setActiveClasses([]);
  };

  return (
    <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-800/80 light:border-slate-200/60 pb-6 transition-colors duration-300">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[var(--foreground)] tracking-tight">
            {type === "tutor" ? (
              <>
                Find <span className="text-emerald-400">Tutors</span> Near You
              </>
            ) : (
              <>
                Find <span className="text-emerald-400">Tuition Jobs</span> Near You
              </>
            )}
          </h1>
          <p className="text-[var(--muted)] text-xs max-w-2xl leading-relaxed font-mono">
            {type === "tutor" ? (
              "Browse elite local educators. Pins show approximate teaching zones to protect privacy. Click a pulsing marker to view credentials and request an unlock."
            ) : (
              "Explore live tuition postings. Pins show approximate student zones to protect privacy. Click a pulsing marker to view budget details and request an unlock."
            )}
          </p>
        </div>

        {/* Segmented Switcher for Map Mode */}
        <div className="flex bg-slate-900/80 light:bg-slate-100 p-1 rounded-2xl border border-slate-800/80 light:border-slate-200/60 max-w-md w-full md:w-auto shrink-0 shadow-lg select-none">
          <button 
            onClick={() => router.push('/map?type=tutor')}
            className={`flex-1 md:flex-none py-2.5 px-5 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer text-center ${
              type === 'tutor' 
                ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_12px_rgba(20,184,166,0.2)]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Find Tutors
          </button>
          <button 
            onClick={() => router.push('/map?type=tuition')}
            className={`flex-1 md:flex-none py-2.5 px-5 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer text-center ${
              type === 'tuition' 
                ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_12px_rgba(20,184,166,0.2)]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Find Tuition Jobs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Left Control Panel / Stacked Sidebar Cards */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
          
          {/* Card 1: Map Navigation Guide */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 light:border-slate-200/60 space-y-4 transition-all duration-300">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] font-mono text-slate-200 light:text-slate-800 uppercase tracking-wider font-extrabold">
                Navigation Guide
              </span>
            </div>
            <div className="h-px bg-slate-800/80 light:bg-slate-200/60" />
            <div className="space-y-3 text-[11px] text-slate-400 leading-relaxed font-sans">
              <div className="flex gap-2">
                <span className="bg-slate-900 border border-slate-800 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[9px] shrink-0">1</span>
                <p>
                  <strong className="text-slate-300">Pan & Zoom:</strong> Drag maps or scroll to inspect target neighborhoods.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="bg-slate-900 border border-slate-800 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[9px] shrink-0">2</span>
                <p>
                  <strong className="text-slate-300">Pulsing Beacons:</strong> Click on {type === "tutor" ? "green verified educators" : "cyan jobs"} inside the {searchRadius} km radius.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="bg-slate-900 border border-slate-800 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[9px] shrink-0">3</span>
                <p>
                  <strong className="text-slate-300">Details & Apply:</strong> Inspect credentials and apply directly from the popup.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Proximity Radius & Live Metrics */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 light:border-slate-200/60 space-y-4 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">
                Search Proximity Range
              </span>
              <span className="text-[9px] font-mono bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800/80">
                Spatial Radius
              </span>
            </div>
            <div className="h-px bg-slate-800/80 light:bg-slate-200/60" />

            {/* Radius Selection Buttons */}
            <div className="flex items-center gap-2">
              {([1.5, 3, 5] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSearchRadius(r)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer border ${
                    searchRadius === r
                      ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.35)]"
                      : "bg-slate-900 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>

            <div className="h-px bg-slate-800/80 light:bg-slate-200/60" />

            {/* Merged Live Metrics / Map Numbers */}
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 space-y-2 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Items Loaded:</span>
                <span className="text-white font-bold">{metrics.total}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Within Active Proximity:</span>
                <span className="text-emerald-400 font-bold">{metrics.within}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Outside Query Range:</span>
                <span className="text-amber-400 font-bold">{metrics.outside}</span>
              </div>
            </div>

            <div className="h-px bg-slate-800/80 light:bg-slate-200/60" />

            {/* Legend Indicators */}
            <div className="space-y-2 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Teal: Search Boundary ({searchRadius} km)</span>
              </div>
              {type !== "tutor" ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>Cyan: Available Tuition Jobs</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Green: Verified Tutors Directory</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Search Filters */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 light:border-slate-200/60 space-y-6 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-heading text-[var(--foreground)] flex items-center">
                  <svg className="w-4.5 h-4.5 mr-2 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Search Filters
                </h2>
                <p className="text-[10px] text-[var(--muted)] mt-0.5 font-mono uppercase tracking-wider">Multi-Select Parameters</p>
              </div>
              {(selectedSubjects.length > 0 || selectedClasses.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono font-bold uppercase transition duration-150 cursor-pointer border-none bg-transparent"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="h-px bg-slate-800/80 light:bg-slate-200/60 transition-colors duration-300" />

            <div className="space-y-5">
              {/* Subjects Checkboxes */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--foreground)] opacity-75 font-bold">Subjects</label>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar bg-slate-900/30 p-2.5 rounded-xl border border-slate-850 font-sans">
                  {[
                    "Bangla",
                    "English",
                    "Mathematics",
                    "Higher Math",
                    "Physics",
                    "Chemistry",
                    "Biology",
                    "General Science",
                    "ICT & Computing",
                    "Accounting",
                    "Finance & Banking",
                    "Business Studies",
                    "Economics",
                    "Social Science"
                  ].map((sub) => {
                    const isChecked = selectedSubjects.includes(sub);
                    return (
                      <label key={sub} className="flex items-center space-x-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
                            } else {
                              setSelectedSubjects([...selectedSubjects, sub]);
                            }
                          }}
                          className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 w-4 h-4 cursor-pointer transition-all"
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Class / Medium Checkboxes */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--foreground)] opacity-75 font-bold">Class / Medium</label>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar bg-slate-900/30 p-2.5 rounded-xl border border-slate-850">
                  {[
                    "Play",
                    "Nursery",
                    "KG",
                    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
                    "Class 6", "Class 7", "Class 8",
                    "Class 9",
                    "Class 10 (SSC)",
                    "Class 11 (HSC 1st Year)",
                    "Class 12 (HSC 2nd Year)",
                    "O-Level",
                    "A-Level",
                    "Admission Test",
                    "University",
                  ].map((cl) => {
                    const isChecked = selectedClasses.includes(cl);
                    return (
                      <label key={cl} className="flex items-center space-x-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedClasses(selectedClasses.filter((c) => c !== cl));
                            } else {
                              setSelectedClasses([...selectedClasses, cl]);
                            }
                          }}
                          className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 w-4 h-4 cursor-pointer transition-all"
                        />
                        <span>{cl}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(var(--theme-rgb),0.15)] flex items-center justify-center space-x-2 border-none"
              >
                <span>Apply Filters</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Immensely Wide Map Container */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <MapComponent 
            type={type} 
            subjects={activeSubjects} 
            classLevels={activeClasses} 
            searchRadius={searchRadius}
            setSearchRadius={setSearchRadius}
            onMetricsChange={setMetrics}
          />
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 flex flex-col relative">
      <NavbarWrapper />
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading spatial datasets...</div>}>
        <MapSearchContent />
      </Suspense>
    </div>
  );
}
