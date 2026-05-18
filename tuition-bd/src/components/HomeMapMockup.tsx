"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HomeMapMockupProps {
  selectedRole?: "parent" | "tutor";
}

export default function HomeMapMockup({ selectedRole }: HomeMapMockupProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [paymentState, setPaymentState] = useState<"locked" | "processing" | "unlocked">("locked");
  const [unlockedDetails, setUnlockedDetails] = useState(false);
  const [internalRole, setInternalRole] = useState<"parent" | "tutor">("parent");
  const currentRole = selectedRole || internalRole;

  // Dynamic Console Logs simulation
  useEffect(() => {
    // Reset states on role update
    setPaymentState("locked");
    setUnlockedDetails(false);

    const initialLogs = currentRole === "parent"
      ? [
          "⚙ Onboarding Sector Alpha complete...",
          "🛰 Accessing secure parent portal console...",
        ]
      : [
          "⚙ Console initialized...",
          "🛰 Connecting to secure coordinate network...",
        ];

    const logsSequence = currentRole === "parent"
      ? [
          "📡 Scanning Dhaka sectors for verified tutors...",
          "🔍 Filter matches active: Banani, O/A Levels...",
          "📍 18 verified educators online inside Banani.",
          "🔒 Exact schedule mapping locked for parent review.",
          "💡 Tip: Click verify below to securely reveal exact tutor rosters.",
        ]
      : [
          "📡 Syncing sector map databases...",
          "🔍 Scanning coordinates near Banani...",
          "📍 12 approximate parent listings located.",
          "🔒 High-security exact addresses locked by encryption.",
          "💡 Tip: Use bKash to unlock exact coordinates instantly.",
        ];

    setLogs(initialLogs);

    let count = 0;
    const interval = setInterval(() => {
      if (count < logsSequence.length) {
        setLogs((prev) => [...prev, logsSequence[count]]);
        count++;
      } else {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentRole]);

  const triggerUnlock = () => {
    setPaymentState("processing");
    const initMessage = currentRole === "parent"
      ? "💳 Initiating parent credential screening..."
      : "💳 Initializing bKash payment gateway...";

    setLogs((prev) => [...prev, initMessage]);

    setTimeout(() => {
      const stepMessage = currentRole === "parent"
        ? "🔑 Credentials accepted. Running matching algorithms..."
        : "💸 BDT 100.00 debit complete. Syncing ledger...";
      setLogs((prev) => [...prev, stepMessage]);
    }, 1200);

    setTimeout(() => {
      setPaymentState("unlocked");
      setUnlockedDetails(true);
      const successLogs = currentRole === "parent"
        ? [
            "✓ ALGORITHMS SYNCED. Secured direct coordination link.",
            "🔓 Fahim Rahman's coordinates and schedule successfully unlocked!",
          ]
        : [
            "✓ LEDGER SYNCED. Transferred authorization keys.",
            "🔓 Coordinates successfully unlocked for Dhaka Sector 4!",
          ];

      setLogs((prev) => [
        ...prev,
        ...successLogs,
      ]);
    }, 2500);
  };

  return (
    <section className="py-20 relative overflow-hidden bg-slate-950/20 border-y border-slate-800/20">
      {/* Dynamic Background Glow Blobs */}
      <div className="hidden md:block absolute top-1/2 left-1/3 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="hidden md:block absolute top-1/3 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-block text-emerald-500 font-mono text-xs uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            Platform Capabilities Showcase
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[var(--foreground)] tracking-tight">
            {currentRole === "parent" ? "Tutor Coordinate Matcher" : "Tactical Map Coordinate Lock"}
          </h2>
          <p className="text-[var(--muted)] text-sm md:text-base font-sans">
            {currentRole === "parent"
              ? "Parents can scan approximate verified educator markers on the radar scan console, toggle sector listings, and securely unlock matching schedules."
              : "Tutors can browse approximate match fields, pay a secure BDT 100 fee via bKash, and immediately unlock precision coordinates on the mapping console."}
          </p>
        </div>

        {/* Tactical Control Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Tactical Radar (Left) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80 flex-grow flex flex-col justify-between min-h-[380px] relative overflow-hidden keep-dark">
              <div>
                <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest">Display Output 01 // Dhaka Sector Scan</span>
                <h3 className="text-lg font-bold font-heading text-[var(--foreground)] mt-1">Satellite Navigation Module</h3>
              </div>

              {/* RADAR SCREEN CONTAINER */}
              <div className="my-6 relative w-48 h-48 md:w-56 md:h-56 mx-auto rounded-full bg-slate-950 border border-emerald-500/20 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                {/* Tactical Radar Grid Lines */}
                <div className="absolute inset-0 border-t border-b border-emerald-500/5" />
                <div className="absolute inset-0 border-l border-r border-emerald-500/5" />
                <div className="absolute w-[75%] h-[75%] rounded-full border border-emerald-500/5" />
                <div className="absolute w-[50%] h-[50%] rounded-full border border-emerald-500/5" />
                <div className="absolute w-[25%] h-[25%] rounded-full border border-emerald-500/5" />

                {/* Sweeping Radar Scanner Line */}
                <div className="absolute inset-0 origin-center animate-[spin_5s_linear_infinite]" style={{
                  background: "conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.25) 0deg, rgba(16, 185, 129, 0) 90deg)"
                }} />

                {/* Tutors Pulsing Markers */}
                <div className="absolute top-[28%] left-[35%] w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping pointer-events-none" />
                <div className="absolute top-[28%] left-[35%] w-3 h-3 bg-emerald-500 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />

                {/* Parents Locked Markers */}
                <div className="absolute bottom-[35%] right-[28%] w-3.5 h-3.5 bg-indigo-500 rounded-full animate-ping pointer-events-none" />
                <div className={`absolute bottom-[35%] right-[28%] w-3 h-3 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(99,102,241,0.8)] transition-colors duration-500 ${
                  unlockedDetails ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-indigo-500"
                }`} />

                {/* Locked Blur overlay */}
                <AnimatePresence>
                  {paymentState !== "unlocked" && (
                    <motion.div
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 backdrop-blur-[2px] bg-slate-950/40 flex items-center justify-center"
                    >
                      <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-center shadow-lg max-w-[80%]">
                        <span className="block text-[9px] font-mono text-indigo-400 uppercase tracking-widest mb-0.5">🔒 Coordinates Blurred</span>
                        <span className="text-[10px] text-slate-300 font-sans">Payment Required</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Coordinate Specs */}
              <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] pt-4 border-t border-slate-800/40">
                <span>LAT: {unlockedDetails ? "23.8103" : "23.XXXX"}</span>
                <span>LNG: {unlockedDetails ? "90.4125" : "90.XXXX"}</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                  unlockedDetails ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                }`}>
                  {unlockedDetails ? "✓ Target Resolved" : "🔒 Encrypted"}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: matcher terminal & bKash checkout (Right) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            {/* Terminal Logs Panel */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80 flex-grow min-h-[180px] flex flex-col justify-between keep-dark">
              <div>
                <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest">Display Output 02 // Operation Logs</span>
                <h3 className="text-lg font-bold font-heading text-[var(--foreground)] mt-1">Live Telemetry Console</h3>
              </div>

              <div className="h-32 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-[10px] md:text-xs text-slate-300 space-y-1.5 overflow-y-auto mt-4 scrollbar-thin">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-emerald-500 mr-2">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Payment Switch Panel */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest">Operations Switch</span>
                  {/* Small inline switcher when no role is fixed */}
                  {!selectedRole && (
                    <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-[9px] font-mono">
                      <button
                        onClick={() => {
                          setInternalRole("parent");
                          setPaymentState("locked");
                          setUnlockedDetails(false);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-colors border-none bg-transparent cursor-pointer ${
                          internalRole === "parent" ? "bg-emerald-500/10 text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Parent
                      </button>
                      <button
                        onClick={() => {
                          setInternalRole("tutor");
                          setPaymentState("locked");
                          setUnlockedDetails(false);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-colors border-none bg-transparent cursor-pointer ${
                          internalRole === "tutor" ? "bg-indigo-500/10 text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Tutor
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold font-heading text-[var(--foreground)] mt-0.5">
                  {currentRole === "parent" ? "Mock Credential Screener" : "Mock Coordinate Unlocker"}
                </h3>
              </div>

              <div className="mt-4">
                {paymentState === "locked" && (
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(16,185,129,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={triggerUnlock}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2 border-none"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {currentRole === "parent" ? "Verify Credentials & Map Roster" : "Simulate bKash Unlock (BDT 100)"}
                  </motion.button>
                )}

                {paymentState === "processing" && (
                  <div className="w-full bg-slate-900 border border-slate-800 py-3.5 rounded-xl text-sm text-slate-300 flex items-center justify-center space-x-2">
                    <div className="animate-spin h-4.5 w-4.5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                    <span className="font-mono text-xs uppercase tracking-wider">
                      {currentRole === "parent" ? "Screening Parent Credentials..." : "Processing bKash Checkout..."}
                    </span>
                  </div>
                )}

                {paymentState === "unlocked" && (
                  <div className="w-full bg-emerald-500/10 border border-emerald-500/25 py-3.5 rounded-xl text-sm text-emerald-400 flex items-center justify-center space-x-2 font-mono uppercase text-xs font-bold tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {currentRole === "parent" ? "✓ Roster Mapping Unlocked" : "✓ Exact Target Unlocked"}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
