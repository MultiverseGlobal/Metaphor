"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, FileText, Database, Shield, Zap, Sparkles } from "lucide-react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0);

  // Auto-play the demo sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-background flex flex-col font-sans text-foreground overflow-x-hidden">
      {/* ── Spatial Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video 
          src="/spatial_background_loop.webm" 
          poster="/spatial_background.jpg"
          autoPlay loop muted playsInline
          className="w-full h-full object-cover opacity-[0.12] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      {/* ── Top Navigation Bar ── */}
      <motion.nav 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full z-50 border-b border-border-subtle/40"
      >
        <div className="flex items-center gap-3">
          <MetaphorLogo size={18} />
          <span className="text-sm font-semibold tracking-tight text-foreground">Metaphor OS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="pds-btn-ghost">
            Sign In
          </Link>
          <Link href="/home" className="pds-btn-primary group shadow-sm">
            <span>Open Explorer</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.nav>

      <main className="flex-1 flex flex-col items-center justify-start pt-16 px-6 max-w-6xl mx-auto w-full z-10">
        
        {/* ── Main Copy ── */}
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-1 border border-border-subtle text-xs font-medium text-muted mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Universal Context Engine</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-tight mb-6"
          >
            AI memory that explains <br/> <span className="text-muted">exactly what it knows.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base md:text-lg text-muted max-w-xl leading-relaxed mb-8 font-normal"
          >
            Metaphor converts your Notion and GitHub sources into a structured Knowledge Graph, serving grounded context packs directly to your AI clients.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              href="/home"
              className="pds-btn-primary hover:scale-[1.02] transition-transform shadow-xl shadow-foreground/5 cursor-pointer !w-auto !inline-flex !h-12 !px-8 !text-sm"
            >
              <span>Launch Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* ── Interactive Demo: The Explorer Flow ── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-4xl rounded-2xl bg-surface-1/50 border border-border-subtle shadow-2xl p-2 mb-24 overflow-hidden backdrop-blur-xl"
        >
          <div className="bg-background rounded-xl border border-border-subtle/50 p-6 shadow-inner flex flex-col gap-6 min-h-[400px]">
            
            {/* Step 1: Query */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-muted tracking-widest">1. The Query</span>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-1 border border-border-subtle">
                <Search className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">What architectural constraints govern our API?</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
              
              {/* Step 2: Plan */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-muted tracking-widest">2. Retrieval Plan</span>
                <AnimatePresence>
                  {demoStep >= 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-xl bg-surface-2/40 border border-border-subtle text-xs font-mono text-muted space-y-2 h-full"
                    >
                      <div className="flex items-center gap-2 text-emerald-500 mb-4">
                        <Zap className="w-4 h-4" /> Traversal Active
                      </div>
                      <div>&gt; expanding Vector space</div>
                      <div>&gt; found 14 candidate nodes</div>
                      <div>&gt; crawling 2-hop edges</div>
                      <div>&gt; resolved 3 core entities</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step 3: Evidence */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-muted tracking-widest">3. Provenance</span>
                <AnimatePresence>
                  {demoStep >= 2 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="space-y-3 h-full"
                    >
                      <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle/80 flex flex-col gap-1.5 shadow-sm">
                        <span className="text-[10px] font-mono text-primary flex items-center gap-1"><FileText className="w-3 h-3"/> API_Standards.md</span>
                        <span className="text-xs text-foreground font-medium">REST strictness enforced</span>
                        <span className="text-[10px] text-muted">Conf: 94% • 1h ago</span>
                      </div>
                      {demoStep >= 3 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-xl bg-surface-1 border border-border-subtle/80 flex flex-col gap-1.5 shadow-sm"
                        >
                          <span className="text-[10px] font-mono text-cyan-500 flex items-center gap-1"><Database className="w-3 h-3"/> Github PR #142</span>
                          <span className="text-xs text-foreground font-medium">OAuth 2.1 PKCE added</span>
                          <span className="text-[10px] text-muted">Conf: 89% • 2d ago</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step 4: Context Pack */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-muted tracking-widest">4. Context Pack</span>
                <AnimatePresence>
                  {demoStep >= 4 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-xl bg-background border border-border-subtle shadow-inner h-full flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                          <Shield className="w-3 h-3"/> MCP Ready
                        </span>
                        <span className="text-[10px] text-muted font-mono">1.2k tokens</span>
                      </div>
                      <pre className="text-[10px] font-mono text-emerald-400/90 overflow-x-auto">
{`{
  "partition": "global",
  "evidence_count": 2,
  "payload": {
    "constraints": [
      "REST strictness",
      "OAuth 2.1 PKCE"
    ]
  }
}`}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
