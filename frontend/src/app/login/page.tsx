"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Lock, User, Mail, Sparkles, Sun, BookOpen, Moon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"theme-clean" | "theme-paper" | "theme-dark">("theme-clean");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = (localStorage.getItem("atlas.theme") as any) || "theme-clean";
      setTheme(stored);
    }
  }, []);

  const cycleTheme = () => {
    let nextTheme: typeof theme = "theme-clean";
    if (theme === "theme-clean") nextTheme = "theme-paper";
    else if (theme === "theme-paper") nextTheme = "theme-dark";
    
    setTheme(nextTheme);
    localStorage.setItem("atlas.theme", nextTheme);
    document.documentElement.className = nextTheme;
    if (nextTheme === "theme-dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("metaphor_logged_in", "true");
      localStorage.setItem("metaphor_user_email", email);
      if (name) localStorage.setItem("metaphor_user_name", name);

      const savedKey = localStorage.getItem("metaphor_api_key");
      
      if (savedKey) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center relative px-4 font-sans transition-colors duration-300">
      
      {/* Theme Toggle at top right */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={cycleTheme}
          className="p-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-hover-border)] transition-all cursor-pointer text-xs flex items-center gap-1.5"
          title="Cycle Theme"
        >
          {theme === "theme-clean" && <Sun size={14} className="text-amber-500" />}
          {theme === "theme-paper" && <BookOpen size={14} className="text-amber-800" />}
          {theme === "theme-dark" && <Moon size={14} className="text-amber-300" />}
          <span className="capitalize font-mono text-[10px] font-semibold">
            {theme.replace("theme-", "")}
          </span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* Logo and branding */}
        <div className="flex flex-col items-center space-y-1 text-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-full border-2 border-[var(--accent-gold)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
            </div>
            <span className="text-xl font-bold font-serif tracking-tight">
              Atlas
            </span>
          </Link>
          <p className="text-[var(--muted)] text-[10px] font-mono tracking-wider">Console Access Gateway</p>
        </div>

        {/* Form Card */}
        <div className="atlas-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 shadow-sm">
          
          {/* Header tabs */}
          <div className="flex border-b border-[var(--card-border)] pb-4 mb-6 justify-center gap-8 text-sm font-semibold">
            <button 
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`pb-2 relative cursor-pointer transition-all ${isLogin ? "text-[var(--foreground)] font-bold" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              Sign In
              {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-gold)] rounded-full" />}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`pb-2 relative cursor-pointer transition-all ${!isLogin ? "text-[var(--foreground)] font-bold" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              Create Account
              {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-gold)] rounded-full" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <Shield size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name field (Signup only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--muted)] font-mono tracking-wider uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                  <input 
                    type="text" 
                    placeholder="Benjamin Franklin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full atlas-input pl-10"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--muted)] font-mono tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                <input 
                  type="email" 
                  placeholder="benjamin@atlas.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full atlas-input pl-10"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--muted)] font-mono tracking-wider uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full atlas-input pl-10"
                />
              </div>
            </div>

            {/* Submit button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full atlas-btn-primary py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In to Console" : "Create Developer Console"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Micro-onboarding banner */}
          <div className="mt-6 pt-5 border-t border-[var(--card-border)] flex items-center justify-center gap-1.5 text-[9px] font-mono text-[var(--muted)]">
            <Sparkles size={10} className="text-[var(--accent-gold)] animate-pulse" />
            <span>Atlas Strategist Console V1.1.0</span>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1">
            &larr; Back to Landing Page
          </Link>
        </div>

      </div>

    </div>
  );
}
