"use client";
 
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
 
interface HeroProps {
  selectedRole?: "parent" | "tutor";
  onSelectRole?: (role: "parent" | "tutor") => void;
  onTriggerDemo?: () => void;
}
 
export default function Hero({ selectedRole, onSelectRole, onTriggerDemo }: HeroProps) {
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
  const [animationKey, setAnimationKey] = useState(0);
  const [mockIndex, setMockIndex] = useState(0);

  const mockTutors = useMemo(() => [
    { name: "Fahim Rahman", specs: "CSE Grad (BUET)", expertise: "Math, Physics & ICT", sector: "Banani Sector 4", coords: "23.7937° N, 90.4066° E" },
    { name: "Naimur Sohan", specs: "Physics Major (DU)", expertise: "Physics & Chemistry", sector: "Dhanmondi Road 12", coords: "23.7461° N, 90.3742° E" },
    { name: "Farhana Amin", specs: "English Honours (NSU)", expertise: "O/A Level English", sector: "Gulshan 2 Circle", coords: "23.7925° N, 90.4156° E" },
    { name: "Tahmid Islam", specs: "Chemistry Specialist (MC)", expertise: "Chemistry & Biology", sector: "Uttara Sector 11", coords: "23.8759° N, 90.3795° E" },
    { name: "Aisha Siddiqua", specs: "Math Expert (BUET)", expertise: "Higher Math & Calculus", sector: "Mirpur DOHS", coords: "23.8243° N, 90.3542° E" },
  ], []);

  const mockJobs = useMemo(() => [
    { title: "Mathematics Tutor Required", grade: "O Level (EDEXCEL)", salary: "12,000 BDT/month", sector: "Dhaka North", coords: "23.8103° N, 90.4125° E" },
    { title: "Physics & Chem Instructor", grade: "A Level (CIE)", salary: "15,000 BDT/month", sector: "Dhanmondi", coords: "23.7461° N, 90.3742° E" },
    { title: "Class 8 All-Subject Guide", grade: "National Curriculum", salary: "8,500 BDT/month", sector: "Mirpur 10", coords: "23.8069° N, 90.3687° E" },
    { title: "ICT & Computer Coding Mentor", grade: "Junior Programmer Level", salary: "18,000 BDT/month", sector: "Gulshan 1", coords: "23.7801° N, 90.4178° E" },
    { title: "English Language Specialist", grade: "IELTS Preparation", salary: "20,000 BDT/month", sector: "Uttara Sector 3", coords: "23.8687° N, 90.3985° E" },
  ], []);
 
  // Detect mobile screens to disable expensive blur animations
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [terminalText, setTerminalText] = useState("");
  const [terminalPhase, setTerminalPhase] = useState<"typing" | "submitting" | "results">("typing");
  const [showStatus, setShowStatus] = useState(false);
  const [showCoords, setShowCoords] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Single self-cleaning typewriter state machine loop to prevent race conditions & duplicate intervals
  useEffect(() => {
    // Reset all state values immediately before typing
    setTerminalText("");
    setTerminalPhase("typing");
    setShowStatus(false);
    setShowCoords(false);
    setShowCard(false);
    setShowPrompt(false);

    const command = selectedRole
      ? (selectedRole === "parent"
        ? "tutor--search --verified --radius=1.5km"
        : "tuition--search --dhaka --radius=1.5km")
      : "tuition-console --live-scan --dhaka";

    let typingInterval: NodeJS.Timeout | null = null;
    let submitTimeout: NodeJS.Timeout | null = null;
    let statusTimeout: NodeJS.Timeout | null = null;
    let coordsTimeout: NodeJS.Timeout | null = null;
    let cardTimeout: NodeJS.Timeout | null = null;
    let promptTimeout: NodeJS.Timeout | null = null;
    let resetTimeout: NodeJS.Timeout | null = null;

    // Start typing command letter-by-letter
    typingInterval = setInterval(() => {
      setTerminalText((prev) => {
        if (prev.length >= command.length) {
          if (typingInterval) clearInterval(typingInterval);
          return prev;
        }

        const nextChar = command.charAt(prev.length);
        const nextText = prev + nextChar;

        // When the final character is appended, clear interval and trigger stdout sequence
        if (nextText.length === command.length) {
          if (typingInterval) clearInterval(typingInterval);
          
          // Brief pause after command is fully typed (simulates enter key pause)
          submitTimeout = setTimeout(() => {
            setTerminalPhase("submitting");
            
            // Shift to active result streaming stage
            submitTimeout = setTimeout(() => {
              setTerminalPhase("results");
              
              // Stagger stdout data prints
              statusTimeout = setTimeout(() => setShowStatus(true), 300);
              coordsTimeout = setTimeout(() => setShowCoords(true), 900);
              cardTimeout = setTimeout(() => setShowCard(true), 1700);
              promptTimeout = setTimeout(() => setShowPrompt(true), 2500);

              // Hold results visible, then increment loop index to trigger next scan
              resetTimeout = setTimeout(() => {
                setMockIndex((prevIndex) => (prevIndex + 1) % 5);
              }, 7500);

            }, 400);
          }, 200);
        }

        return nextText;
      });
    }, 45); // Natural typing speed: 45ms per character

    // Absolute cleanup: halts every timer and active interval on unmount or refresh
    return () => {
      if (typingInterval) clearInterval(typingInterval);
      if (submitTimeout) clearTimeout(submitTimeout);
      if (statusTimeout) clearTimeout(statusTimeout);
      if (coordsTimeout) clearTimeout(coordsTimeout);
      if (cardTimeout) clearTimeout(cardTimeout);
      if (promptTimeout) clearTimeout(promptTimeout);
      if (resetTimeout) clearTimeout(resetTimeout);
    };
  }, [selectedRole, mockIndex]);

  // Reset typewriter when user changes their role dynamically
  useEffect(() => {
    setCurrentWordIndex(0);
    setCurrentText("");
    setIsDeleting(false);
    setMockIndex(0);
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
            <div className="space-y-6 pt-6">
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 flex-wrap"
              >
                {/* Find a Tutor Button */}
                {(!selectedRole || selectedRole === "parent") && (
                  <Link href="/map?type=tutor" className="w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-black px-7 py-4 rounded-2xl text-base transition-all duration-300 cursor-pointer shadow-[0_8px_30px_rgba(16,185,129,0.3)] border-none overflow-hidden flex items-center justify-center tracking-wide font-sans"
                    >
                      {/* Shimmer light effect */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" style={{ animationDuration: '1.5s' }} />
                      
                      <span>Find a Tutor</span>
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.button>
                  </Link>
                )}

                {/* Find Tuition Jobs Button */}
                {(!selectedRole || selectedRole === "tutor") && (
                  <Link href="/map?type=tuition" className="w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative w-full sm:w-auto px-7 py-4 rounded-2xl text-base transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center tracking-wide font-sans font-black ${
                        selectedRole === "tutor"
                          ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 border-none shadow-[0_8px_30px_rgba(16,185,129,0.3)]"
                          : "bg-slate-950/60 hover:bg-slate-900 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:border-indigo-400 shadow-[0_4px_15px_rgba(99,102,241,0.15)]"
                      }`}
                    >
                      {selectedRole === "tutor" && (
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" style={{ animationDuration: '1.5s' }} />
                      )}
                      <span>Find Tuition Jobs</span>
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.button>
                  </Link>
                )}

                {/* Optional Satellite Matching Video Demo button */}
                {onTriggerDemo && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onTriggerDemo}
                    className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-800/80 text-emerald-400 border border-emerald-500/20 px-6 py-4 rounded-2xl text-base transition-all duration-300 cursor-pointer flex items-center justify-center tracking-wide font-sans font-bold"
                  >
                    <svg className="w-5 h-5 mr-2 animate-pulse text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>How it Works</span>
                  </motion.button>
                )}
              </motion.div>

              {/* Login / Signup Sub-pill */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center lg:justify-start"
              >
                <div className="glass-card flex items-center p-1.5 rounded-full border border-slate-800/80 bg-slate-950/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-emerald-500/20 transition-all duration-300 text-[10px] md:text-xs font-mono tracking-wider font-extrabold space-x-6 pl-5 pr-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <Link href="/login" className="text-slate-400 hover:text-white transition-colors uppercase tracking-widest cursor-pointer font-bold">
                      Log in
                    </Link>
                  </div>
                  <div className="h-4 w-px bg-slate-800" />
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 px-6 py-2.5 rounded-full font-sans font-black tracking-widest uppercase transition-colors cursor-pointer text-[10px] md:text-xs border-none shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:brightness-110"
                    >
                      Sign up
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
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
            <div className="relative glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl keep-dark">
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
              <div className="p-6 font-mono text-xs sm:text-sm text-slate-300 space-y-4 h-[390px] overflow-hidden bg-slate-950/40">
                <div className="space-y-4">
                  {/* Command Input Prompt */}
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-emerald-400 font-bold flex-shrink-0 whitespace-nowrap">guest@tuition-console:~$</span>
                    <span className="text-white whitespace-nowrap overflow-hidden">
                      {terminalText}
                    </span>
                    {(terminalPhase === "typing" || terminalPhase === "submitting") && (
                      <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block align-middle flex-shrink-0" />
                    )}
                  </div>

                  {/* Status Message */}
                  {showStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-slate-500 text-[11px]"
                    >
                      {selectedRole
                        ? (selectedRole === "parent"
                          ? "[i] Initiating parent-educator grid link..."
                          : "[i] Initializing active spatial coordination...")
                        : (mockIndex % 2 === 0
                          ? "[i] Scanning Dhaka sectors for verified tutors..."
                          : "[i] Scanning Dhaka coordinates for live student requests...")}
                    </motion.div>
                  )}

                  {/* Coordinates & Location Status */}
                  {showCoords && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5 text-[11px]"
                    >
                      <div className="text-emerald-400/90 font-bold">
                        ✓ Coordinates Loaded ({selectedRole === "parent" || (!selectedRole && mockIndex % 2 === 0) ? mockTutors[mockIndex].coords : mockJobs[mockIndex].coords})
                      </div>
                      <div className="text-slate-400">
                        {selectedRole === "parent" || (!selectedRole && mockIndex % 2 === 0)
                          ? "🔍 Locating nearest active educators..."
                          : "🔍 Fetching matching listings..."}
                      </div>
                    </motion.div>
                  )}

                  {/* Search Results Card */}
                  {showCard && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2 text-[11px] sm:text-xs shadow-md"
                    >
                      {selectedRole === "parent" || (!selectedRole && mockIndex % 2 === 0) ? (
                        <>
                          <div className="flex justify-between text-slate-200">
                            <span className="font-bold text-emerald-400">Tutor Profile Found</span>
                            <span className="text-slate-500">{mockTutors[mockIndex].sector}</span>
                          </div>
                          <div className="h-px bg-slate-800" />
                          <div className="text-slate-400 font-sans">
                            <span className="font-bold text-slate-300 font-mono">Educator:</span> {mockTutors[mockIndex].name}<br />
                            <span className="font-bold text-slate-300 font-mono">Specs:</span> {mockTutors[mockIndex].specs}<br />
                            <span className="font-bold text-slate-300 font-mono">Expertise:</span> {mockTutors[mockIndex].expertise}
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
                            <span className="text-slate-500">{mockJobs[mockIndex].sector}</span>
                          </div>
                          <div className="h-px bg-slate-800" />
                          <div className="text-slate-400 font-sans">
                            <span className="font-bold text-slate-300 font-mono">Job:</span> {mockJobs[mockIndex].title}<br />
                            <span className="font-bold text-slate-300 font-mono">Class:</span> {mockJobs[mockIndex].grade}<br />
                            <span className="font-bold text-slate-300 font-mono">Salary:</span> {mockJobs[mockIndex].salary}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-yellow-500 font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 font-sans">Approximate Location Secured</span>
                            <span className="text-[10px] text-emerald-400 font-bold font-sans">Ready</span>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Bottom Blinking Prompt */}
                  {showPrompt && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2 pt-1"
                    >
                      <span className="text-emerald-400">guest@tuition-console:~$</span>
                      <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
