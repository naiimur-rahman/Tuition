"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";
import Navbar from "@/components/Navbar";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId");
  
  const [trxId, setTrxId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);

  if (!jobId) {
    return (
      <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center space-y-4">
        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white font-heading">Invalid Roster Request</h2>
        <p className="text-slate-400 text-sm">No tuition job coordinates were specified to unlock.</p>
        <Link href="/map" className="block pt-2">
          <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 cursor-pointer border-none">
            Return to Map
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 relative overflow-hidden">
      {/* BKash Branding Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500" />
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center">
          <svg className="h-16 w-auto select-none" viewBox="-10 -15 270 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <style>
              {`
                .bk-1 { fill: #d12053; }
                .bk-2 { fill: #e2136e; }
                .bk-3 { fill: #9e1638; }
                .bk-white { fill: #ffffff; }
              `}
            </style>
            
            {/* Origami Bird */}
            <path transform="translate(.01)" className="bk-1" d="M223.65 62.45l-53.03-8.31 7.03 31.6z"/>
            <path transform="translate(.01)" className="bk-2" d="M223.65 62.45L183.69 6.93l-13.06 47.22z"/>
            <path transform="translate(.01)" className="bk-1" d="M169.39 53.51L127.52 0l54.83 6.55z"/>
            <path transform="translate(.01)" className="bk-3" d="M150.32 31.15L127.07 9.24h6.12z"/>
            <path transform="translate(.01)" className="bk-1" d="M234.96 35.46l-9.84 26.69-15.95-22.06z"/>
            <path transform="translate(.01)" className="bk-2" d="M183.84 84.14l38.61-15.51 1.62-4.93z"/>
            <path transform="translate(.01)" className="bk-3" d="M152.96 113.41l16.54-58.02 8.39 37.75z"/>
            <path transform="translate(.01)" className="bk-2" d="M236.5 35.67l-4.06 11.02 14.64-.24z"/>
            
            {/* "bkash" Text wordmark */}
            <path d="M.01 40.09c.71.06 1.43.19 2.19.19s1.38-.13 2.19-.19v23.47c2.31-3.93 5.22-6.52 9.5-6.52 7.74 0 11.06 7.66 11.06 14.7 0 8.43-4.5 16.5-12.39 16.5a8.66 8.66 0 01-7.77-4.47c-1.32 1.16-2.49 2.55-3.74 3.81h-1zm4.28 34.52c0 6.84 2.9 11.61 7.67 11.61 6.19 0 8.18-8.32 8.18-14.22 0-6.85-2.26-12.24-7.62-12.3-6.26-.05-8.23 7.36-8.23 14.92" className="bk-2"/>
            <path d="M45.14 55.27l-4.66 6c4.38 6.4 8.92 12.67 13.32 19.15l4.44 7v.35c-1.09-.07-2.08-.21-3-.21-.92 0-2.08.14-3.06.21-1.21-2.24-2.41-4.31-3.78-6.34l-12-17.75c-.27-.28-.92-.5-.92-.21v24.3c-.88-.07-1.65-.21-2.41-.21-.76 0-1.64.14-2.41.21V40.09c.77.06 1.6.21 2.41.21s1.53-.15 2.41-.21v21.52c0 .42.82.14 1.36-.42a37.1 37.1 0 002.92-3.42l13.49-17.7c.71.06 1.42.21 2.19.21s1.36-.15 2.14-.21z" className="bk-white"/>
            <path d="M81.43 82.4c0 2.48-.16 3.74 3.07 2.92v1.39a8.87 8.87 0 01-1.65.63c-2.85.57-5.21.06-5.65-3.67l-.49.55a10.17 10.17 0 01-8.12 4c-3.88 0-7.28-3.06-7.28-7.75 0-7.23 5-8.18 10.13-9.13 4.34-.82 5.82-1.2 5.82-4.25 0-4.7-2.3-7.42-6.41-7.42a6.85 6.85 0 00-6.52 4.37h-.6v-3.52a14.2 14.2 0 018.87-3.48c5.75 0 8.88 3.48 8.88 10.65zm-4.38-10.47l-1.93.44c-3.73.82-9.32 1.45-9.32 7.24 0 4 2 6 5.36 6a6.83 6.83 0 004.44-2.44c.4-.46 1.5-1.54 1.5-2z" className="bk-white"/>
            <path d="M91.2 81.56c1.3 2.49 3.72 4.72 6.3 4.72a5.67 5.67 0 005.38-5.78c0-8.56-12.95-3-12.95-14.08 0-6.08 4-9.37 8.93-9.37a11.57 11.57 0 016.2 1.64 32.79 32.79 0 00-1.3 4.5h-.5c-.72-2.09-2.63-4.19-4.66-4.19-2.74 0-5 1.85-5 5.28 0 8.11 12.95 3.79 12.95 13.94 0 6.79-5.26 10-10.1 10a12.73 12.73 0 01-6.84-2 34.42 34.42 0 001.15-4.65z" className="bk-white"/>
            <path d="M113.93 40.09c.73.06 1.44.19 2.2.19.76 0 1.38-.13 2.2-.19v23.09c1.92-3.87 4.93-6.14 8.83-6.14 6.36 0 8.83 4.36 8.83 12.36v18.37c-.83-.07-1.47-.19-2.2-.19-.73 0-1.48.13-2.2.19V70.85c0-7-1.41-10.53-6.08-10.53-4.94 0-7.18 3.56-7.18 10.15v17.3c-.82-.07-1.47-.19-2.2-.19-.73 0-1.46.13-2.2.19z" className="bk-white"/>
          </svg>
        </div>
        <p className="text-[11px] font-mono text-pink-400 uppercase tracking-widest">
          Secured Location Coordinate Unlock Portal
        </p>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Invoice Details */}
      <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex items-center justify-between font-sans">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Invoice Fee</span>
          <span className="text-white font-heading font-extrabold text-base sm:text-lg">Coordinate Unlock</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Amount</span>
          <span className="text-pink-500 font-heading font-extrabold text-lg sm:text-xl">50.00 BDT</span>
        </div>
      </div>

      {/* Steps Instructions */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
        <h3 className="font-bold text-white uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
          How to Pay via bKash:
        </h3>
        
        <div className="space-y-2">
          <div className="flex gap-2.5">
            <span className="font-mono text-pink-400 font-bold select-none">1.</span>
            <p>Open your bKash app or dial <span className="font-mono font-bold text-white">*247#</span></p>
          </div>
          <div className="flex gap-2.5">
            <span className="font-mono text-pink-400 font-bold select-none">2.</span>
            <p>Choose <span className="font-bold text-white">Make Payment</span> (or Payment) and transfer BDT 50 to our merchant account:</p>
          </div>
          <div className="pl-5">
            <div className="bg-black/60 border border-slate-800/80 px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 max-w-[240px]">
              <span className="font-mono font-extrabold text-emerald-400 text-sm select-all">
                01601941815
              </span>
              <span className="text-[9px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded font-mono uppercase font-bold border border-pink-500/20">
                Merchant
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">(Tuition Console - Merchant Account)</span>
          </div>
          <div className="flex gap-2.5">
            <span className="font-mono text-pink-400 font-bold select-none">3.</span>
            <p>Copy the resulting 10-character <span className="font-bold text-white">Transaction ID</span> and submit below.</p>
          </div>
        </div>
      </div>

      {/* Verification Input Form */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold">
            Enter bKash Transaction ID
          </label>
          <input 
            type="text"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value.toUpperCase())}
            placeholder="e.g. 8K28HN291L"
            className="w-full bg-black/60 border border-slate-800 focus:border-pink-500/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition font-mono uppercase tracking-wide"
          />
        </div>

        {verifyError && (
          <div className="bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-lg text-xs text-red-400 font-mono flex items-center gap-2">
            <span className="font-bold text-sm select-none">✗</span>
            <span>{verifyError}</span>
          </div>
        )}

        {verifySuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-lg text-xs text-emerald-400 font-mono flex items-center gap-2">
            <span className="font-bold text-sm select-none">✓</span>
            <span>Payment validated! Redirecting...</span>
          </div>
        )}

        <button
          disabled={verifying || !trxId}
          onClick={async () => {
            setVerifying(true);
            setVerifyError("");
            try {
              const res = await fetch("/api/payment/success", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  jobId: jobId,
                  trxId: trxId.trim(),
                  amount: 50
                })
              });
              if (res.ok) {
                setVerifySuccess(true);
                setTimeout(() => {
                  router.push(`/payment/success?jobId=${jobId}&trxId=${trxId.trim()}`);
                }, 1000);
              } else {
                setVerifyError("Verification failed. Invalid or used Transaction ID.");
              }
            } catch (e) {
              setVerifyError("Network connection error. Please try again.");
            } finally {
              setVerifying(false);
            }
          }}
          className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-800 disabled:text-slate-500 text-white py-3 px-4 rounded-xl text-sm font-bold transition duration-200 cursor-pointer shadow-md flex items-center justify-center space-x-1.5 border-none"
        >
          {verifying ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Verify Transaction & Unlock Coordinates</span>
          )}
        </button>
      </div>

      <div className="h-px bg-slate-800" />
      
      <Link href="/map" className="block text-center text-slate-500 hover:text-slate-300 font-mono text-[11px] transition">
        ← Cancel transaction & return to map
      </Link>
    </div>
  );
}

export default function StandalonePayment() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col animate-fade-in">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-slate-400">Loading details...</div>}>
          <PaymentContent />
        </Suspense>
      </div>
    </div>
  );
}
