"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] w-full bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center animate-pulse">
      <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full mr-2" />
      <span className="text-xs text-slate-400 font-mono">Initializing pick map...</span>
    </div>
  ),
});

const EDUCATION_LEVELS = [
  "Secondary School Certificate (SSC)",
  "Higher Secondary Certificate (HSC)",
  "Diploma / Technical Certificate",
  "Bachelor of Science (B.Sc)",
  "Bachelor of Arts (B.A)",
  "Bachelor of Business Administration (B.B.A)",
  "Bachelor of Social Science (B.S.S)",
  "Master of Science (M.Sc)",
  "Master of Arts (M.A)",
  "Master of Business Administration (M.B.A)",
  "Doctor of Philosophy (Ph.D) / Doctorate",
  "BCS Cadre Officer",
  "School Teacher",
  "College Lecturer",
  "University Professor / Lecturer",
  "Coaching Center Instructor"
];

export default function Dashboard() {
  const { data: session, status } = useSession() || { data: null, status: "unauthenticated" };
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [education, setEducation] = useState("");
  const [educationType, setEducationType] = useState("select"); // "select" or "custom"
  const [customEducation, setCustomEducation] = useState("");
  const [bio, setBio] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("UNVERIFIED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectedAt, setRejectedAt] = useState("");
  const [latitude, setLatitude] = useState(23.8103);
  const [longitude, setLongitude] = useState(90.4125);
  const [actualLatitude, setActualLatitude] = useState<number | null>(null);
  const [actualLongitude, setActualLongitude] = useState<number | null>(null);
  const [hasConfirmedTuition, setHasConfirmedTuition] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [hasAssignedTutor, setHasAssignedTutor] = useState(false);
  const [assignedTutors, setAssignedTutors] = useState<any[]>([]);
  const [tutorSeq, setTutorSeq] = useState<number | null>(null);

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

  useEffect(() => {
    if (session) {
      if ((session.user as any)?.role === "ADMIN") {
        router.push("/dashboard/admin");
        return;
      }

      fetch(`/api/profile?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.phone) setPhone(data.phone);
          if (data.address) setAddress(data.address);
          if (data.education) {
            setEducation(data.education);
            if (EDUCATION_LEVELS.includes(data.education)) {
              setEducationType("select");
            } else {
              setEducationType("custom");
              setCustomEducation(data.education);
            }
          }
          if (data.bio) setBio(data.bio);
          if (data.verificationStatus) setVerificationStatus(data.verificationStatus);
          if (data.rejectionReason) setRejectionReason(data.rejectionReason);
          if (data.rejectedAt) setRejectedAt(data.rejectedAt);
          if (data.latitude) setLatitude(data.latitude);
          if (data.longitude) setLongitude(data.longitude);
          if (data.actualLatitude) setActualLatitude(data.actualLatitude);
          if (data.actualLongitude) setActualLongitude(data.actualLongitude);
          if (data.hasConfirmedTuition !== undefined) setHasConfirmedTuition(data.hasConfirmedTuition);
          if (data.reviews) setReviews(data.reviews);
          if (data.averageRating !== undefined) setAverageRating(data.averageRating);
          if (data.hasAssignedTutor !== undefined) setHasAssignedTutor(data.hasAssignedTutor);
          if (data.assignedTutors) setAssignedTutors(data.assignedTutors);
          if (data.tutorSeq !== undefined) setTutorSeq(data.tutorSeq);
        })
        .catch((err) => console.error("Error loading profile:", err));
    }
  }, [session]);

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
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          phone, 
          address, 
          bio, 
          education,
          latitude,
          longitude,
          actualLatitude,
          actualLongitude
        }),
      });

      if (res.ok) {
        setProfileMessage("✓ Profile configurations updated successfully!");
      } else {
        setProfileMessage("Failed to update profile settings.");
      }
    } catch (err) {
      console.error("SAVE_PROFILE_ERROR", err);
      setProfileMessage("An error occurred while saving profile.");
    } finally {
      setIsSavingProfile(false);
    }
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
                <span className="ml-3 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs rounded font-bold font-mono">
                  {role === "TUTOR"
                    ? `TC-${String(tutorSeq && tutorSeq > 0 ? tutorSeq : 1).padStart(3, '0')}`
                    : `TP-${String(tutorSeq && tutorSeq > 0 ? tutorSeq : 1).padStart(3, '0')}`}
                </span>
              </p>
            </div>

            {role === "TUTOR" ? (
              verificationStatus === "VERIFIED" ? (
                <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.05)] w-fit font-bold">
                  <svg className="w-4 h-4 mr-1 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified Tutor Badge Active
                </div>
              ) : verificationStatus === "PENDING" ? (
                <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.05)] w-fit font-bold">
                  <svg className="w-4 h-4 mr-1 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verification Request Pending
                </div>
              ) : verificationStatus === "REJECTED" ? (
                <div className="flex flex-col md:items-end gap-2 text-right">
                  <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.05)] w-fit font-bold md:ml-auto">
                    <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verification Rejected
                  </div>
                  {rejectionReason && (
                    <div className="bg-red-950/20 border border-red-900/30 text-red-400 p-3.5 rounded-xl text-xs max-w-md text-left font-sans space-y-1.5 shadow-inner">
                      <div className="font-bold flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Rejection Explanation
                      </div>
                      <p className="leading-relaxed font-sans">{rejectionReason}</p>
                      {rejectedAt && (
                        <div className="text-[10px] text-red-500/80 font-mono mt-1 pt-1 border-t border-red-900/20">
                          Declined: {new Date(rejectedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.05)] w-fit">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Unverified Profile State
                </div>
              )
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

                {/* Map Geolocation Selector */}
                <div className="space-y-2 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Coordinates Resolution Map
                  </label>
                  <MapPicker
                    initialLat={latitude}
                    initialLng={longitude}
                    onChange={({ lat, lng, actualLat, actualLng }) => {
                      setLatitude(lat);
                      setLongitude(lng);
                      if (actualLat !== undefined) setActualLatitude(actualLat);
                      if (actualLng !== undefined) setActualLongitude(actualLng);
                    }}
                  />
                </div>

                {role === "TUTOR" && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Highest Education Level</label>
                      <select
                        value={educationType === "custom" ? "Other" : education}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "Other") {
                            setEducationType("custom");
                            setEducation(customEducation || "");
                          } else {
                            setEducationType("select");
                            setEducation(val);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 cursor-pointer"
                      >
                        <option value="" disabled className="bg-slate-950 text-slate-500">-- Select Education Level --</option>
                        {EDUCATION_LEVELS.map((level) => (
                          <option key={level} value={level} className="bg-slate-950 text-slate-100">
                            {level}
                          </option>
                        ))}
                        <option value="Other" className="bg-slate-950 text-indigo-400 font-bold">
                          Other (Specify Custom Level)
                        </option>
                      </select>

                      {educationType === "custom" && (
                        <input
                          type="text"
                          required
                          value={customEducation}
                          onChange={(e) => {
                            setCustomEducation(e.target.value);
                            setEducation(e.target.value);
                          }}
                          placeholder="Type your custom educational details (e.g. B.Sc in CSE from BUET)"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 mt-1.5 animate-fadeIn"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Short Bio / Specialty</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                        placeholder="e.g. O-Level Math and Physics Specialist"
                      />
                    </div>
                  </>
                )}

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
                        const nidInput = e.currentTarget.nidImage as HTMLInputElement;
                        const studentIdInput = e.currentTarget.studentIdImage as HTMLInputElement;

                        const nidFile = nidInput.files?.[0];
                        const studentIdFile = studentIdInput.files?.[0];

                        if (!nidFile && !studentIdFile) {
                          alert("Please select at least one document scan (NID or Student ID) to upload.");
                          setIsSubmittingVerify(false);
                          return;
                        }

                        let nidUrl = "";
                        let studentIdUrl = "";

                        // 1. Upload NID Scan if selected
                        if (nidFile) {
                          const uploadRes = await fetch(`/api/upload?context=tutor&filename=${encodeURIComponent("nid-" + nidFile.name)}`, {
                            method: "POST",
                            body: nidFile,
                          });

                          if (!uploadRes.ok) {
                            throw new Error("Failed to upload National ID scan.");
                          }

                          const blobJson = await uploadRes.json();
                          nidUrl = blobJson.url;
                        }

                        // 2. Upload Student ID Scan if selected
                        if (studentIdFile) {
                          const uploadRes = await fetch(`/api/upload?context=tutor&filename=${encodeURIComponent("stud-" + studentIdFile.name)}`, {
                            method: "POST",
                            body: studentIdFile,
                          });

                          if (!uploadRes.ok) {
                            throw new Error("Failed to upload Student ID scan.");
                          }

                          const blobJson = await uploadRes.json();
                          studentIdUrl = blobJson.url;
                        }

                        // 3. Log profile verification in real database
                        const res = await fetch("/api/profile/verify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            nidImageUrl: nidUrl || undefined,
                            universityIdImageUrl: studentIdUrl || undefined,
                          }),
                        });

                        setIsSubmittingVerify(false);
                        if (res.ok) {
                          setVerificationStatus("PENDING");
                          setRejectionReason("");
                          setRejectedAt("");
                          alert("✓ Credentials uploaded and verification request logged! Status: PENDING.");
                          e.currentTarget.reset();
                        } else {
                          alert("Failed to record verification request.");
                        }
                      } catch (error: any) {
                        console.error("UPLOAD_VERIFY_ERROR", error);
                        alert(error?.message || "An error occurred during credential upload. Please try again.");
                        setIsSubmittingVerify(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">National ID (NID) Scan</label>
                        <input
                          type="file"
                          name="nidImage"
                          accept="image/*,application/pdf"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-xl px-3.5 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:cursor-pointer cursor-pointer focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Student ID Card Scan</label>
                        <input
                          type="file"
                          name="studentIdImage"
                          accept="image/*,application/pdf"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-xl px-3.5 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 file:cursor-pointer cursor-pointer focus:outline-none"
                        />
                      </div>
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

                  {/* DYNAMIC EDUCATOR RATING SYSTEM PANEL */}
                  {hasConfirmedTuition && (
                    <div className="mt-8 border-t border-slate-800/80 pt-8 space-y-6">
                      <div>
                        <h2 className="text-xl font-bold font-heading text-white">Educator Performance & Ratings</h2>
                        <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Telemetry from verified parent reviews</p>
                      </div>
                      <div className="h-px bg-slate-800/80" />

                      <div className="glass-card bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Average Rating Score</span>
                          <span className="text-2xl font-extrabold text-white mt-1 block flex items-center gap-1.5 font-mono">
                            ⭐ {averageRating} <span className="text-xs font-normal text-slate-500 font-mono">/ 5.0</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Reviews</span>
                          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
                            {reviews.length} Feedbacks
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Recent Parent Feedback</span>
                        {reviews.length === 0 ? (
                          <p className="text-xs text-slate-500 font-mono italic">No reviews submitted yet.</p>
                        ) : (
                          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                            {reviews.map((r: any) => (
                              <div key={r.id} className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white">{r.author?.name || "Parent"}</span>
                                  <span className="text-xs text-emerald-400 font-bold font-mono">★ {r.rating}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-sans italic">
                                  "{r.comment || "No comment left."}"
                                </p>
                                <span className="text-[9px] text-slate-600 font-mono block">
                                  {new Date(r.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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

                  {/* ACTIVE ASSIGNED TUTORS LEDGER FOR PARENTS */}
                  {assignedTutors.length > 0 && (
                    <div className="mt-8 border-t border-slate-800/80 pt-8 space-y-6">
                      <div>
                        <h2 className="text-xl font-bold font-heading text-white">Matched Roster Tutors</h2>
                        <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Assigned educators for your active tuition listings</p>
                      </div>
                      <div className="h-px bg-slate-800/80" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assignedTutors.map((t: any) => (
                          <div key={t.id} className="bg-slate-950/60 border border-slate-850 p-4.5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-extrabold">
                                TC-{String(t.tutorSeq).padStart(3, '0')}
                              </span>
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md uppercase font-extrabold tracking-wider">
                                Assigned
                              </span>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Matching Tuition Job</span>
                              <span className="text-xs text-slate-200 font-bold block">{t.jobTitle}</span>
                            </div>

                            <div className="space-y-1 pt-1.5 border-t border-slate-900">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Education & Qualification</span>
                              <p className="text-xs text-emerald-300 leading-relaxed font-sans font-semibold">
                                {t.education}
                              </p>
                            </div>

                            {/* Privacy limitations notice */}
                            <div className="bg-slate-900/40 border border-slate-850/80 p-2.5 rounded-xl text-[9px] font-mono text-slate-500 flex items-center gap-1.5 mt-2">
                              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span>Official match verified. Personal contacts hidden.</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBMIT REVIEW SECTION FOR PARENTS */}
                  <div className="mt-8 border-t border-slate-800/80 pt-8 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold font-heading text-white">Rate System Educators</h2>
                      <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Leave ratings feedback for active tutors</p>
                    </div>
                    <div className="h-px bg-slate-800/80" />

                    {hasAssignedTutor ? (
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
                            alert("Failed to post review.");
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Select Assigned Tutor</label>
                            <select
                              name="tutorId"
                              required
                              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                            >
                              {assignedTutors.map((t: any) => (
                                <option key={t.id} value={t.id} className="bg-slate-950 text-slate-100">
                                  TC-{String(t.tutorSeq).padStart(3, '0')} ({t.jobTitle})
                                </option>
                              ))}
                            </select>
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
                    ) : (
                      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 text-center space-y-3">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-950 border border-slate-800 text-slate-500 shadow-inner">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-300">Ratings System Locked</h3>
                          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
                            The rating & feedback console will automatically open once a verified tutor has been assigned to one of your active tuition listings.
                          </p>
                        </div>
                      </div>
                    )}
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
