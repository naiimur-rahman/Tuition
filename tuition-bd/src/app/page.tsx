import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to learn
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform offers unique features designed specifically for the Bangladesh market.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white font-bold text-xl">
                    1
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Map-Based Discovery</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Find tutors or tuitions in your specific area using our interactive map. Exact locations are secure until connected.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white font-bold text-xl">
                    2
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Verified Tutors</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Trust is important. Tutors can verify their identity using NID or University ID cards.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white font-bold text-xl">
                    3
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure Payments</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Integrated with bKash for easy unlock fees and commission handling.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white font-bold text-xl">
                    4
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Reviews & Ratings</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Make informed decisions by reading reviews from other parents and students.
                </dd>
              </div>

            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
