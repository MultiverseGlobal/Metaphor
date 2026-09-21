"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";
import { RippleButton } from "@/components/ui/RippleButton";

// ── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const reduce = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="w-full bg-transparent text-[var(--color-ink)] overflow-x-hidden min-h-screen flex flex-col items-center">

      {/* ── CENTRAL GLASS NAV ───────────────────────────────────────────── */}
      <nav
        className="fixed top-8 z-50 px-2"
        role="navigation"
        aria-label="Main navigation"
      >
        <motion.div 
          className="mx-auto flex items-center justify-between h-14 px-6 rounded-full glass-clear backdrop-blur-xl border border-[rgba(10,10,10,0.06)] shadow-[0_14px_40px_rgba(0,0,0,0.04)] gap-8 max-w-full overflow-hidden"
          initial={reduce ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mark */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Metaphor home">
            <MetaphorLogo className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity" />
            <span
              className="text-[14px] font-medium tracking-wide text-[var(--color-ink)]"
            >
              Metaphor
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-6">
            {["Platform", "How it works", "Security"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                className="text-[13px] text-[#3B4043] hover:text-[var(--color-ink)] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-[13px] text-[#3B4043] hover:text-[var(--color-ink)] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/onboard"
              className="text-[13px] font-medium text-white bg-[#111315] hover:bg-[#2A2E33] transition-colors h-[32px] px-4 rounded-full flex items-center justify-center"
            >
              Start
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* ── §1 HERO ─────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="min-h-[90dvh] flex flex-col justify-center items-center px-6 w-full max-w-4xl mx-auto text-center mt-12"
        aria-labelledby="hero-heading"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-8"
        >
          <h1
            id="hero-heading"
            className="font-display text-[clamp(56px,8vw,110px)] leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
            style={{ fontWeight: 400 }}
          >
            Make your AI tools work as one.
          </h1>

          <p className="text-[18px] text-[#3B4043] leading-relaxed max-w-[500px]">
            Shared context. Intelligent handoffs. Coordinated execution — without you carrying the context between tools.
          </p>

          <div className="flex items-center gap-4 mt-6">
            <Link
              href="/onboard"
              className="text-[14px] font-medium text-white bg-[#111315] hover:bg-[#2A2E33] transition-colors h-[44px] px-6 rounded-full flex items-center justify-center gap-2"
            >
              Build your network
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── §2 THE CONTEXT GAP ─────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="min-h-[70dvh] flex items-center w-full max-w-5xl mx-auto px-6 py-32"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[11px] uppercase tracking-widest text-[#AEB7BC] mb-6 font-mono">The context gap</div>
            <h2 className="font-display text-[clamp(44px,5vw,64px)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)] mb-6">
              Every tool knows part of the work.
            </h2>
            <p className="text-[16px] text-[#3B4043] leading-relaxed">
              The problem is not a lack of intelligence. It is a lack of connection. Every handoff starts with catching the next tool up.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {[
              { name: "ChatGPT", role: "Reasoning" },
              { name: "Claude", role: "Architecture" },
              { name: "GitHub", role: "Codebase" },
              { name: "Cursor", role: "Implementation" },
            ].map((p, i) => (
              <div
                key={p.name}
                className="glass-clear px-4 py-4 rounded-[16px] border border-[rgba(10,10,10,0.04)]"
              >
                <div className="text-[14px] font-medium text-[var(--color-ink)] mb-1">
                  {p.name}
                </div>
                <div className="text-[11px] text-[#AEB7BC] font-mono tracking-wide uppercase">
                  {p.role}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── §3 THE SHARED LAYER ────────────────────────────────────────── */}
      <section
        id="shared-layer"
        className="min-h-[70dvh] flex items-center w-full max-w-5xl mx-auto px-6 py-32"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            className="order-2 md:order-1 relative"
            initial={reduce ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="glass-regular p-6 rounded-[24px] border border-[rgba(10,10,10,0.06)] shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
              <div className="text-[11px] text-[#3B4043] font-mono tracking-wide uppercase mb-4">Draft system architecture</div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[13px] text-[#3B4043]">Assigned to:</span>
                <span className="text-[13px] font-medium text-[var(--color-ink)]">Claude</span>
              </div>
              <div className="border-t border-[rgba(10,10,10,0.06)] pt-4 mt-4">
                <div className="flex items-start gap-2 mb-2">
                  <Check size={14} weight="bold" className="text-[var(--color-ink)] mt-0.5" />
                  <span className="text-[13px] text-[#3B4043]">Push-based architecture selected</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} weight="bold" className="text-[var(--color-ink)] mt-0.5" />
                  <span className="text-[13px] text-[#3B4043]">Preserve current API contract</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="order-1 md:order-2"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[11px] uppercase tracking-widest text-[#AEB7BC] mb-6 font-mono">The shared layer</div>
            <h2 className="font-display text-[clamp(44px,5vw,64px)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)] mb-6">
              Give every tool the context it needs.
            </h2>
            <p className="text-[16px] text-[#3B4043] leading-relaxed">
              Metaphor keeps your project reality in one shared layer, then moves the right context to the right participant at the right moment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── §4 FOOTER ────────────────────────────────────────────────────── */}
      <footer className="w-full py-24 text-center">
        <p className="font-display text-[24px] italic text-[var(--color-ink)] mb-8">
          Your workspace is waiting.
        </p>
        <div className="flex items-center justify-center gap-4">
            <Link
              href="/onboard"
              className="text-[14px] font-medium text-white bg-[#111315] hover:bg-[#2A2E33] transition-colors h-[44px] px-8 rounded-full flex items-center justify-center"
            >
              Create your first project
            </Link>
        </div>
      </footer>
    </div>
  );
}
