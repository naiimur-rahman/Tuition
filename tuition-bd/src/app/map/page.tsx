"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import MapComponent from "@/components/map/Map";

function MapSearchContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "tuition"; // 'tuition' or 'tutor'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {type === "tutor" ? "Find Tutors Near You" : "Find Tuition Jobs Near You"}
        </h1>
        <p className="mt-2 text-gray-600">
          Locations shown are approximate. Pay a small unlock fee to view exact addresses and contact details.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option>All Subjects</option>
                <option>Mathematics</option>
                <option>English</option>
                <option>Physics</option>
                <option>Chemistry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Class / Medium</label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option>Any</option>
                <option>Class 1-5 (Bangla Medium)</option>
                <option>Class 6-8 (Bangla Medium)</option>
                <option>O Level</option>
                <option>A Level</option>
              </select>
            </div>

            <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Map Area */}
        <div className="w-full md:w-3/4">
          <MapComponent type={type} />
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">Loading map...</div>}>
        <MapSearchContent />
      </Suspense>
    </div>
  );
}
