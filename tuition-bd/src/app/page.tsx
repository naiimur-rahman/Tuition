"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HomeMapMockup from "@/components/HomeMapMockup";
import OnboardingGateway from "@/components/OnboardingGateway";
import RoleDashboardSectors from "@/components/RoleDashboardSectors";
import MapPreviewIntro from "@/components/MapPreviewIntro";
import FrontPageAdditions from "@/components/FrontPageAdditions";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<"parent" | "tutor" | undefined>(undefined);
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRole = sessionStorage.getItem("userRole");
    if (savedRole === "parent" || savedRole === "tutor") {
      setSelectedRole(savedRole);
      setShowIntro(false); // Skip intro if user role is already active
    } else {
      setShowIntro(true); // Always display the premium matching intro animation if no role is active
    }
    setIsLoading(false);
  }, []);

  const handleResetRole = () => {
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("mapIntroPlayed");
    setSelectedRole(undefined);
    // Reload page to trigger clean state
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 flex flex-col relative">
      {/* Animated Satellite Map Preview Onboarding Intro */}
      {showIntro && (
        <MapPreviewIntro onComplete={() => {
          setShowIntro(false);
          sessionStorage.setItem("mapIntroPlayed", "true");
        }} />
      )}

      {/* Onboarding gateway prompt */}
      {!showIntro && !selectedRole && (
        <OnboardingGateway onSelectRole={(role) => setSelectedRole(role)} />
      )}

      {!showIntro && selectedRole && (
        <>
          <Navbar selectedRole={selectedRole} />
          <Hero selectedRole={selectedRole} />
          <RoleDashboardSectors selectedRole={selectedRole} />
          <HomeMapMockup selectedRole={selectedRole} />

          {/* Features Section */}
          <section className="py-24 border-t border-slate-800/10 relative">
            {/* Backdrop Decorative Glow */}
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="text-xs font-mono tracking-widest text-emerald-500 uppercase font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit mx-auto">
                  Our Core Engine
                </h2>
                <p className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-[var(--foreground)] leading-tight">
                  {selectedRole === "tutor" ? "A better, more secure way to teach & earn" : "A better, more secure way to learn"}
                </p>
                <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
                  {selectedRole === "tutor"
                    ? "Unlock premium teaching vacancies, coordinate class schedules instantly, and protect your tutoring career with verified credentials and secure payouts."
                    : "Tuition Console introduces features tailored specifically for the Bangladesh tutoring ecosystem, maximizing transparency and trust."}
                </p>
              </div>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Feature 1: Map-Based Discovery */}
                <div className="glass-card rounded-2xl p-8 flex gap-6">
                  <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[var(--foreground)] font-heading">Map-Based Discovery</h3>
                    <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed font-sans">
                      {selectedRole === "parent"
                        ? "Locate certified nearby tutors matching your class and subject requirements on our responsive interactive map, protecting exact locations until matching is complete."
                        : "Browse open tuition vacancies within your walking radius on the interactive job map, complete with target budgets and student scheduling details."}
                    </p>
                  </div>
                </div>

                {/* Feature 2: Verification Badges */}
                <div className="glass-card rounded-2xl p-8 flex gap-6">
                  <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[var(--foreground)] font-heading">
                      {selectedRole === "parent" ? "Verified Profiles" : "Profile Badges"}
                    </h3>
                    <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed font-sans">
                      {selectedRole === "parent"
                        ? "Security and credibility are our highest priorities. Tutors must upload official validation documents (NID or University IDs) to receive active verified credentials."
                        : "Gain immediate parent trust. Upload your university registration card and NID scan to secure the green verified profile badge, boosting application visibility by 6x."}
                    </p>
                  </div>
                </div>

                {/* Feature 3: Dynamic Operations (Smart Scheduling for Parent / Frictionless Payments for Tutor) */}
                <div className="glass-card rounded-2xl p-8 flex gap-6">
                  <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                    {selectedRole === "parent" ? (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.571V9a4 4 0 00-4-4H4m15.542 7.5c1.127 1.95 1.766 4.212 1.766 6.622 0 1.221-.167 2.403-.48 3.528M17 11.571L17 9a4 4 0 00-4-4h-2m4 4.5V14a5 5 0 01-5 5H10" />
                      </svg>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[var(--foreground)] font-heading">
                      {selectedRole === "parent" ? "Smart Scheduling" : "Frictionless Payments"}
                    </h3>
                    <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed font-sans">
                      {selectedRole === "parent"
                        ? "Coordinate weekly tutoring calendars, syllabus schedules, and class time duration preferences directly with active matches inside your unified home dashboard."
                        : "Experience seamless local integration. Unlock exact parent contact phone directories and handle commission match fees via our secure, simulated bKash Tokenized Checkout."}
                    </p>
                  </div>
                </div>

                {/* Feature 4: Reviews & Ratings */}
                <div className="glass-card rounded-2xl p-8 flex gap-6">
                  <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.882l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.77-.63-.372-1.882.583-1.882h4.908a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[var(--foreground)] font-heading">Reviews & Ratings</h3>
                    <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed font-sans">
                      {selectedRole === "parent"
                        ? "Read authentic reviews and five-star quality ratings left by other local families to hire the most trusted and capable tutors for your children."
                        : "Receive honest feedback and five-star quality ratings from parents and students, establishing a strong academic reputation to land premium vacancies."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <FrontPageAdditions selectedRole={selectedRole} />
        </>
      )}
    </div>
  );
}
