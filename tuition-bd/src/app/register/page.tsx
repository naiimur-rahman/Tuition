"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Register() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "", role: "PARENT" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerUser = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (response.ok) {
      router.push("/login");
    } else {
      setError("Registration failed. Email might already be configured.");
    }
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
            <div className="text-emerald-400 font-mono text-xs uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit mx-auto mb-2 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              Tuition Console
            </div>
          </Link>
          <h2 className="text-3xl font-bold font-heading text-white">
            Create Account
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-sans">
            Provision a new operator profile inside our network
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={registerUser}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Operator Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                placeholder="Naimur Rahman"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
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
                placeholder="operator@console.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Secure Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                placeholder="••••••••••••"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">System Operator Role</label>
              <select
                value={data.role}
                onChange={(e) => setData({ ...data, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
              >
                <option value="PARENT">I am a Parent / Student</option>
                <option value="TUTOR">I am a Tutor / Educator</option>
              </select>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 py-2.5 rounded-xl animate-shake"
            >
              ⚠ {error}
            </motion.p>
          )}

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(16,185,129,0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-950 bg-emerald-500 hover:bg-emerald-600 focus:outline-none transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Provisioning Profile..." : "Initialize Operator Profile"}
            </motion.button>
          </div>
        </form>

        <div className="text-sm text-center mt-6 border-t border-slate-800/80 pt-6">
          <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            Already registered? Sign in instead
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
