"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface RoleDashboardSectorsProps {}
 
export default function RoleDashboardSectors({}: RoleDashboardSectorsProps = {}) {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  } as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 z-10 relative space-y-16"
    >
      {/* ================= PARENT PORTAL VIEW ================= */}
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center lg:text-left space-y-4">
          <h2 className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit mx-auto lg:mx-0 shadow-[0_0_15px_rgba(var(--theme-rgb),0.05)]">
            Parent Operator Dashboard
          </h2>
          <h3 className="text-3xl font-heading font-extrabold text-white tracking-tight">
            Tutor Verification & Matching Engine
          </h3>
          <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Verify credentials, locate highly qualified educators within your sector coordinates, and monitor background check matches instantly.
          </p>
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={cardVariants} className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl group-hover:bg-emerald-500/10 transition-all duration-300" />
            <div className="text-3xl font-heading font-extrabold text-emerald-400">4,850+</div>
            <div className="text-sm font-bold text-slate-200 mt-1">Active Verified Tutors</div>
            <div className="text-xs text-slate-400 mt-2 font-mono">BUET, DU, DMC & O/A Level Specialists</div>
          </motion.div>

          <motion.div variants={cardVariants} className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full filter blur-xl group-hover:bg-teal-500/10 transition-all duration-300" />
            <div className="text-3xl font-heading font-extrabold text-teal-400">98.7%</div>
            <div className="text-sm font-bold text-slate-200 mt-1">Match Credibility Seal</div>
            <div className="text-xs text-slate-400 mt-2 font-mono">Strict real-time NID & ID auditing</div>
          </motion.div>

          <motion.div variants={cardVariants} className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden group sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />
            <div className="text-3xl font-heading font-extrabold text-indigo-400">1.2 km</div>
            <div className="text-sm font-bold text-slate-200 mt-1">Average Proximity Radius</div>
            <div className="text-xs text-slate-400 mt-2 font-mono">Bangladesh North & South sectors matched</div>
          </motion.div>
        </div>

        {/* Guidelines & Interactive Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Safety Guidelines */}
          <motion.div variants={cardVariants} className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold font-heading text-white">Trust & Safety Checklist</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                We verify every tutor to ensure parent safety. Always leverage these protocols:
              </p>
              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300 font-sans">
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2.5">✓</span>
                  <span><strong>NID Verification:</strong> Every tutor has their National Identity verified by administrators.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2.5">✓</span>
                  <span><strong>Academic Verification:</strong> OCR scanning and document cross-checks verify academic credentials.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2.5">✓</span>
                  <span><strong>Trial Lesson:</strong> Conduct initial trial sessions in public spaces or under supervision.</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link href="/map?type=tutor" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer shadow-md">
                  Launch Tutor Discovery Map
                </button>
              </Link>
            </div>
          </motion.div>

          {/* How to Hire Guide */}
          <motion.div variants={cardVariants} className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.571V9a4 4 0 00-4-4H4m15.542 7.5c1.127 1.95 1.766 4.212 1.766 6.622 0 1.221-.167 2.403-.48 3.528M17 11.571L17 9a4 4 0 00-4-4h-2m4 4.5V14a5 5 0 01-5 5H10" />
                </svg>
              </div>
              <h4 className="text-xl font-bold font-heading text-white">Three-Step Premium Hiring Flow</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Find and hire verified tutors in three simple steps:
              </p>
              <div className="space-y-4 font-sans text-slate-300 pt-2">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-mono text-xs flex items-center justify-center font-bold">1</div>
                  <div className="text-xs sm:text-sm">
                    <strong>Locate Tutors:</strong> Use the interactive map to filter tutors by area, class, or budget.
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-mono text-xs flex items-center justify-center font-bold">2</div>
                  <div className="text-xs sm:text-sm">
                    <strong>Connect:</strong> Send a secure link request. Once accepted, coordinates are unlocked.
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-mono text-xs flex items-center justify-center font-bold">3</div>
                  <div className="text-xs sm:text-sm">
                    <strong>Hire:</strong> Verify credentials on your dashboard and coordinate lessons securely.
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-mono text-xs flex items-center space-x-1.5 transition">
                <span>Register Parent Profile for full portal tools</span>
                <span>→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Symmetrical Glass Separator */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent my-4" />

      {/* ================= TUTOR PORTAL VIEW ================= */}
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center lg:text-left space-y-4">
          <h2 className="text-xs font-mono tracking-widest text-indigo-400 uppercase font-bold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full w-fit mx-auto lg:mx-0 shadow-[0_0_15px_rgba(var(--theme-rgb),0.05)]">
            Tutor Operator Workspace
          </h2>
          <h3 className="text-3xl font-heading font-extrabold text-white tracking-tight">
            Active Tuition Jobs & Credentials Hub
          </h3>
          <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Verify your university student documents using our instant OCR scan processor to earn parent trust, lock down jobs, and secure premium monthly salaries.
          </p>
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={cardVariants} className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />
            <div className="text-3xl font-heading font-extrabold text-indigo-400">340+</div>
            <div className="text-sm font-bold text-slate-200 mt-1">Open Tuition Vacancies</div>
            <div className="text-xs text-slate-400 mt-2 font-mono">Located in Bangladesh North & South sectors</div>
          </motion.div>

          <motion.div variants={cardVariants} className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl group-hover:bg-emerald-500/10 transition-all duration-300" />
            <div className="text-3xl font-heading font-extrabold text-emerald-400">14,200 BDT</div>
            <div className="text-sm font-bold text-slate-200 mt-1">Average Monthly Salary</div>
            <div className="text-xs text-slate-400 mt-2 font-mono">Secured by premium parents in Bangladesh</div>
          </motion.div>

          <motion.div variants={cardVariants} className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden group sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full filter blur-xl group-hover:bg-teal-500/10 transition-all duration-300" />
            <div className="text-3xl font-heading font-extrabold text-teal-400">24 Hours</div>
            <div className="text-sm font-bold text-slate-200 mt-1">Average Connection Time</div>
            <div className="text-xs text-slate-400 mt-2 font-mono">Fast match coordinate approvals</div>
          </motion.div>
        </div>

        {/* Guidelines & Interactive Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* OCR Credential Scanner Guide */}
          <motion.div variants={cardVariants} className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1.001 1.001 0 001-1V5a1.001 1.001 0 00-1-1H5a1.001 1.001 0 00-1 1v2a1.001 1.001 0 001 1zm12 0h2a1.001 1.001 0 001-1V5a1.001 1.001 0 00-1-1h-2a1.001 1.001 0 00-1 1v2a1.001 1.001 0 001 1zM5 20h2a1.001 1.001 0 001-1v-2a1.001 1.001 0 00-1-1H5a1.001 1.001 0 00-1 1v2a1.001 1.001 0 001 1z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold font-heading text-white">Tutor Authenticity Guard</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Parents prioritize verified educators. Build trust by completing our verification steps:
              </p>
              <div className="space-y-4 font-sans text-slate-300 pt-2">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">✓</div>
                  <div className="text-xs sm:text-sm">
                    <strong>NID Verification:</strong> National Identity proof checks to ensure a valid NID is uploaded.
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">✓</div>
                  <div className="text-xs sm:text-sm">
                    <strong>Student ID Verification:</strong> Verifies student ID to confirm active university status.
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-xs flex items-center justify-center font-bold">✗</div>
                  <div className="text-xs sm:text-sm">
                    <strong>Anti-Fake Shield:</strong> Blank or fake documents are auto-flagged and rejected instantly.
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer shadow-md">
                  Complete Tutor Verification
                </button>
              </Link>
            </div>
          </motion.div>

          {/* How to Earn / Job Flow */}
          <motion.div variants={cardVariants} className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v3m4-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m12 0a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h14z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold font-heading text-white">How to Earn with TutorHire</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Start matching with premium tuition jobs in three simple steps:
              </p>
              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300 font-sans">
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2.5">→</span>
                  <span><strong>Verify Profile:</strong> Upload credentials to get verified and rank higher in search results.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2.5">→</span>
                  <span><strong>Browse Map:</strong> Use the interactive map to browse parent job locations near you.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2.5">→</span>
                  <span><strong>Match & Teach:</strong> Connect with parents and coordinate lessons.</span>
                </li>
              </ul>
            </div>
            <div className="pt-4">
              <Link href="/map?type=tuition" className="text-indigo-400 hover:text-indigo-300 font-mono text-xs flex items-center space-x-1.5 transition">
                <span>Open Interactive Map Job Board</span>
                <span>→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
