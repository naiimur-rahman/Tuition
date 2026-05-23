"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "", role: "PARENT" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginUser = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    signIn("credentials", {
      ...data,
      redirect: false,
    }).then((callback) => {
      setLoading(false);
      if (callback?.error) {
        setError(callback.error);
      }

      if (callback?.ok && !callback?.error) {
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full filter blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md p-8 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-2xl relative z-10 backdrop-blur-xl"
      >
        <div className="text-center space-y-2">
          {/* Logo Badge */}
          <Link href="/" className="inline-block">
            <div className="text-emerald-400 font-mono text-xs uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit mx-auto mb-2 shadow-[0_0_10px_rgba(var(--theme-rgb),0.1)]">
              TutorHire
            </div>
          </Link>
          <h2 className="text-3xl font-bold font-heading text-white">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-sans">
            Enter your account credentials to sign in
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={loginUser}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Log in as</label>
              <select
                value={data.role}
                onChange={(e) => {
                  setData({ ...data, role: e.target.value });
                  setError("");
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 cursor-pointer"
              >
                <option value="PARENT">Guardian / Parent</option>
                <option value="TUTOR">Educator / Tutor</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Email Address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                placeholder="email@example.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Password Code</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                placeholder="••••••••••••"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-emerald-400 font-sans transition-colors duration-200">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 py-2.5 rounded-xl"
            >
              ⚠ {error}
            </motion.p>
          )}

          <div>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(var(--theme-rgb),0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-950 bg-emerald-500 hover:bg-emerald-600 focus:outline-none transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(var(--theme-rgb),0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying Credentials..." : "Authenticate Session"}
            </motion.button>
          </div>
        </form>

        <div className="text-sm text-center mt-6 border-t border-slate-800/80 pt-6">
          <Link href="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            New operator? Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
