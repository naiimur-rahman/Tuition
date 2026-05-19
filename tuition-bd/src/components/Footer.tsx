"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  // Hide footer on interactive map and dashboard views for clean layout
  const isMapOrDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/map");
  
  if (isMapOrDashboard) return null;

  return (
    <footer className="w-full bg-slate-950/80 border-t border-slate-900 mt-auto relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12">
          {/* Logo / Tagline */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(var(--theme-rgb),0.2)] text-emerald-400 shrink-0">
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                  />
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
                  <path d="M13.8 8.5V10.5" 
                        stroke="currentColor" 
                        strokeWidth="0.8" 
                        strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-emerald-400 select-none whitespace-nowrap">
                Tuition Console
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-sm leading-relaxed">
              Connect with verified tutors and find tuition jobs in Bangladesh using our interactive, premium map-based console.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-extrabold">Discovery</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--muted)]">
              <li>
                <Link href="/map?type=tuition" className="hover:text-emerald-400 transition-colors">Find Tuition</Link>
              </li>
              <li>
                <Link href="/map?type=tutor" className="hover:text-emerald-400 transition-colors">Find Tutors</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-extrabold">Company</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--muted)]">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-emerald-400 transition-colors">Policy Guidelines</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-slate-900 my-8 sm:my-10" />

        {/* Bengali Disclaimer & Bottom Info */}
        <div className="space-y-6">
          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-900 shadow-inner max-w-4xl">
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              <span className="text-emerald-400 font-bold">বি.দ্র.:</span> টিউশন কনসোল সরাসরি কোনো টিউশন সেবা দেয় না; বরং এটি নিরাপদ প্রযুক্তির মাধ্যমে শিক্ষার্থী ও দক্ষ টিউটরদের যুক্ত করার একটি মাধ্যম মাত্র।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-[var(--muted)] font-mono">
            <p>&copy; {new Date().getFullYear()} Tuition Console. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with 
              <span className="text-pink-500 animate-pulse">&hearts;</span> 
              for Bangladesh student community.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
