"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import NavbarWrapper from "@/components/NavbarWrapper";

function SuccessContent() {
  const searchParams = useSearchParams();
  const trxId = searchParams.get("trxId");

  return (
    <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
        <svg className="h-6 w-6 animate-spin text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white font-heading">Verification Pending!</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your bKash payment has been logged. Admin operators are manually verifying the transaction receipt now.
        </p>
      </div>
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Logged bKash Transaction ID</p>
        <p className="font-mono font-bold text-yellow-500 text-sm mt-1 tracking-wider">{trxId || "N/A"}</p>
      </div>
      <Link href="/dashboard" className="block w-full">
        <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition duration-200 cursor-pointer shadow-md border-none">
          Return to Dashboard
        </button>
      </Link>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col animate-fade-in">
      <NavbarWrapper />
      <div className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-slate-400">Loading details...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
