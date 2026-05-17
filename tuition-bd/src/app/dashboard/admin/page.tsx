"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  const { data: session, status } = useSession() || { data: null, status: "unauthenticated" };
  const router = useRouter();
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && (session.user as any).role !== "ADMIN") {
       router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
     if (session && (session.user as any).role === "ADMIN") {
        fetch('/api/admin/verify')
          .then(res => res.json())
          .then(data => setPendingProfiles(data))
          .catch(err => console.error(err));
     }
  }, [session]);

  const handleVerify = async (profileId: string, verifyStatus: string) => {
    const res = await fetch('/api/admin/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, status: verifyStatus })
    });

    if (res.ok) {
        setPendingProfiles(pendingProfiles.filter(p => p.id !== profileId));
        alert(`Profile has been ${verifyStatus.toLowerCase()}.`);
    } else {
        alert("Failed to update status.");
    }
  }

  if (status === "loading" || !session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage pending verifications and platform settings.</p>
          </div>

          <div>
             <h2 className="text-lg font-semibold mb-4">Pending ID Verifications</h2>
             {pendingProfiles.length === 0 ? (
                 <p className="text-gray-500">No pending verifications at this time.</p>
             ) : (
                 <ul className="divide-y divide-gray-200">
                    {pendingProfiles.map(profile => (
                        <li key={profile.id} className="py-4 flex items-center justify-between">
                           <div>
                               <p className="text-sm font-medium text-gray-900">{profile.user.name}</p>
                               <p className="text-sm text-gray-500">{profile.user.email}</p>
                               <a href={profile.nidImageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs hover:underline">View Uploaded ID</a>
                           </div>
                           <div className="flex space-x-2">
                               <button onClick={() => handleVerify(profile.id, 'VERIFIED')} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Approve</button>
                               <button onClick={() => handleVerify(profile.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Reject</button>
                           </div>
                        </li>
                    ))}
                 </ul>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
