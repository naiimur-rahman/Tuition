"use client";
 
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { DEFAULT_TUTORS, DEFAULT_JOBS } from "@/constants/mockData";
 
interface HeroProps {
  onTriggerDemo?: () => void;
}
 
export default function Hero({ onTriggerDemo }: HeroProps) {
  const words = useMemo(() => {
    return ["tutor near you", "tuition match", "home educator", "academic guide"];
  }, []);
 
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [isMobile, setIsMobile] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [mockIndex, setMockIndex] = useState(0);

  const [tutors, setTutors] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [tutorsRes, jobsRes] = await Promise.all([
          fetch("/api/users?role=TUTOR"),
          fetch("/api/jobs")
        ]);
        if (tutorsRes.ok && jobsRes.ok) {
          const tutorsData = await tutorsRes.json();
          const jobsData = await jobsRes.json();
          
          if (tutorsData && tutorsData.length > 0) {
            const mappedTutors = tutorsData.map((t: any, index: number) => {
              const p = t.profile || {};
              const defaultNames = ["Fahim Rahman", "Naimur Sohan", "Farhana Amin", "Tahmid Islam", "Aisha Siddiqua", "Sajid Hasan"];
              const realName = t.name && t.name !== "undefined" ? t.name : (defaultNames[index % defaultNames.length]);
              return {
                name: realName,
                specs: p.education || "Undergraduate Student",
                expertise: p.bio || "Mathematics & Sciences",
                sector: p.address || "Bangladesh",
                coords: `${p.approxLatitude?.toFixed(4) ?? (23.7 + Math.random() * 0.1).toFixed(4)}° N, ${p.approxLongitude?.toFixed(4) ?? (90.3 + Math.random() * 0.1).toFixed(4)}° E`
              };
            });
            setTutors(mappedTutors);
          }
          
          if (jobsData && jobsData.length > 0) {
            const mappedJobs = jobsData.map((j: any) => {
              const rawTitle = j.title || "Tuition Job";
              const cleanTitle = rawTitle.length > 26 ? rawTitle.substring(0, 25) + "..." : rawTitle;
              return {
                title: cleanTitle,
                grade: `${j.classLevel || "Any Class"} (${j.subject || "All Subjects"})`,
                salary: `${j.salary?.toLocaleString() ?? "Negotiable"} BDT/month`,
                sector: j.address || "Bangladesh",
                description: j.description || "No description provided.",
                coords: `${j.approxLat?.toFixed(4) ?? (23.7 + Math.random() * 0.1).toFixed(4)}° N, ${j.approxLng?.toFixed(4) ?? (90.3 + Math.random() * 0.1).toFixed(4)}° E`
              };
            });
            setJobs(mappedJobs);
          }
        }
      } catch (err) {
        console.error("Hero live load error", err);
      }
    }
    loadData();
  }, []);

  const activeTutors = tutors.length > 0 ? tutors : DEFAULT_TUTORS;
  const activeJobs = jobs.length > 0 ? jobs : DEFAULT_JOBS;

  const jobIndex = Math.floor(mockIndex / 2) % activeJobs.length;
  const tutorIndex = Math.floor(mockIndex / 2) % activeTutors.length;

  const currentTutor = activeTutors[tutorIndex];
  const currentJob = activeJobs[jobIndex];

  const shortTutorName = currentTutor 
    ? (currentTutor.name.split(" ")[0] + (currentTutor.name.split(" ")[1] ? ` ${currentTutor.name.split(" ")[1][0]}.` : ""))
    : "Fahim R.";
  const shortJobTitle = currentJob
    ? (currentJob.title.length > 18 ? currentJob.title.substring(0, 17) + "..." : currentJob.title)
    : "Grade 10 Math";

  // Dynamic coordinates on the simulated map preview
  const tutorPositions = [
    { top: "25%", left: "30%" },
    { top: "35%", left: "65%" },
    { top: "20%", left: "45%" },
    { top: "45%", left: "20%" },
    { top: "30%", left: "70%" },
  ];
  const jobPositions = [
    { bottom: "20%", right: "32%" },
    { bottom: "40%", right: "15%" },
    { bottom: "25%", right: "60%" },
    { bottom: "35%", right: "40%" },
    { bottom: "15%", right: "25%" },
  ];
  
  const currentTutorPos = tutorPositions[mockIndex % tutorPositions.length];
  const currentJobPos = jobPositions[mockIndex % jobPositions.length];
 
  // Detect mobile screens to disable expensive blur animations
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Periodic slide cycle loop for preview matches
  useEffect(() => {
    const interval = setInterval(() => {
      setMockIndex((prevIndex) => (prevIndex + 1) % 100);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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
  }, [currentText, isDeleting, currentWordIndex, typingSpeed, words]);

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
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-6 pb-16 lg:pt-8 lg:pb-24">
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
              <span className="text-emerald-400 drop-shadow-sm">
                {currentText}
              </span>
              <span className="inline-block w-[3px] h-[0.85em] bg-emerald-400 ml-1.5 align-middle animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </motion.h1>

            {/* Sub-text */}
            <motion.p
              variants={itemVariants}
              className="max-w-2xl mx-auto lg:mx-0 text-base text-[var(--muted)] sm:text-lg md:text-xl font-normal leading-relaxed"
            >
              First ever in Bangladesh. Connect with verified educators and discover premium tuition jobs at your exact coordinates.
            </motion.p>
 
            {/* CTAs */}
            <div className="space-y-6 pt-6">
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 flex-wrap"
              >
                {/* Find a Tutor Button */}
                <Link href="/map?type=tutor" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full sm:w-auto bg-emerald-500 text-white font-black px-7 py-4 rounded-2xl text-base transition-all duration-300 cursor-pointer shadow-[0_8px_30px_rgba(16,185,129,0.3)] border-none overflow-hidden flex items-center justify-center tracking-wide font-sans"
                  >
                    {/* Shimmer light effect */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" style={{ animationDuration: '1.5s' }} />
                    
                    <span>Find a Tutor</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.button>
                </Link>
 
                {/* Find Tuition Jobs Button */}
                <Link href="/map?type=tuition" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full sm:w-auto px-7 py-4 rounded-2xl text-base transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center tracking-wide font-sans font-black bg-slate-950/60 hover:bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400 shadow-[0_4px_15px_rgba(34,211,238,0.15)]"
                  >
                    <span>Find Tuition Jobs</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.button>
                </Link>

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
                      className="bg-emerald-500 text-white px-6 py-2.5 rounded-full font-sans font-black tracking-widest uppercase transition-colors cursor-pointer text-[10px] md:text-xs border-none shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:brightness-110"
                    >
                      Sign up
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Hero Content: Beautiful Visual Match Engine Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.4 }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl filter blur-2xl pointer-events-none" />

            {/* Dashboard Container */}
            <Link href="/map?type=tutor" className="block group cursor-pointer decoration-none">
              <div className="relative glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl p-6 bg-slate-950/40 backdrop-blur-xl space-y-6 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_30px_rgba(var(--theme-rgb),0.06)] transition-all duration-300">
                
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">Live Match Engine</span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                    Active Radar
                  </span>
                </div>

                {/* Simulated Search Bar */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-3 text-xs">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-slate-200 font-medium">
                      {mockIndex % 2 === 1
                        ? "Tutors in Dhaka..."
                        : "Jobs in Dhaka..."}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">1.5km radius</span>
                </div>

                {/* Stylized Map View Mockup */}
                <div className="relative h-44 rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden flex items-center justify-center">
                  {/* Styled Map Background Grid */}
                  <div 
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: `
                        linear-gradient(#fff 1px, transparent 1px),
                        linear-gradient(90deg, #fff 1px, transparent 1px)
                      `,
                      backgroundSize: "20px 20px"
                    }}
                  />
                  
                  {/* Decorative map roads/paths */}
                  <svg className="absolute inset-0 w-full h-full text-slate-800/40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-20 40 L400 120 M120 -20 L180 200 M-20 130 C 100 120, 150 160, 400 140" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <path d="M50 -20 C 60 40, 100 80, 250 200" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                  </svg>

                  {/* Radar rotating sweep line and concentric sonar rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {/* Concentric rings */}
                    <div className="absolute w-[260px] h-[260px] rounded-full border border-emerald-500/10 animate-pulse" />
                    <div className="absolute w-[180px] h-[180px] rounded-full border border-emerald-500/10" />
                    <div className="absolute w-[100px] h-[100px] rounded-full border border-emerald-500/10" />
                    <div className="absolute w-[40px] h-[40px] rounded-full border border-emerald-500/15" />
                    
                    {/* Sonar sweep overlay */}
                    <div 
                      className="absolute w-[360px] h-[360px] rounded-full animate-radar-sweep"
                      style={{
                        background: "conic-gradient(from 0deg, rgba(20, 184, 166, 0.12) 0deg, rgba(20, 184, 166, 0.03) 60deg, transparent 180deg, transparent 360deg)",
                      }}
                    />
                  </div>

                  {/* Dynamic map point 1 (Tutor) */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={`tutor-pin-${mockIndex % tutorPositions.length}`}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.4 }}
                      style={{ top: currentTutorPos.top, left: currentTutorPos.left }}
                      className="absolute group/pin flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      <div className="bg-slate-900/90 text-[8px] font-mono text-slate-300 border border-slate-800 px-2 py-0.5 rounded shadow-lg mb-1 whitespace-nowrap transition-colors duration-200">
                        Tutor: {shortTutorName}
                      </div>
                      <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]"></span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Dynamic map point 2 (Job) */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={`job-pin-${jobPositions.length - 1 - (mockIndex % jobPositions.length)}`}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.4 }}
                      style={{ bottom: currentJobPos.bottom, right: currentJobPos.right }}
                      className="absolute group/pin flex flex-col items-center translate-x-1/2 translate-y-1/2 z-20"
                    >
                      <div className="bg-slate-900/90 text-[8px] font-mono text-slate-300 border border-slate-800 px-2 py-0.5 rounded shadow-lg mb-1 whitespace-nowrap transition-colors duration-200">
                        Job: {shortJobTitle}
                      </div>
                      <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-450 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]"></span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />

                  {/* Matching Status Pill */}
                  <div className="absolute bottom-4 bg-slate-900/90 border border-slate-800/80 px-3.5 py-1.5 rounded-full flex items-center space-x-2 text-[10px] font-mono shadow-lg">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-450 animate-pulse" />
                    <span className="text-slate-300 font-bold uppercase tracking-wider">
                      {mockIndex % 2 === 1
                        ? "Discovering nearby tutors..."
                        : "Discovering tuition jobs..."}
                    </span>
                  </div>
                </div>

                {/* Matched Profile Preview Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mockIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3 shadow-md relative overflow-hidden w-full h-[185px] flex flex-col justify-between group-hover:border-emerald-500/20 transition-all duration-300"
                  >
                    {/* Subtle glass shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '3s' }} />

                    {mockIndex % 2 === 1 ? (
                      <>
                        <div>
                          {/* Tutor Profile Preview */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                                Verified Educator
                              </span>
                              <h4 className="text-sm font-bold text-slate-200 font-heading mt-2">
                                {currentTutor.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {currentTutor.specs}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                              {currentTutor.sector}
                            </span>
                          </div>

                          <div className="h-px bg-slate-800/60 my-1.5" />

                          {/* Bio in lower section */}
                          <div className="text-[10.5px] text-slate-400 italic font-sans leading-relaxed line-clamp-1">
                            <span className="font-bold text-slate-300 font-mono not-italic uppercase tracking-wider text-[8px] block mb-0.5 text-slate-500">Bio / Expertise:</span>
                            "{currentTutor.expertise}"
                          </div>
                        </div>

                        <div>
                          <div className="h-px bg-slate-800/40 my-1.5" />

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider font-bold">University Verified</span>
                            </div>
                            <div className="text-right space-y-0.5">
                              <span className="block text-[8px] font-mono text-slate-500 uppercase">Coordinates</span>
                              <span className="text-emerald-400/90 font-mono font-bold text-[9px] flex items-center justify-end space-x-1">
                                <span>🔒 Secured</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          {/* Job Listing Preview */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15">
                                Premium Job Matching
                              </span>
                              <h4 className="text-sm font-bold text-slate-200 font-heading mt-2">
                                {currentJob.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {currentJob.grade}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                              {currentJob.sector}
                            </span>
                          </div>

                          <div className="h-px bg-slate-800/60 my-1.5" />

                          {/* Requirements in lower section */}
                          <div className="text-[10.5px] text-slate-400 italic font-sans leading-relaxed line-clamp-1">
                            <span className="font-bold text-slate-300 font-mono not-italic uppercase tracking-wider text-[8px] block mb-0.5 text-slate-500">Requirements:</span>
                            "{currentJob.description || currentJob.sector}"
                          </div>
                        </div>

                        <div>
                          <div className="h-px bg-slate-800/40 my-1.5" />

                          <div className="flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="block text-[8px] font-mono text-slate-500 uppercase">Monthly Budget</span>
                              <span className="text-slate-300 font-bold font-sans text-[11px]">
                                {currentJob.salary}
                              </span>
                            </div>
                            <div className="text-right space-y-0.5">
                              <span className="block text-[8px] font-mono text-slate-500 uppercase">Coordinates</span>
                              <span className="text-indigo-400/90 font-mono font-bold text-[9px] flex items-center justify-end space-x-1">
                                <span>🔒 Secured</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
