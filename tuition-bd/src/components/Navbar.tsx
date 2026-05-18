"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavbarProps {
  selectedRole?: "parent" | "tutor";
}

export default function Navbar({ selectedRole }: NavbarProps = {}) {
  const { data: session } = useSession() || { data: null };
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeRole, setActiveRole] = useState<"parent" | "tutor" | undefined>(selectedRole);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isLinkActive = (href: string) => pathname === href;

  useEffect(() => {
    setMounted(true);
    const isLightActive = document.documentElement.classList.contains("light");
    setTheme(isLightActive ? "light" : "dark");
  }, []);

  // Auto-close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Update activeRole if prop changes, otherwise check sessionStorage
  useEffect(() => {
    if (selectedRole) {
      setActiveRole(selectedRole);
    } else {
      const savedRole = sessionStorage.getItem("userRole");
      if (savedRole === "parent" || savedRole === "tutor") {
        setActiveRole(savedRole);
      } else {
        setActiveRole(undefined);
      }
    }
  }, [selectedRole]);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            {pathname !== "/" && (
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/");
                  }
                }}
                className="mr-3 p-1.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-emerald-500/30 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
                title="Go Back"
              >
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )}
            <Link href="/" className="flex items-center space-x-2.5">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center cursor-pointer font-heading font-extrabold text-xl tracking-tight transition-colors duration-200 ${
                  theme === "light" ? "text-slate-900" : "text-white"
                }`}
              >
                {/* Map & Tuition Combined Brand Logo */}
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mr-2 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* A premium map marker shape */}
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                    />
                    {/* A graduation cap inside the center of the marker */}
                    <path d="M12 6.5L8.5 8.5L12 10.5L15.5 8.5L12 6.5Z" 
                          fill="currentColor" 
                          stroke="currentColor" 
                          strokeWidth="1" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                    />
                    <path d="M9.5 9.1V11.5C9.5 12.5 10.6 13.5 12 13.5C13.4 13.5 14.5 12.5 14.5 11.5V9.1" 
                          stroke="currentColor" 
                          strokeWidth="1.2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                    />
                    {/* Tassel */}
                    <path d="M13.8 8.5V10.5" 
                          stroke="currentColor" 
                          strokeWidth="0.8" 
                          strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span>Tuition</span>
                <span className="text-emerald-500 font-sans ml-1">Console</span>
              </motion.div>
            </Link>

            {/* Main Navigation Links (Desktop) */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-6">
              {(!activeRole || activeRole === "tutor") && (
                <Link
                  href="/map"
                  className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    isLinkActive("/map")
                      ? "text-emerald-500"
                      : theme === "light"
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Find Tuition
                  {isLinkActive("/map") && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )}
              {(!activeRole || activeRole === "parent") && (
                <Link
                  href="/map?type=tutor"
                  className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    isLinkActive("/map?type=tutor")
                      ? "text-emerald-500"
                      : theme === "light"
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Find Tutors
                  {isLinkActive("/map?type=tutor") && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors duration-200 cursor-pointer ${
                !mounted
                  ? "bg-slate-900/30 border-slate-800 text-slate-400"
                  : theme === "light"
                  ? "bg-slate-100 border-slate-200 text-slate-600 hover:text-emerald-500 hover:border-emerald-400/30"
                  : "bg-slate-900/30 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
              }`}
              aria-label="Toggle theme color mode"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : theme === "light" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
            </motion.button>

            {/* Session Controls (Desktop-Only) */}
            <div className="hidden sm:flex items-center space-x-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-200 ${
                      isLinkActive("/dashboard")
                        ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                        : theme === "light"
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signOut()}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                  >
                    Sign Out
                  </motion.button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Log in
                  </Link>
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(16,185,129,0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
                    >
                      Sign up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburg Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl border sm:hidden transition-colors duration-200 cursor-pointer ${
                theme === "light"
                  ? "bg-slate-100 border-slate-200 text-slate-600 hover:text-emerald-500 hover:border-emerald-400/30"
                  : "bg-slate-900/30 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
              }`}
              aria-label="Toggle mobile navigation menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`sm:hidden border-t ${
              theme === "light"
                ? "bg-white/95 border-slate-200"
                : "bg-slate-950/95 border-slate-800/80"
            } backdrop-blur-xl overflow-hidden shadow-2xl relative z-40`}
          >
            <div className="px-4 py-6 space-y-4 flex flex-col">
              {/* Navigation Links */}
              {(!activeRole || activeRole === "tutor") && (
                <Link
                  href="/map"
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center ${
                    isLinkActive("/map")
                      ? "text-emerald-500 bg-emerald-500/10 font-bold"
                      : theme === "light"
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Find Tuition Jobs
                </Link>
              )}
              {(!activeRole || activeRole === "parent") && (
                <Link
                  href="/map?type=tutor"
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center ${
                    isLinkActive("/map?type=tutor")
                      ? "text-emerald-500 bg-emerald-500/10 font-bold"
                      : theme === "light"
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Find Tutors
                </Link>
              )}

              {/* Separator */}
              <div className={`h-px w-full ${theme === "light" ? "bg-slate-200" : "bg-slate-800/80"}`} />

              {/* Session Controls (Mobile) */}
              {session ? (
                <div className="space-y-3 pt-2">
                  <Link
                    href="/dashboard"
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center ${
                      isLinkActive("/dashboard")
                        ? "text-emerald-500 bg-emerald-500/10 font-bold"
                        : theme === "light"
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Link href="/login" className="w-full">
                    <button
                      className={`w-full py-3 rounded-xl text-sm font-bold border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                        theme === "light"
                          ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                          : "bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-200"
                      }`}
                    >
                      Log in
                    </button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)]">
                      Sign up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
