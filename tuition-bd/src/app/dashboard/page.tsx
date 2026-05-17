"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { data: session, status } = useSession() || { data: null, status: "unauthenticated" };
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const role = (session.user as any)?.role || "PARENT";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {session.user?.name}</h1>
              <p className="text-gray-500 capitalize">{role.toLowerCase()} Dashboard</p>
            </div>
            {role === "TUTOR" && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Unverified Profile
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="+880 1..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address / Location</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Your exact area" />
                </div>
                <button type="button" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                  Save Changes
                </button>
              </form>
            </div>

            {/* Role Specific Actions */}
            <div className="border rounded-lg p-4">
              {role === "TUTOR" ? (
                <>
                  <h2 className="text-lg font-semibold mb-4">Get Verified</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your NID or University ID to get the verified badge and attract more tuitions.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Upload ID Card Image</label>
                      <input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                      Submit for Verification
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-4">Post a Tuition Job</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Looking for a tutor? Post a job on the map and let tutors find you.
                  </p>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                    Create New Post
                  </button>

                  <div className="mt-8">
                     <h2 className="text-lg font-semibold mb-4">Your Active Posts</h2>
                     <p className="text-sm text-gray-500">You haven't posted any jobs yet.</p>
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
