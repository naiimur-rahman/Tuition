"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
              >
                <span className="block xl:inline">Find the perfect</span>{" "}
                <span className="block text-indigo-600 xl:inline">
                  tutor near you
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
              >
                Connect with verified tutors and find tuition jobs in Bangladesh using our unique map-based search. Quality education, right at your doorstep.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
              >
                <div className="rounded-md shadow">
                  <Link
                    href="/map?type=tutor"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Find a Tutor
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    href="/map"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                  >
                    Find Tuition Jobs
                  </Link>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-indigo-50 flex items-center justify-center overflow-hidden">
         <motion.div
           animate={{
             y: [0, -20, 0],
             rotate: [0, 5, -5, 0]
           }}
           transition={{
             duration: 6,
             repeat: Infinity,
             ease: "easeInOut"
           }}
           className="w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 absolute top-20 right-20"
         />
         <motion.div
           animate={{
             y: [0, 20, 0],
             scale: [1, 1.1, 1]
           }}
           transition={{
             duration: 5,
             repeat: Infinity,
             ease: "easeInOut"
           }}
           className="w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 absolute bottom-20 left-20"
         />
         <div className="relative z-10 text-indigo-800 text-2xl font-bold text-center">
            Interactive Map Search <br/> Coming Up!
         </div>
      </div>
    </div>
  );
}
