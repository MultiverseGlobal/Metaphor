"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Network, Shield, ArrowRight, Lock, User, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);

    // Simulate network authentication request
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("metaphor_logged_in", "true");
      localStorage.setItem("metaphor_user_email", email);
      if (name) localStorage.setItem("metaphor_user_name", name);

      // Check if developer configuration already exists
      const savedKey = localStorage.getItem("metaphor_api_key");
      
      if (savedKey) {
        // Already onboarded, redirect directly to dashboard
        router.push("/dashboard");
      } else {
        // Go to onboarding wizard first
        router.push("/onboarding");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden font-sans px-4">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      
      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"
      />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logo and branding */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Network className="text-slate-950 stroke-[2.5]" size={18} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Metaphor
            </span>
          </Link>
          <p className="text-slate-400 text-xs font-mono">Continuous Context Engine</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          
          {/* Header tabs */}
          <div className="flex border-b border-slate-800 pb-5 mb-6 justify-center gap-8 text-sm font-semibold">
            <button 
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`pb-2 relative cursor-pointer transition-all ${isLogin ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              Sign In
              {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" />}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`pb-2 relative cursor-pointer transition-all ${!isLogin ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              Create Account
              {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-xs font-medium flex items-center gap-2">
                <Shield size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name field (Signup only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Benjamin Franklin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="email" 
                  placeholder="benjamin@metaphor.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 hover:opacity-95 transition-all text-sm shadow-lg shadow-violet-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In to Console" : "Create Developer Console"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Micro-onboarding banner */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500">
            <Sparkles size={10} className="text-violet-500 animate-pulse" />
            <span>Developer Sandbox Environment V1.1.0</span>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1">
            &larr; Back to Landing Page
          </Link>
        </div>

      </div>

    </div>
  );
}
