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
                  <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    // In a real application, upload the file to S3/Cloudinary, then send the URL
                    // Mocking successful upload with a fake URL:
                    const mockImageUrl = "https://example.com/mock-id.jpg";
                    const res = await fetch('/api/profile/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ idImageUrl: mockImageUrl })
                    });

                    if(res.ok) {
                      alert('Verification request submitted successfully! Status is now PENDING.');
                      e.currentTarget.reset();
                    } else {
                      alert('Failed to submit verification.');
                    }
                  }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Upload ID Card Image</label>
                      <input type="file" name="idImage" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                      Submit for Verification
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-4">Post a Tuition Job</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Looking for a tutor? Post a job on the map and let tutors find you.
                  </p>
                  <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = {
                      title: formData.get('title'),
                      description: formData.get('description'),
                      subject: formData.get('subject'),
                      classLevel: formData.get('classLevel'),
                      salary: formData.get('salary'),
                      latitude: 23.8103, // Mock default Dhaka latitude
                      longitude: 90.4125, // Mock default Dhaka longitude
                    };

                    const res = await fetch('/api/jobs', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    });

                    if (res.ok) {
                      alert('Job posted successfully!');
                      e.currentTarget.reset();
                    } else {
                      alert('Failed to post job.');
                    }
                  }}>
                    <div>
                      <input type="text" name="title" required placeholder="Job Title (e.g., Math Tutor Needed)" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <input type="text" name="subject" required placeholder="Subject (e.g., Mathematics)" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <input type="text" name="classLevel" required placeholder="Class Level (e.g., Class 10)" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <input type="number" name="salary" required placeholder="Salary in BDT" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <textarea name="description" placeholder="Description / Requirements" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" rows={3}></textarea>
                    </div>
                    {/* Note: In a real app, latitude/longitude would be picked from a map or geolocation API */}
                    <p className="text-xs text-gray-500">Location will default to central Dhaka for this demo.</p>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                      Create New Post
                    </button>
                  </form>

                  <div className="mt-8 border-t pt-8">
                     <h2 className="text-lg font-semibold mb-4">Leave a Review for a Tutor</h2>
                     <p className="text-sm text-gray-600 mb-4">
                       Rate a tutor you have hired recently.
                     </p>
                     <form className="space-y-4" onSubmit={async (e) => {
                       e.preventDefault();
                       const formData = new FormData(e.currentTarget);
                       const data = {
                         targetId: formData.get('tutorId'),
                         rating: formData.get('rating'),
                         comment: formData.get('comment'),
                       };

                       const res = await fetch('/api/reviews', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify(data)
                       });

                       if (res.ok) {
                         alert('Review submitted successfully!');
                         e.currentTarget.reset();
                       } else {
                         alert('Failed to submit review.');
                       }
                     }}>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Tutor ID (Mock: Use a tutor's ID here)</label>
                           <input type="text" name="tutorId" required placeholder="Tutor ID" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                           <input type="number" name="rating" min="1" max="5" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Comment</label>
                           <textarea name="comment" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" rows={2}></textarea>
                        </div>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                          Submit Review
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
