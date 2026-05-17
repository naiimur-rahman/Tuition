"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

function SuccessContent() {
  const searchParams = useSearchParams();
  const trxId = searchParams.get("trxId");

  return (
    <div className="bg-white shadow rounded-lg p-8 max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          You have successfully unlocked the exact location and contact details.
        </p>
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-sm text-gray-500">Transaction ID:</p>
          <p className="font-mono font-medium text-gray-900">{trxId || "N/A"}</p>
        </div>
        <Link
          href="/dashboard"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm"
        >
          Return to Dashboard
        </Link>
      </div>
  );
}

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
