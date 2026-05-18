"use client";
 
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
 
interface HeroProps {
  selectedRole?: "parent" | "tutor";
}
 
export default function Hero({ selectedRole }: HeroProps) {
  const words = useMemo(() => {
    return selectedRole === "parent"
      ? ["tutor near you", "home educator", "academic specialist", "matching mentor"]
      : selectedRole === "tutor"
        ? ["tuition match", "premium job", "student request", "teaching vacancy"]
        : ["tutor near you", "tuition match", "home educator", "academic guide"];
  }, [selectedRole]);
 
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [isMobile, setIsMobile] = useState(true);
 
  // Detect mobile screens to disable expensive blur animations
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset typewriter when user changes their role dynamically
  useEffect(() => {
    setCurrentWordIndex(0);
    setCurrentText("");
    setIsDeleting(false);
  }, [selectedRole]);
 
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleType = () => {
      if (words.length === 0) return;
      const fullWord = words[currentWordIndex % words.length];
      if (!isDeleting) {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setTypingSpeed(100);
        if (currentText === fullWord) {
          timer = setTimeout(() => setIsDeleting(true), 1500);
          return;
        }
      } else {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypingSpeed(50);
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          return;
        }
      }
      
      timer = setTimeout(handleType, typingSpeed);
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, typingSpeed, words, selectedRole]);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 lg:py-24">
      {/* Background Decorative Glowing Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={isMobile ? undefined : {
            x: [0, 40, -20, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="hidden md:block absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full filter blur-[100px]"
        />
        <motion.div
          animate={isMobile ? undefined : {
            x: [0, -30, 40, 0],
            y: [0, 60, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="hidden md:block absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full filter blur-[120px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl tracking-tight font-extrabold text-[var(--foreground)] sm:text-5xl md:text-6xl font-heading leading-tight"
            >
              Find the perfect <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                {currentText}
              </span>
              <span className="inline-block w-[3px] h-[0.85em] bg-emerald-400 ml-1.5 align-middle animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </motion.h1>

            {/* Sub-text */}
            <motion.p
              variants={itemVariants}
              className="max-w-2xl mx-auto lg:mx-0 text-base text-[var(--muted)] sm:text-lg md:text-xl font-normal leading-relaxed"
            >
              {selectedRole === "parent"
                ? "Locate highly qualified, verified educators near your coordinates. Access O/A level specialists, university scholars, and experienced mentors for personalized in-home tutoring."
                : selectedRole === "tutor"
                  ? "Discover active tuition listings in Dhaka. Filter vacancies by class, subject, and salary, submit university credentials to gain parent trust, and secure your next role."
                  : "Connect with verified educators and discover premium tuition opportunities in Bangladesh via our responsive, glassmorphic map console. Perfect precision at your coordinates."}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              {/* Find a Tutor Button */}
              {(!selectedRole || selectedRole === "parent") && (
                <Link href="/map?type=tutor" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(16,185,129,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center justify-center"
                  >
                    Find a Tutor
                    <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.button>
                </Link>
              )}

              {/* Find Tuition Jobs Button */}
              {(!selectedRole || selectedRole === "tutor") && (
                <Link href="/map" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(16,185,129,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center justify-center"
                  >
                    Find Tuition Jobs
                  </motion.button>
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* Right Hero Content: Interactive Terminal Mock */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.4 }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl filter blur-2xl pointer-events-none" />

            {/* Terminal Window Container */}
            <div className="relative glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              {/* Terminal Titlebar */}
              <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-[11px] font-mono text-slate-500 tracking-wider">
                  bash - tuition-console-session
                </div>
                <div className="w-4" /> {/* Spacer */}
              </div>

              {/* Terminal Contents */}
              <div className="p-6 font-mono text-xs sm:text-sm text-slate-300 space-y-4 min-h-[280px] bg-slate-950/40">
                {!selectedRole ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">guest@tuition-console:~$</span>
                    <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block" />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-bold">guest@tuition-console:~$</span>
                      <span className="text-white">
                        {selectedRole === "parent"
                          ? "tutor-search --verified --radius=1.5km"
                          : "tuition-search --dhaka --radius=1.5km"}
                      </span>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-slate-500"
                    >
                      {selectedRole === "parent"
                        ? "[i] Initiating parent-educator grid link..."
                        : "[i] Initializing active spatial coordination..."}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="space-y-1.5"
                    >
                      <div className="text-emerald-400/90 font-bold">✓ Coordinates Loaded (23.8103° N, 90.4125° E)</div>
                      <div className="text-slate-400">
                        {selectedRole === "parent"
                          ? "🔍 Locating nearest active educators..."
                          : "🔍 Fetching matching listings..."}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.2 }}
                      className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2 text-[11px] sm:text-xs"
                    >
                      {selectedRole === "parent" ? (
                        <>
                          <div className="flex justify-between text-slate-200">
                            <span className="font-bold text-emerald-400">Tutor Profile Found</span>
                            <span className="text-slate-500">Banani Sector 4</span>
                          </div>
                          <div className="h-px bg-slate-800" />
                          <div className="text-slate-400 font-sans">
                            <span className="font-bold text-slate-300 font-mono">Educator:</span> Fahim Rahman<br />
                            <span className="font-bold text-slate-300 font-mono">Specs:</span> CSE Grad (BUET)<br />
                            <span className="font-bold text-slate-300 font-mono">Expertise:</span> Math, Physics & ICT
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-sans">
                              ✓ University Verified
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold font-sans">Active Match</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-slate-200">
                            <span className="font-bold text-emerald-400">Listing Found</span>
                            <span className="text-slate-500">Dhaka North</span>
                          </div>
                          <div className="h-px bg-slate-800" />
                          <div className="text-slate-400 font-sans">
                            <span className="font-bold text-slate-300 font-mono">Job:</span> Mathematics Tutor Required<br />
                            <span className="font-bold text-slate-300 font-mono">Class:</span> O Level (EDEXCEL)<br />
                            <span className="font-bold text-slate-300 font-mono">Salary:</span> 12,000 BDT/month
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-yellow-500 font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 font-sans">Approximate Location Secured</span>
                            <span className="text-[10px] text-emerald-400 font-bold font-sans">Ready</span>
                          </div>
                        </>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3.5 }}
                      className="flex items-center space-x-2 pt-1"
                    >
                      <span className="text-emerald-400">guest@tuition-console:~$</span>
                      <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block" />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
