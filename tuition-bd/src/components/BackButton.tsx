"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Only render the floating back button on authentication routes that do not have navbars
  const showFloating = ["/login", "/register", "/forgot-password"].includes(pathname);
  
  if (!showFloating) {
    return null;
  }

  const handleBack = () => {
    // If the browser history has pages, go back. Otherwise, default to homepage.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05, x: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleBack}
      className="fixed top-6 left-6 z-[999] p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/30 text-slate-400 hover:text-white transition-all cursor-pointer shadow-lg flex items-center justify-center backdrop-blur-md"
      title="Go Back"
    >
      <svg
        className="w-4 h-4 text-emerald-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </motion.button>
  );
}
