"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingGatewayProps {
  onSelectRole: (role: "parent" | "tutor") => void;
}

export default function OnboardingGateway({ onSelectRole }: OnboardingGatewayProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Lock both body and HTML scroll to absolutely prevent scroll bleeding on mobile viewports
  useEffect(() => {
    if (isVisible) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
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
          className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md md:backdrop-blur-xl flex items-start md:items-center justify-center p-4 overflow-y-auto"
        >
          {/* Cyber Decorative Ambient Background Glows */}
          <div className="hidden md:block absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none" />
          <div className="hidden md:block absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none" />
 
          <div className="relative max-w-4xl w-full mx-auto text-center py-4 sm:py-8 z-10 space-y-6 sm:space-y-10 my-auto">
            {/* Header / Brand Logo & Title */}
            <div className="space-y-4 flex flex-col items-center">
              {/* Playful Floating/Bouncing Custom SVG Logo */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative z-10 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                  <img src="/logo.png" alt="TutorHire Logo" className="h-16 sm:h-20 w-auto invert" />
                </div>
              </motion.div>
 
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="tracking-tight font-heading px-2 flex flex-col items-center"
              >
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Welcome to</span>
                <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-emerald-400 drop-shadow-sm mt-1 whitespace-nowrap">
                  TutorHire
                </span>
              </motion.h1>
 
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="text-slate-400 max-w-lg mx-auto text-xs sm:text-sm md:text-base font-sans leading-relaxed px-4"
              >
                Select your mode to initialize queries, scan location maps, and launch the matching engine.
              </motion.p>
            </div>
 
            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto px-4 w-full">
              {/* Option 1: Searching for Home Tutor */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleSelection("parent")}
                className="glass-card group border border-slate-800 hover:border-emerald-500/50 p-5 sm:p-8 rounded-2xl text-left cursor-pointer transition-all duration-300 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[200px] sm:min-h-[260px]"
              >
                {/* Glowing Hover Background */}
                <div className="absolute inset-0 bg-emerald-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
 
                 <div className="space-y-3 sm:space-y-4">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(var(--theme-rgb),0.25)] flex items-center justify-center transition-all duration-300">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
  
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300 font-heading">
                      I am a Parent / Student
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                      Find verified home tutors near your location. Post class requests and view tutor profiles.
                    </p>
                  </div>
                </div>
  
                <div className="flex items-center text-[10px] sm:text-xs font-mono text-emerald-400 mt-4 sm:mt-6 tracking-wider font-bold uppercase group-hover:translate-x-1.5 transition-transform duration-300">
                  Enter Parent Portal
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
  
              {/* Option 2: Looking for Tuition Jobs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleSelection("tutor")}
                className="glass-card group border border-slate-800 hover:border-indigo-500/50 p-5 sm:p-8 rounded-2xl text-left cursor-pointer transition-all duration-300 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[200px] sm:min-h-[260px]"
              >
                {/* Glowing Hover Background */}
                <div className="absolute inset-0 bg-indigo-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  
                 <div className="space-y-3 sm:space-y-4">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center transition-all duration-300">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
  
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-300 font-heading">
                      I am a Tutor / Educator
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                      Discover active tuition jobs in Bangladesh. Browse student requests and secure teaching vacancies.
                    </p>
                  </div>
                </div>
  
                <div className="flex items-center text-[10px] sm:text-xs font-mono text-indigo-400 mt-4 sm:mt-6 tracking-wider font-bold uppercase group-hover:translate-x-1.5 transition-transform duration-300">
                  Tutor Platform Dashboard
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
