"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

function SuccessContent() {
  const searchParams = useSearchParams();
  const trxId = searchParams.get("trxId");
  const jobId = searchParams.get("jobId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (jobId && trxId) {
      fetch("/api/payment/success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId, trxId, amount: 50 }),
      })
        .then((res) => {
          if (res.ok) {
            setLoading(false);
          } else {
            setError("Failed to record location unlock transaction.");
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          setError("An error occurred during transaction logging.");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [jobId, trxId]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center space-y-4">
        <div className="mx-auto animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <h2 className="text-xl font-bold text-white font-heading">Processing Transaction...</h2>
        <p className="text-slate-400 text-sm">Please wait while we secure your exact coordinates.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center space-y-6">
      {error ? (
        <>
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">Transaction Error</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
        </>
      ) : (
        <>
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-heading">Payment Successful!</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              You have successfully unlocked the exact location and parent contact details for this tuition post.
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">bKash Transaction ID</p>
            <p className="font-mono font-medium text-emerald-400 text-sm mt-1">{trxId || "N/A"}</p>
          </div>
        </>
      )}
      <Link href="/dashboard" className="block w-full">
        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.1)]">
          Return to Dashboard
        </button>
      </Link>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col animate-fade-in">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-slate-400">Loading details...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
