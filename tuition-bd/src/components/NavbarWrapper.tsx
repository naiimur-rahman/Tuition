"use client";

import { Suspense } from "react";
import Navbar from "./Navbar";

interface NavbarWrapperProps {
  selectedRole?: "parent" | "tutor";
}

export default function NavbarWrapper({ selectedRole }: NavbarWrapperProps) {
  return (
    <Suspense fallback={<div className="h-16" />}>
      <Navbar selectedRole={selectedRole} />
    </Suspense>
  );
}
