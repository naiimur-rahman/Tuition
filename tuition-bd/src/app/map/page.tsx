"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[750px] lg:h-[800px] w-full bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse flex flex-col items-center justify-center space-y-3">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      <p className="text-slate-400 font-mono text-xs uppercase tracking-wider">Syncing map coordinates...</p>
    </div>
  ),
});

function MapSearchContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "tuition"; // 'tuition' or 'tutor'

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<string[]>([]);
  const [activeClasses, setActiveClasses] = useState<string[]>([]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200/60 dark:border-slate-800/80 pb-8 transition-colors duration-300">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[var(--foreground)] tracking-tight">
            {type === "tutor" ? (
              <>
                Find <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Tutors</span> Near You
              </>
            ) : (
              <>
                Find <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Tuition Jobs</span> Near You
              </>
            )}
          </h1>
          <p className="text-[var(--muted)] text-sm max-w-2xl leading-relaxed">
            {type === "tutor" ? (
              "Locations shown on the map are approximate (within ~800 meters) to protect privacy. Parents can view tutor credentials and unlock contact details inside their popup box."
            ) : (
              "Locations shown on the map are approximate (within ~800 meters) to protect privacy. Tutors can unlock exact coordinates and parent contacts inside their popup box."
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 h-fit space-y-6 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-heading text-[var(--foreground)] flex items-center">
                <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Search Filters
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5 font-mono uppercase tracking-wider">Multi-Select Parameters</p>
            </div>
            {(selectedSubjects.length > 0 || selectedClasses.length > 0) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-[10px] text-pink-400 hover:text-pink-300 font-mono font-bold uppercase transition duration-150 cursor-pointer border-none bg-transparent"
              >
                Reset
              </button>
            )}
          </div>

          <div className="h-px bg-slate-200/60 dark:bg-slate-800/80 transition-colors duration-300" />

          <div className="space-y-6">
            {/* Subjects Checkboxes */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--foreground)] opacity-75 font-bold">Subjects</label>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar bg-slate-900/30 p-2.5 rounded-xl border border-slate-850 font-sans">
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
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--foreground)] opacity-75 font-bold">Class / Medium</label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar bg-slate-900/30 p-2.5 rounded-xl border border-slate-850">
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
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2"
            >
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-3">
          <MapComponent type={type} subjects={activeSubjects} classLevels={activeClasses} />
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 flex flex-col relative">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading spatial datasets...</div>}>
        <MapSearchContent />
      </Suspense>
    </div>
  );
}
