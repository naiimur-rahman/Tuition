"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { data: session, status } = useSession() || { data: null, status: "unauthenticated" };
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Securing Dashboard Session...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const role = (session.user as any)?.role || "PARENT";
  const email = session.user?.email || "";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage("");
    // Simulate API call to save settings
    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileMessage("✓ Profile configurations updated successfully!");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full flex-grow">
        {/* Profile Welcome Header */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/5 rounded-full filter blur-[50px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">
                Welcome, {session.user?.name || "Operator"}
              </h1>
              <p className="text-slate-400 text-sm font-mono flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                Logged in as: <span className="text-emerald-400 ml-1 font-bold uppercase tracking-wider">{role}</span>
              </p>
            </div>

            {role === "TUTOR" ? (
              <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.05)] w-fit">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Unverified Profile State
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.05)] w-fit">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Parent Account Active
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Column 1: Profile Settings (Left) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-xl font-bold font-heading text-white">Profile Coordinates</h2>
                <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Configure local details</p>
              </div>
              <div className="h-px bg-slate-800/80" />

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                    placeholder="+880 17XXXXXXXX"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Address / Area</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                    placeholder="Banani, Dhaka"
                  />
                </div>

                <AnimatePresence>
                  {profileMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2.5 px-3 rounded-xl font-mono"
                    >
                      {profileMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 py-3 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
                      <span>Saving config...</span>
                    </>
                  ) : (
                    <span>Save Config</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Column 2: Role Specific Board (Right) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
              {role === "TUTOR" ? (
                // TUTOR INTERFACE
                <>
                  <div>
                    <h2 className="text-xl font-bold font-heading text-white">Operator Verification</h2>
                    <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Acquire verified credentials badge</p>
                  </div>
                  <div className="h-px bg-slate-800/80" />

                  <p className="text-sm text-slate-400 leading-relaxed font-sans">
                    Submit your NID, passport scan, or student ID credentials. Verified tutors receive a badge on search popups and enjoy much higher matching priority.
                  </p>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSubmittingVerify(true);

                      try {
                        const fileInput = e.currentTarget.idImage as HTMLInputElement;
                        const file = fileInput.files?.[0];
                        if (!file) {
                          alert("Please select a credential document scan to upload.");
                          setIsSubmittingVerify(false);
                          return;
                        }

                        // 1. Upload raw binary stream directly to Vercel Blob
                        const uploadRes = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                          method: "POST",
                          body: file,
                        });

                        if (!uploadRes.ok) {
                          throw new Error("Failed to upload credential image to Vercel Blob.");
                        }

                        const blobJson = await uploadRes.json();
                        const uploadedUrl = blobJson.url;

                        // 2. Log profile verification in real database
                        const res = await fetch("/api/profile/verify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ idImageUrl: uploadedUrl }),
                        });

                        setIsSubmittingVerify(false);
                        if (res.ok) {
                          alert("✓ Credentials uploaded and verification request logged! Status: PENDING.");
                          e.currentTarget.reset();
                        } else {
                          alert("Failed to record verification request.");
                        }
                      } catch (error) {
                        console.error("UPLOAD_VERIFY_ERROR", error);
                        alert("An error occurred during credential upload. Please try again.");
                        setIsSubmittingVerify(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Select Credential Document Scan</label>
                      <input
                        type="file"
                        name="idImage"
                        required
                        className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-xl px-3.5 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 file:cursor-pointer cursor-pointer focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingVerify}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.1)] flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSubmittingVerify ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                          <span>Uploading credentials...</span>
                        </>
                      ) : (
                        <span>Submit for Verification</span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                // PARENT INTERFACE
                <>
                  <div>
                    <h2 className="text-xl font-bold font-heading text-white">Create New Tuition Entry</h2>
                    <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Publish open match specifications</p>
                  </div>
                  <div className="h-px bg-slate-800/80" />

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSubmittingJob(true);
                      const formData = new FormData(e.currentTarget);
                      const data = {
                        title: formData.get("title"),
                        subject: formData.get("subject"),
                        classLevel: formData.get("classLevel"),
                        salary: formData.get("salary"),
                        description: formData.get("description"),
                        latitude: 23.8103, // Central Dhaka
                        longitude: 90.4125,
                      };

                      const res = await fetch("/api/jobs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                      });

                      setIsSubmittingJob(false);
                      if (res.ok) {
                        alert("✓ Tuition job entry published successfully! Check the search map.");
                        e.currentTarget.reset();
                      } else {
                        alert("Failed to publish tuition job.");
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Listing Title</label>
                        <input
                          type="text"
                          name="title"
                          required
                          placeholder="e.g. Edexcel Maths Tutor Required"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Subject Parameter</label>
                        <input
                          type="text"
                          name="subject"
                          required
                          placeholder="e.g. Mathematics"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Class / Medium</label>
                        <input
                          type="text"
                          name="classLevel"
                          required
                          placeholder="e.g. O Level"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Salary BDT / Month</label>
                        <input
                          type="number"
                          name="salary"
                          required
                          placeholder="e.g. 10000"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Detailed Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        placeholder="e.g. Looking for a tutor who can teach Edexcel syllabus 3 days a week. Focus on calculus and algebra."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                      />
                    </div>

                    <div className="text-[10px] text-yellow-500 font-mono flex items-center bg-yellow-500/5 border border-yellow-500/10 p-2.5 rounded-xl">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      GPS location coordinates will mock to central Dhaka area for mapping simulation.
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingJob}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSubmittingJob ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                          <span>Publishing entry...</span>
                        </>
                      ) : (
                        <span>Publish Tuition Entry</span>
                      )}
                    </button>
                  </form>

                  {/* SUBMIT REVIEW SECTION FOR PARENTS */}
                  <div className="mt-8 border-t border-slate-800/80 pt-8 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold font-heading text-white">Rate System Educators</h2>
                      <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Leave ratings feedback for active tutors</p>
                    </div>
                    <div className="h-px bg-slate-800/80" />

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSubmittingReview(true);
                        const formData = new FormData(e.currentTarget);
                        const data = {
                          targetId: formData.get("tutorId"),
                          rating: formData.get("rating"),
                          comment: formData.get("comment"),
                        };

                        const res = await fetch("/api/reviews", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(data),
                        });

                        setIsSubmittingReview(false);
                        if (res.ok) {
                          alert("✓ Review feedback submitted successfully!");
                          e.currentTarget.reset();
                        } else {
                          alert("Failed to post review. Ensure the tutor operator ID matches correctly.");
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Tutor Operator ID</label>
                          <input
                            type="text"
                            name="tutorId"
                            required
                            placeholder="e.g. clk34x78..."
                            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Score Rating (1-5)</label>
                          <input
                            type="number"
                            name="rating"
                            min="1"
                            max="5"
                            required
                            placeholder="5"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Quality Reviews Feedback</label>
                        <textarea
                          name="comment"
                          rows={2}
                          placeholder="e.g. Excellent math tutor. Prompt, patient, and highly knowledgeable."
                          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {isSubmittingReview ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                            <span>Submitting review...</span>
                          </>
                        ) : (
                          <span>Submit Review Feedback</span>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
