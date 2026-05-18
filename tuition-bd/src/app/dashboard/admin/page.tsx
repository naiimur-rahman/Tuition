"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components to secure static Next.js compilation safety
const AdminLocationMismatchMap = dynamic(() => import("@/components/map/AdminLocationMismatchMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] w-full bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
      <span className="text-xs text-slate-500 font-mono">Loading inspection map...</span>
    </div>
  ),
});

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] w-full bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center animate-pulse">
      <span className="text-xs text-slate-400 font-mono">Initializing pick map...</span>
    </div>
  ),
});

// Haversine formula helper to audit distance discrepancies in kilometers
function getDistanceInKm(lat1: number | null, lon1: number | null, lat2: number | null, lon2: number | null) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Convert DB Sequence identifier into beautiful TC-XXX / TP-XXX visual sequences
const getVisualId = (role: string, seq: number | null) => {
  const index = seq && seq > 0 ? seq : 1;
  const prefix = role === "TUTOR" ? "TC-" : "TP-";
  return `${prefix}${String(index).padStart(3, "0")}`;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession() || { data: null, status: "unauthenticated" };
  const router = useRouter();

  // Tab switcher and basic loaders
  const [activeTab, setActiveTab] = useState<"documents" | "tutors" | "parents" | "blacklist">("documents");
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [loadingAllProfiles, setLoadingAllProfiles] = useState(false);
  const [blacklisted, setBlacklisted] = useState<any[]>([]);
  const [loadingBlacklist, setLoadingBlacklist] = useState(false);
  const [previewDocuments, setPreviewDocuments] = useState<{
    nid: string | null;
    idCard: string | null;
    name: string;
    profileId: string;
  } | null>(null);

  // Interaction tracking state hooks
  const [expandedMapProfileId, setExpandedMapProfileId] = useState<string | null>(null);
  const [rejectionPromptProfileId, setRejectionPromptProfileId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [customRejectionSelected, setCustomRejectionSelected] = useState(false);

  // Master editor state structures
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    education: "",
    bio: "",
    latitude: 23.8103,
    longitude: 90.4125,
    verificationStatus: "UNVERIFIED",
    rejectionReason: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editError, setEditError] = useState("");

  // Rejection predefined options templates
  const REJECTION_TEMPLATES = [
    "Uploaded document scans are blurred, dark, or unreadable.",
    "Provided name or education level does not match uploaded identifier credentials.",
    "Device GPS geolocation coordinates deviate severely from claimed home coordinates.",
  ];

  // Route security gate calculations
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && (session.user as any).role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Load document verification queue
  const fetchPendingVerifications = () => {
    setLoadingProfiles(true);
    fetch(`/api/admin/verify?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        setPendingProfiles(Array.isArray(data) ? data : []);
        setLoadingProfiles(false);
      })
      .catch((err) => {
        console.error("Load Pending error:", err);
        setLoadingProfiles(false);
      });
  };

  // Load complete Parents & Tutors directories
  const fetchAllProfilesList = () => {
    setLoadingAllProfiles(true);
    fetch(`/api/admin/profiles?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        setAllProfiles(Array.isArray(data) ? data : []);
        setLoadingAllProfiles(false);
      })
      .catch((err) => {
        console.error("Load Directories error:", err);
        setLoadingAllProfiles(false);
      });
  };

  useEffect(() => {
    if (session && (session.user as any).role === "ADMIN") {
      fetchPendingVerifications();
    }
  }, [session]);

  useEffect(() => {
    if (session && (session.user as any).role === "ADMIN" && (activeTab === "tutors" || activeTab === "parents")) {
      fetchAllProfilesList();
    }
  }, [session, activeTab]);

  const fetchBlacklist = () => {
    setLoadingBlacklist(true);
    fetch(`/api/admin/blacklist?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        setBlacklisted(Array.isArray(data) ? data : []);
        setLoadingBlacklist(false);
      })
      .catch((err) => {
        console.error("Load Blacklist error:", err);
        setLoadingBlacklist(false);
      });
  };

  useEffect(() => {
    if (session && (session.user as any).role === "ADMIN" && activeTab === "blacklist") {
      fetchBlacklist();
    }
  }, [session, activeTab]);

  const handleBanUser = async (userId: string) => {
    const reason = prompt("Enter a reason for banning this user:");
    if (reason === null) return;

    if (!confirm("Are you sure you want to ban this user? Their account will be deleted and phone number blacklisted.")) return;

    try {
      const res = await fetch("/api/admin/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reason }),
      });
      if (res.ok) {
        alert("✓ User has been successfully banned and their number blacklisted.");
        fetchAllProfilesList();
      } else {
        alert("Failed to ban user.");
      }
    } catch (err) {
      console.error("Ban error:", err);
      alert("An error occurred while banning the user.");
    }
  };

  const handleUnban = async (blacklistId: string) => {
    if (!confirm("Are you sure you want to remove this number from the blacklist?")) return;
    try {
      const res = await fetch(`/api/admin/blacklist?id=${blacklistId}`, { method: "DELETE" });
      if (res.ok) {
        fetchBlacklist();
      } else {
        alert("Failed to remove from blacklist.");
      }
    } catch (err) {
      console.error("Unban error:", err);
      alert("An error occurred while removing from blacklist.");
    }
  };

  // Verification Approvals and Rejections controller
  const handleVerify = async (profileId: string, verifyStatus: "VERIFIED" | "REJECTED", reason?: string) => {
    try {
      const res = await fetch("/api/admin/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          status: verifyStatus,
          rejectionReason: verifyStatus === "REJECTED" ? reason : undefined,
        }),
      });

      if (res.ok) {
        setPendingProfiles((prev) => prev.filter((p) => p.id !== profileId));
        alert(`✓ Tutor account status has been marked as ${verifyStatus.toLowerCase()} successfully.`);
        setRejectionPromptProfileId(null);
        setRejectionReasonInput("");
        setCustomRejectionSelected(false);
        // Refresh directories list too if loaded
        if (activeTab === "tutors" || activeTab === "parents") {
          fetchAllProfilesList();
        }
      } else {
        alert("Failed to update verification status.");
      }
    } catch (err) {
      console.error("Verification updates failed:", err);
      alert("An error occurred while modifying account verification.");
    }
  };

  // Modal Editing submit handler
  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setEditError("");

    try {
      const res = await fetch("/api/admin/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: editingProfile.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          education: editingProfile.user.role === "TUTOR" ? editForm.education : undefined,
          bio: editingProfile.user.role === "TUTOR" ? editForm.bio : undefined,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
          verificationStatus: editForm.verificationStatus,
          rejectionReason: editForm.verificationStatus === "REJECTED" ? editForm.rejectionReason : undefined,
        }),
      });

      if (res.ok) {
        setEditingProfile(null);
        alert("✓ Master account records synchronized and successfully updated!");
        // Refresh active views
        if (activeTab === "tutors" || activeTab === "parents") {
          fetchAllProfilesList();
        } else {
          fetchPendingVerifications();
        }
      } else {
        const errMsg = await res.text();
        setEditError(errMsg || "Failed to update profile records.");
      }
    } catch (err) {
      console.error("Save details error:", err);
      setEditError("Internal server error while transmitting modifications.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open Edit Modal loader helper
  const handleOpenEditModal = (profile: any) => {
    setEditingProfile(profile);
    setEditForm({
      name: profile.user?.name || "",
      email: profile.user?.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      education: profile.education || "",
      bio: profile.bio || "",
      latitude: profile.latitude || 23.8103,
      longitude: profile.longitude || 90.4125,
      verificationStatus: profile.verificationStatus || "UNVERIFIED",
      rejectionReason: profile.rejectionReason || "",
    });
    setEditError("");
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Securing Session...</p>
      </div>
    );
  }

  // Calculate quick glowing summaries
  const mismatchAlerts = allProfiles.filter((p) => {
    const d = getDistanceInKm(p.latitude, p.longitude, p.actualLatitude, p.actualLongitude);
    return d > 2.0;
  }).length;

  const renderDirectoryTab = (role: "TUTOR" | "PARENT") => {
    const filteredProfiles = allProfiles.filter((p) => p.user?.role === role);

    return (
      <div className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800 space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading text-white">
            {role === "TUTOR" ? "Tutor Directory & Location Audits" : "Parent Directory & Location Audits"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">
            {role === "TUTOR"
              ? "Track geolocations, calculate mismatch distances, and inspect tutor spatial mappings"
              : "Track parent coordinates, verify tuition areas, and oversee platform access"}
          </p>
        </div>
        <div className="h-px bg-slate-800/80" />

        {loadingAllProfiles ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
            <span className="text-xs text-slate-400 font-mono">Fetching active directory...</span>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="py-12 text-center bg-slate-900/10 border border-slate-900 rounded-xl space-y-2 animate-fadeIn">
            <span className="text-3xl">👥</span>
            <h3 className="text-sm font-bold text-slate-300">No {role === "TUTOR" ? "Tutors" : "Parents"} Seeded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Could not detect any {role === "TUTOR" ? "tutor" : "parent"} profile structures registered in the database.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProfiles.map((profile) => {
              const dist = getDistanceInKm(
                profile.latitude,
                profile.longitude,
                profile.actualLatitude,
                profile.actualLongitude
              );
              const isHighMismatch = dist > 2.0;

              return (
                <div
                  key={profile.id}
                  className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 hover:border-slate-800 transition-all duration-300 animate-fadeIn"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center space-y-1 mt-0.5">
                        <span className="text-xs text-indigo-400 font-bold font-mono px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded">
                          {getVisualId(profile.user?.role || "PARENT", profile.tutorSeq)}
                        </span>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          profile.user?.role === "TUTOR"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        }`}>
                          {profile.user?.role || "PARENT"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          {profile.user?.name || "Unknown Operator"}
                          {profile.verificationStatus === "VERIFIED" && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono uppercase tracking-wider font-bold">
                              ✓ Verified
                            </span>
                          )}
                          {profile.verificationStatus === "PENDING" && (
                            <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-mono uppercase tracking-wider font-bold">
                              Pending
                            </span>
                          )}
                          {profile.verificationStatus === "REJECTED" && (
                            <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 font-mono uppercase tracking-wider font-bold">
                              Rejected
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          {profile.user?.email} | 📞 {profile.phone || "No phone"}
                        </p>
                        <p className="text-xs text-slate-500 font-sans">
                          📍 Claimed: {profile.address || "No address entered"}
                        </p>
                      </div>
                    </div>

                    {/* Distance telemetry and inspect mapping */}
                    <div className="flex flex-wrap items-center gap-3">
                      {profile.latitude !== null && profile.actualLatitude !== null ? (
                        <div className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-mono text-xs border ${
                          isHighMismatch
                            ? "bg-red-500/10 border-red-500/25 text-red-400"
                            : "bg-slate-900 border-slate-800 text-slate-300"
                        }`}>
                          <span>
                            {isHighMismatch ? "⚠️ GPS Mismatch:" : "✓ Location Mism:"}
                          </span>
                          <strong className="font-bold">{dist.toFixed(2)} km</strong>
                        </div>
                      ) : (
                        <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl font-mono text-xs text-slate-500">
                          GPS Unresolved
                        </div>
                      )}

                      {profile.latitude !== null && profile.actualLatitude !== null && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMapProfileId(
                              expandedMapProfileId === profile.id ? null : profile.id
                            )
                          }
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono font-bold transition duration-200 cursor-pointer"
                        >
                          {expandedMapProfileId === profile.id ? "🗺️ Collapse Map" : "🗺️ Inspect Map"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(profile)}
                        className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 px-3 py-2 rounded-xl transition duration-200 cursor-pointer"
                        title="Edit Profile Details"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBanUser(profile.user?.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl transition duration-200 cursor-pointer text-xs font-bold font-mono uppercase"
                        title="Ban and Blacklist User"
                      >
                        🚫 Ban
                      </button>
                    </div>
                  </div>

                  {/* Expandable Location Auditing Leaflet widgets */}
                  <AnimatePresence>
                    {expandedMapProfileId === profile.id &&
                      profile.latitude !== null &&
                      profile.actualLatitude !== null && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                              <span>Provided Pin: {profile.latitude.toFixed(5)}, {profile.longitude.toFixed(5)}</span>
                              <span className="text-red-400 font-bold">Physical Device GPS: {profile.actualLatitude.toFixed(5)}, {profile.actualLongitude.toFixed(5)}</span>
                            </div>
                            <AdminLocationMismatchMap
                              lat={profile.latitude}
                              lng={profile.longitude}
                              actualLat={profile.actualLatitude}
                              actualLng={profile.actualLongitude}
                              name={profile.user?.name || "Operator"}
                            />
                          </div>
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* Extra bio/education for tutors inside directories list */}
                  {profile.user?.role === "TUTOR" && (
                    <div className="bg-slate-900/20 p-3.5 border border-slate-900/60 rounded-xl text-xs font-sans text-slate-400 space-y-1.5">
                      <p>
                        <strong className="text-slate-300">Educator Levels:</strong> {profile.education || "Not configured"}
                      </p>
                      <p className="italic">
                        <strong className="text-slate-300 not-italic">Bio:</strong> "{profile.bio || "No biography loaded."}"
                      </p>
                      {(profile.nidImageUrl || profile.universityIdImageUrl) && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setPreviewDocuments({
                              nid: profile.nidImageUrl,
                              idCard: profile.universityIdImageUrl,
                              name: profile.user?.name || "Educator",
                              profileId: profile.id
                            })}
                            className="bg-slate-900 hover:bg-slate-850 text-[10px] text-slate-300 border border-slate-850 px-2.5 py-1.5 rounded-lg font-mono uppercase font-bold tracking-wider cursor-pointer"
                          >
                            🔍 Inspect Document Scans
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative z-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full relative z-10 space-y-8">
        
        {/* Welcome Header */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-emerald-500/5 rounded-full filter blur-[60px] pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1 flex-shrink-0">
              <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">
                Admin Control Console
              </h1>
              <p className="text-slate-400 text-sm font-mono flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                Operational Credentials Authorized: <span className="text-emerald-400 ml-1 font-bold">SYSTEM ADMINISTRATOR</span>
              </p>
            </div>
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono w-full">
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex flex-col">
                <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Verification Queue</span>
                <span className="text-xl font-extrabold text-white mt-1">{pendingProfiles.length} Pending</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex flex-col">
                <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Registered Tutors</span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1">
                  {allProfiles.length > 0 ? allProfiles.filter((p) => p.user?.role === "TUTOR").length : 0} Active
                </span>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex flex-col">
                <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Registered Parents</span>
                <span className="text-xl font-extrabold text-indigo-400 mt-1">
                  {allProfiles.length > 0 ? allProfiles.filter((p) => p.user?.role === "PARENT").length : 0} Active
                </span>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex flex-col">
                <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">GPS Mismatches</span>
                <span className={`text-xl font-extrabold mt-1 ${mismatchAlerts > 0 ? "text-yellow-500" : "text-slate-400"}`}>
                  {mismatchAlerts} Flagged
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Glassmorphism Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 pb-px overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-3.5 font-bold font-mono text-xs uppercase tracking-wider transition-all duration-300 border-b-2 cursor-pointer ${
              activeTab === "documents"
                ? "text-emerald-400 border-emerald-500 bg-emerald-500/5 shadow-[inset_0_-2px_0_rgba(16,185,129,1)]"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            📋 ID Verification Queue ({pendingProfiles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tutors")}
            className={`px-6 py-3.5 font-bold font-mono text-xs uppercase tracking-wider transition-all duration-300 border-b-2 cursor-pointer ${
              activeTab === "tutors"
                ? "text-emerald-400 border-emerald-500 bg-emerald-500/5 shadow-[inset_0_-2px_0_rgba(16,185,129,1)]"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            🎓 Tutor Directory ({allProfiles.length > 0 ? allProfiles.filter((p) => p.user?.role === "TUTOR").length : 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("parents")}
            className={`px-6 py-3.5 font-bold font-mono text-xs uppercase tracking-wider transition-all duration-300 border-b-2 cursor-pointer ${
              activeTab === "parents"
                ? "text-emerald-400 border-emerald-500 bg-emerald-500/5 shadow-[inset_0_-2px_0_rgba(16,185,129,1)]"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            👥 Parent Directory ({allProfiles.length > 0 ? allProfiles.filter((p) => p.user?.role === "PARENT").length : 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("blacklist")}
            className={`px-6 py-3.5 font-bold font-mono text-xs uppercase tracking-wider transition-all duration-300 border-b-2 cursor-pointer ${
              activeTab === "blacklist"
                ? "text-red-400 border-red-500 bg-red-500/5 shadow-[inset_0_-2px_0_rgba(239,68,68,1)]"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            🚫 Blacklist Manager
          </button>
        </div>

        {/* TAB Content Rendering */}
        <AnimatePresence mode="wait">
          {activeTab === "documents" && (
            <motion.div
              key="documentsTab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800 space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-heading text-white">Educator Credentials Audit</h2>
                  <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Inspect and authorize pending tutor verifications</p>
                </div>
                <div className="h-px bg-slate-800/80" />

                {loadingProfiles ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                    <span className="text-xs text-slate-400 font-mono">Retrieving queue...</span>
                  </div>
                ) : pendingProfiles.length === 0 ? (
                  <div className="py-12 text-center bg-slate-900/10 border border-slate-900 rounded-xl space-y-2">
                    <span className="text-3xl">✨</span>
                    <h3 className="text-sm font-bold text-slate-300">Clean Inspection Registry</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      All educator credential uploads have been processed! No pending verification requests in the queue.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="bg-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-800 transition-all duration-300"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-indigo-400 font-bold font-mono px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded">
                              {getVisualId(profile.user?.role || "TUTOR", profile.tutorSeq)}
                            </span>
                            <span className="text-[10px] text-yellow-500 bg-yellow-500/5 border border-yellow-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                              Pending Review
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-white leading-tight">{profile.user?.name || "Anonymous Educator"}</h3>
                            <p className="text-xs text-slate-400 font-mono">{profile.user?.email}</p>
                            <p className="text-xs text-slate-500 font-sans">📞 {profile.phone || "No phone registered"}</p>
                          </div>

                          <div className="h-px bg-slate-900" />

                          <div className="space-y-1 font-sans text-xs">
                            <p className="text-slate-400">
                              <strong className="text-slate-300">Education:</strong> {profile.education || "Not specified"}
                            </p>
                            <p className="text-slate-400 leading-relaxed max-h-[60px] overflow-y-auto italic">
                              <strong className="text-slate-300 font-normal not-italic">Bio: </strong> "{profile.bio || "No biography provided."}"
                            </p>
                          </div>

                          {/* Premium Document Preview Trigger */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setPreviewDocuments({
                                nid: profile.nidImageUrl,
                                idCard: profile.universityIdImageUrl,
                                name: profile.user?.name || "Educator",
                                profileId: profile.id
                              })}
                              className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition duration-200 cursor-pointer"
                            >
                              🔍 Preview Uploaded Documents
                            </button>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-900 flex space-x-3">
                          <button
                            type="button"
                            onClick={() => handleVerify(profile.id, "VERIFIED")}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-[0_4px_10px_rgba(16,185,129,0.15)] text-center"
                          >
                            Approve Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectionPromptProfileId(profile.id)}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer text-center"
                          >
                            Reject Scan
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(profile)}
                            className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 px-3.5 py-2.5 rounded-xl transition duration-200 cursor-pointer"
                            title="Edit Account Records"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "tutors" && (
            <motion.div
              key="tutorsTab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {renderDirectoryTab("TUTOR")}
            </motion.div>
          )}

          {activeTab === "parents" && (
            <motion.div
              key="parentsTab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {renderDirectoryTab("PARENT")}
            </motion.div>
          )}

          {activeTab === "blacklist" && (
            <motion.div
              key="blacklistTab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6 md:p-8 border border-red-500/20 space-y-6 relative overflow-hidden bg-slate-950">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-red-500/5 rounded-full filter blur-[60px] pointer-events-none" />
                <div>
                  <h2 className="text-xl font-bold font-heading text-red-400">Blacklisted Phone Numbers</h2>
                  <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">
                    These numbers are permanently blocked from registering new accounts.
                  </p>
                </div>
                <div className="h-px bg-slate-800/80" />

                {loadingBlacklist ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full" />
                    <span className="text-xs text-slate-400 font-mono">Fetching blacklist...</span>
                  </div>
                ) : blacklisted.length === 0 ? (
                  <div className="py-12 text-center bg-slate-900/10 border border-slate-900 rounded-xl space-y-2 animate-fadeIn">
                    <span className="text-3xl">✅</span>
                    <h3 className="text-sm font-bold text-slate-300">No Banned Users</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      The blacklist is currently empty. No numbers have been banned.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blacklisted.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4 hover:border-red-500/30 transition-all duration-300 animate-fadeIn relative"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                              {item.phone}
                              <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 font-mono uppercase tracking-wider font-bold">
                                Banned
                              </span>
                            </h3>
                            <p className="text-xs text-slate-400 font-mono">
                              {item.name || "Unknown"} | {item.role || "UNKNOWN"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-sans mt-2 italic bg-slate-950 p-2 rounded border border-slate-800/60">
                              Reason: {item.reason || "No reason provided."}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUnban(item.id)}
                            className="bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 px-3 py-1.5 rounded-lg transition duration-200 cursor-pointer text-[10px] font-bold font-mono uppercase"
                            title="Remove from Blacklist"
                          >
                            Unban
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PREMIUM IN-APP REJECTION PROMPT DIALOG MODAL */}
      <AnimatePresence>
        {rejectionPromptProfileId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card border border-slate-800 p-6 md:p-8 rounded-3xl max-w-lg w-full scale-100 shadow-2xl space-y-6 relative bg-slate-950"
            >
              <div>
                <h3 className="text-lg font-bold text-white">Record Verification Rejection</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">
                  Specify details regarding why these credential scans are declined
                </p>
              </div>
              <div className="h-px bg-slate-800/80" />

              <div className="space-y-4">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Select Predefined Explanation
                </label>
                <div className="space-y-2">
                  {REJECTION_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl}
                      type="button"
                      onClick={() => {
                        setRejectionReasonInput(tmpl);
                        setCustomRejectionSelected(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs font-sans border transition duration-200 ${
                        rejectionReasonInput === tmpl && !customRejectionSelected
                          ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 font-bold"
                          : "bg-slate-900/60 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-350"
                      }`}
                    >
                      {tmpl}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setRejectionReasonInput("");
                      setCustomRejectionSelected(true);
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-mono uppercase tracking-wider font-bold border transition duration-200 ${
                      customRejectionSelected
                        ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
                        : "bg-slate-900/60 border-slate-850 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    ✏️ Custom Explanation Input...
                  </button>
                </div>

                {customRejectionSelected && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Custom Rejection Explanation
                    </label>
                    <textarea
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      rows={3}
                      required
                      placeholder="Specify precisely what document or information triggers this rejection..."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition duration-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleVerify(
                      rejectionPromptProfileId,
                      "REJECTED",
                      rejectionReasonInput || "Documents could not be verified by platform administrator."
                    )
                  }
                  className="flex-grow bg-red-500 hover:bg-red-600 text-slate-950 py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.15)]"
                >
                  Confirm Rejection & Log
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectionPromptProfileId(null);
                    setRejectionReasonInput("");
                    setCustomRejectionSelected(false);
                  }}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 px-5 py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MASTER ACCOUNT DETAILS MODAL EDITOR PORTAL */}
      <AnimatePresence>
        {editingProfile && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card border border-slate-800 p-6 md:p-8 rounded-3xl max-w-xl w-full scale-100 shadow-2xl space-y-6 relative bg-slate-950 max-h-[90vh] overflow-y-auto my-8"
            >
              <div>
                <h3 className="text-lg font-bold text-white">
                  Edit Profile: {getVisualId(editingProfile.user?.role || "PARENT", editingProfile.tutorSeq)}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">
                  Update database records across User, Profile and Geolocation details
                </p>
              </div>
              <div className="h-px bg-slate-800/80" />

              <form onSubmit={handleSaveProfileDetails} className="space-y-4 font-sans">
                {editError && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 py-2.5 px-3.5 rounded-xl font-mono">
                    ⚠️ {editError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">User Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Contact Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Claimed Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                    />
                  </div>
                </div>

                {editingProfile.user?.role === "TUTOR" && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Educator Qualifications</label>
                      <input
                        type="text"
                        value={editForm.education}
                        onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Biography Details</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                      />
                    </div>
                  </>
                )}

                {/* Edit status locks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Verification Status</label>
                    <select
                      value={editForm.verificationStatus}
                      onChange={(e) => setEditForm({ ...editForm, verificationStatus: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200 cursor-pointer"
                    >
                      <option value="UNVERIFIED">UNVERIFIED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  {editForm.verificationStatus === "REJECTED" && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Rejection Explanation</label>
                      <input
                        type="text"
                        required
                        value={editForm.rejectionReason}
                        onChange={(e) => setEditForm({ ...editForm, rejectionReason: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition duration-200"
                        placeholder="Blurry credentials scans..."
                      />
                    </div>
                  )}
                </div>

                {/* Draggable location picker for admin overrides */}
                <div className="space-y-2 bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Admin Geolocation Override Pin Map
                  </label>
                  <MapPicker
                    initialLat={editForm.latitude}
                    initialLng={editForm.longitude}
                    onChange={({ lat, lng }) => {
                      setEditForm((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                      }));
                    }}
                  />
                </div>

                <div className="flex space-x-3 pt-3 border-t border-slate-900">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />
                        <span>Synchronizing changes...</span>
                      </>
                    ) : (
                      <span>Save Settings</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(null)}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 px-6 py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* PREMIUM HIGH-FIDELITY DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {previewDocuments && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card border border-slate-800 p-6 md:p-8 rounded-3xl max-w-5xl w-full scale-100 shadow-2xl space-y-6 relative bg-slate-950 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">Document Credentials Audit: {previewDocuments.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">
                    Inspect uploaded scans side-by-side to authenticate profile accuracy
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDocuments(null)}
                  className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 p-2 rounded-xl transition duration-200 cursor-pointer text-xs"
                >
                  ✕ Close
                </button>
              </div>
              
              <div className="h-px bg-slate-800/80" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NID Document */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    🪪 National ID Card (NID)
                  </h4>
                  <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-2.5 flex items-center justify-center min-h-[300px] overflow-hidden relative group">
                    {previewDocuments.nid ? (
                      <img
                        src={previewDocuments.nid}
                        alt="National ID Card"
                        className="max-h-[350px] object-contain rounded-xl shadow-lg border border-slate-800 hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center text-xs text-slate-655 space-y-1">
                        <span>🚫</span>
                        <p>No NID Uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student ID Document */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    🎓 Student ID / Academic ID
                  </h4>
                  <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-2.5 flex items-center justify-center min-h-[300px] overflow-hidden relative group">
                    {previewDocuments.idCard ? (
                      <img
                        src={previewDocuments.idCard}
                        alt="Student ID Card"
                        className="max-h-[350px] object-contain rounded-xl shadow-lg border border-slate-800 hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center text-xs text-slate-655 space-y-1">
                        <span>🚫</span>
                        <p>No Student ID Uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons inside document viewer to speed up workflow */}
              <div className="flex space-x-3 pt-3 border-t border-slate-900 justify-end">
                {pendingProfiles.some((p) => p.id === previewDocuments.profileId) && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleVerify(previewDocuments.profileId, "VERIFIED");
                        setPreviewDocuments(null);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-6 py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2"
                    >
                      ✓ Approve Tutor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectionPromptProfileId(previewDocuments.profileId);
                        setPreviewDocuments(null);
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                    >
                      ✕ Reject Tutor
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDocuments(null)}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 px-6 py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
