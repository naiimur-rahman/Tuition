"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingGatewayProps {
  onSelectRole: (role: "parent" | "tutor") => void;
}

export default function OnboardingGateway({ onSelectRole }: OnboardingGatewayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Lock body scroll when selection modal is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const handleSelection = (role: "parent" | "tutor") => {
    sessionStorage.setItem("userRole", role);
    onSelectRole(role);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-2xl flex items-start md:items-center justify-center p-4 overflow-y-auto"
        >
          {/* Cyber Decorative Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none" />

          <div className="relative max-w-4xl w-full mx-auto text-center py-4 sm:py-8 z-10 space-y-6 sm:space-y-10 my-auto">
            {/* Header / Brand Title */}
            <div className="space-y-3">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-xs text-emerald-400 font-mono tracking-widest uppercase">System Initialization</span>
              </motion.div>

              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading px-2"
              >
                Welcome to <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">Tuition Console</span>
              </motion.h1>

              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 max-w-lg mx-auto text-xs sm:text-sm md:text-base font-sans leading-relaxed px-4"
              >
                Select your tactical workspace sector to configure interactive coordinate scans and matching algorithms.
              </motion.p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto px-4 w-full">
              {/* Option 1: Searching for Home Tutor */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelection("parent")}
                className="glass-card group border border-slate-800 hover:border-emerald-500/50 p-5 sm:p-8 rounded-2xl text-left cursor-pointer transition-all duration-300 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[200px] sm:min-h-[260px]"
              >
                {/* Glowing Hover Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="space-y-3 sm:space-y-4">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center justify-center transition-all duration-300">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300 font-heading">
                      I'm searching Home Tutor
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                      For Parents & Students. Locate highly qualified, verified educators near your coordinates. Create job listings, view profiles, and matching rosters.
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-[10px] sm:text-xs font-mono text-emerald-400 mt-4 sm:mt-6 tracking-wider font-bold uppercase group-hover:translate-x-1.5 transition-transform duration-300">
                  Enter Sector Alpha
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>

              {/* Option 2: Looking for Tuition Jobs */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelection("tutor")}
                className="glass-card group border border-slate-800 hover:border-indigo-500/50 p-5 sm:p-8 rounded-2xl text-left cursor-pointer transition-all duration-300 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[200px] sm:min-h-[260px]"
              >
                {/* Glowing Hover Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="space-y-3 sm:space-y-4">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center transition-all duration-300">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-300 font-heading">
                      I need Tuition Jobs
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                      For Tutors & Teachers. Discover active parent listings, filter locations, upload credentials, and unlock exact job coordinates via bKash.
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-[10px] sm:text-xs font-mono text-indigo-400 mt-4 sm:mt-6 tracking-wider font-bold uppercase group-hover:translate-x-1.5 transition-transform duration-300">
                  Enter Sector Beta
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
