"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Sparkles, Sun, BookOpen, Moon } from "lucide-react";
import { BACKEND_URL, fetchFromMetaphor } from "@/app/api";
import { createClient } from "@/utils/supabase/client";
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

  const supabase = createClient();

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error(error)
      setError("Error logging in: " + error.message)
      setLoading(false);
    }
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

          <div className="space-y-4 w-full">
            <button 
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-hover-border)] transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="opacity-80 text-foreground">
                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c5.772 0 9.61-4.062 9.61-9.761 0-.832-.115-1.636-.298-2.439h-9.312z" />
              </svg>
              <span className="text-sm font-medium">Continue with Google</span>
            </button>
            <button 
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-hover-border)] transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="opacity-80">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span className="text-sm font-medium">Continue with GitHub</span>
            </button>
          </div>

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
