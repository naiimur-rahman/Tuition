"use client";

import { useState, useEffect } from "react";
import NavbarWrapper from "@/components/NavbarWrapper";
import Hero from "@/components/Hero";
import HomeMapMockup from "@/components/HomeMapMockup";
import RoleDashboardSectors from "@/components/RoleDashboardSectors";
import MapPreviewIntro from "@/components/MapPreviewIntro";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<"parent" | "tutor" | undefined>(undefined);
  const [showIntro, setShowIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRole = sessionStorage.getItem("userRole");
    if (savedRole === "parent" || savedRole === "tutor") {
      setSelectedRole(savedRole);
    }
    setIsLoading(false);
  }, []);

  const handleSelectRole = (role: "parent" | "tutor") => {
    setSelectedRole(role);
    sessionStorage.setItem("userRole", role);
  };

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
      <NavbarWrapper selectedRole={selectedRole} />
      
      <Hero 
        selectedRole={selectedRole} 
        onSelectRole={handleSelectRole}
        onTriggerDemo={() => setShowIntro(true)}
      />
      
      <RoleDashboardSectors 
        selectedRole={selectedRole} 
        onSelectRole={handleSelectRole}
      />
      
      <HomeMapMockup selectedRole={selectedRole} />

      {/* Animated Satellite Map Preview Onboarding Intro Overlay */}
      {showIntro && (
        <MapPreviewIntro onComplete={() => setShowIntro(false)} />
      )}
    </div>
  );
}

