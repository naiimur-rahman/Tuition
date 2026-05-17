"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import MapComponent from "@/components/map/Map";

function MapSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "tuition"; // 'tuition' or 'tutor'

  const [subject, setSubject] = useState("All Subjects");
  const [classLevel, setClassLevel] = useState("Any");
  const [activeSubject, setActiveSubject] = useState("All Subjects");
  const [activeClassLevel, setActiveClassLevel] = useState("Any");

  const handleApplyFilters = () => {
    setActiveSubject(subject);
    setActiveClassLevel(classLevel);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
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
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Locations shown on the map are approximate (within ~800 meters) to protect privacy. Tutors can unlock exact coordinates and parent contacts inside their popup box.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center h-fit w-fit">
          <button
            onClick={() => router.push("/map")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              type !== "tutor"
                ? "bg-emerald-500 text-slate-950 shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tuition Jobs
          </button>
          <button
            onClick={() => router.push("/map?type=tutor")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              type === "tutor"
                ? "bg-emerald-500 text-slate-950 shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tutors List
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-1/4 glass-card p-6 rounded-2xl border border-slate-800 h-fit space-y-6">
          <div>
            <h2 className="text-lg font-bold font-heading text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Search Filters
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Coordinates matching parameters</p>
          </div>

          <div className="h-px bg-slate-800/80" />

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
              >
                <option>All Subjects</option>
                <option>Mathematics</option>
                <option>English</option>
                <option>Physics</option>
                <option>Chemistry</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Class / Medium</label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
              >
                <option>Any</option>
                <option>Class 1-5 (Bangla Medium)</option>
                <option>Class 6-8 (Bangla Medium)</option>
                <option>O Level</option>
                <option>A Level</option>
              </select>
            </div>

            <button
              onClick={handleApplyFilters}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.1)] flex items-center justify-center space-x-2"
            >
              <span>Apply Config</span>
            </button>
          </div>
        </div>

        {/* Map Area */}
        <div className="w-full lg:w-3/4">
          <MapComponent type={type} subject={activeSubject} classLevel={activeClassLevel} />
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading spatial datasets...</div>}>
        <MapSearchContent />
      </Suspense>
    </div>
  );
}
