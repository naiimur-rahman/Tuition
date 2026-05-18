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

        </>
      )}
    </div>
  );
}
