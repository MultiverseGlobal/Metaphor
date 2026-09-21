"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

gsap.registerPlugin(ScrollTrigger);

// ── Types ───────────────────────────────────────────────────────────────────

interface Participant {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

// ── Participant Network Data ─────────────────────────────────────────────────

const PARTICIPANTS: Participant[] = [
  { id: "chatgpt",     name: "ChatGPT",     role: "Reasoning",      x: 50,  y: 5,   color: "#10A37F" },
  { id: "claude",      name: "Claude",      role: "Architecture",   x: 95,  y: 28,  color: "#D97706" },
  { id: "github",      name: "GitHub",      role: "Codebase",       x: 88,  y: 72,  color: "#0A0A0A" },
  { id: "notion",      name: "Notion",      role: "Knowledge",      x: 50,  y: 95,  color: "#6366F1" },
  { id: "antigravity", name: "Antigravity", role: "Development",    x: 12,  y: 72,  color: "#8B5CF6" },
  { id: "cursor",      name: "Cursor",      role: "Implementation", x: 5,   y: 28,  color: "#374151" },
];

const CENTER = { id: "metaphor", name: "Metaphor", x: 50, y: 50 };

const CONNECTIONS: Connection[] = PARTICIPANTS.map((p) => ({
  from: "metaphor",
  to: p.id,
}));

// ── Animated Participant Network ─────────────────────────────────────────────

function ParticipantNetwork({ phase }: { phase: "isolated" | "connected" | "coordinated" }) {
  const reduce = useReducedMotion();

  const getPos = (p: Participant) => ({
    cx: `${p.x}%`,
    cy: `${p.y}%`,
  });

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ overflow: "visible" }}
      aria-label="Participant network diagram showing AI tools connecting through Metaphor"
    >
      {/* Connection lines */}
      {PARTICIPANTS.map((p) => (
        <motion.line
          key={`line-${p.id}`}
          x1={`${CENTER.x}%`}
          y1={`${CENTER.y}%`}
          x2={`${p.x}%`}
          y2={`${p.y}%`}
          stroke="#6366F1"
          strokeWidth="0.3"
          strokeDasharray={phase === "connected" || phase === "coordinated" ? "none" : "2 2"}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={
            phase !== "isolated"
              ? { pathLength: 1, opacity: phase === "coordinated" ? 0.35 : 0.2 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 0.8, delay: PARTICIPANTS.indexOf(p) * 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      {/* Signal dots traveling along lines (coordinated phase only) */}
      {phase === "coordinated" &&
        !reduce &&
        PARTICIPANTS.slice(0, 3).map((p, i) => (
          <motion.circle
            key={`signal-${p.id}`}
            r="0.8"
            fill="#6366F1"
            initial={{ offsetDistance: "0%", opacity: 0 }}
            animate={{ offsetDistance: "100%", opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              delay: i * 0.7,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              offsetPath: `path("M ${CENTER.x} ${CENTER.y} L ${p.x} ${p.y}")`,
            }}
          />
        ))}

      {/* Participant nodes */}
      {PARTICIPANTS.map((p, i) => {
        const pos = getPos(p);
        return (
          <motion.g key={p.id}>
            <motion.circle
              cx={pos.cx}
              cy={pos.cy}
              r="3.5"
              fill="white"
              stroke={phase === "coordinated" ? p.color : "#E5E7EB"}
              strokeWidth={phase === "coordinated" ? "0.5" : "0.3"}
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.175, 0.885, 0.32, 1.05] }}
              style={{ filter: phase === "coordinated" ? `drop-shadow(0 0 2px ${p.color}40)` : "none" }}
            />
            <motion.text
              x={pos.cx}
              y={`${p.y + 7}%`}
              textAnchor="middle"
              fill="#6B7280"
              style={{ fontSize: "3px", fontFamily: "Satoshi, sans-serif", fontWeight: 500 }}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: phase !== "isolated" ? 1 : 0.3 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
            >
              {p.name}
            </motion.text>
            {phase !== "isolated" && (
              <motion.text
                x={pos.cx}
                y={`${p.y + 10.5}%`}
                textAnchor="middle"
                fill="#9CA3AF"
                style={{ fontSize: "2.2px", fontFamily: "JetBrains Mono, monospace" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.06 }}
              >
                {p.role}
              </motion.text>
            )}
          </motion.g>
        );
      })}

      {/* Center — Metaphor node */}
      <motion.circle
        cx="50%"
        cy="50%"
        r={phase === "coordinated" ? "6" : "5"}
        fill="white"
        stroke="#6366F1"
        strokeWidth="0.6"
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.175, 0.885, 0.32, 1.05] }}
        style={{
          filter: phase === "coordinated" ? "drop-shadow(0 0 4px rgba(99,102,241,0.4))" : "drop-shadow(0 0 2px rgba(99,102,241,0.2))",
        }}
      />
      <motion.text
        x="50%"
        y="50%"
        dy="1.1"
        textAnchor="middle"
        fill="#6366F1"
        style={{ fontSize: "3.5px", fontFamily: "Satoshi, sans-serif", fontWeight: 600 }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        Metaphor
      </motion.text>
    </svg>
  );
}

// ── Context Fragment ─────────────────────────────────────────────────────────

const FRAGMENTS = [
  { label: "Objective", emoji: "◎", delay: 0 },
  { label: "Previous decisions", emoji: "◈", delay: 0.08 },
  { label: "Constraints", emoji: "◉", delay: 0.16 },
  { label: "Codebase state", emoji: "◇", delay: 0.24 },
  { label: "Open questions", emoji: "○", delay: 0.32 },
  { label: "Earlier outputs", emoji: "◆", delay: 0.40 },
];

// ── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const reduce = useReducedMotion();
  const gapSectionRef = useRef<HTMLDivElement>(null);
  const gapInnerRef = useRef<HTMLDivElement>(null);
  const layerSectionRef = useRef<HTMLDivElement>(null);
  const layerInnerRef = useRef<HTMLDivElement>(null);
  const [networkPhase, setNetworkPhase] = useState<"isolated" | "connected" | "coordinated">("isolated");
  const [fragmentsScattered, setFragmentsScattered] = useState(false);
  const [gapProgress, setGapProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hero network: animate through phases on load
  useEffect(() => {
    const t1 = setTimeout(() => setNetworkPhase("connected"), 800);
    const t2 = setTimeout(() => setNetworkPhase("coordinated"), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // GSAP — The Context Gap (pinned scroll section)
  useEffect(() => {
    if (reduce || !gapSectionRef.current || !gapInnerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: gapSectionRef.current,
          start: "top top",
          end: "+=280%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          onUpdate: (self) => setGapProgress(self.progress),
        },
      });

      // Beat 1 → Beat 2: participants appear
      tl.fromTo(".gap-participant", { opacity: 0, scale: 0.7, y: 12 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.3, stagger: 0.06, ease: "power3.out",
      }, 0);

      // Beat 2: intention appears
      tl.fromTo(".gap-intention", { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.25, ease: "power2.out",
      }, 0.35);

      // Beat 3: fragments scatter
      tl.to(".gap-fragment", { opacity: 1, scale: 1, duration: 0.2, stagger: 0.05 }, 0.55);
      tl.to(".gap-fragment-0", { x: -80, y: -40, rotate: -8, duration: 0.35 }, 0.75);
      tl.to(".gap-fragment-1", { x: 60, y: -20, rotate: 5, duration: 0.35 }, 0.78);
      tl.to(".gap-fragment-2", { x: -40, y: 50, rotate: -12, duration: 0.35 }, 0.81);
      tl.to(".gap-fragment-3", { x: 90, y: 30, rotate: 8, duration: 0.35 }, 0.84);
      tl.to(".gap-fragment-4", { x: -20, y: -70, rotate: -5, duration: 0.35 }, 0.87);
      tl.to(".gap-fragment-5", { x: 50, y: 60, rotate: 10, duration: 0.35 }, 0.90);

      // Beat 4: bridge broken
      tl.fromTo(".gap-bridge", { opacity: 0, scale: 0.9 }, {
        opacity: 1, scale: 1, duration: 0.2,
      }, 1.1);

      // Beat 5: everything dims, final line appears
      tl.to(".gap-participant, .gap-fragment, .gap-intention", { opacity: 0.12, duration: 0.2 }, 1.3);
      tl.fromTo(".gap-final-line", { opacity: 0, y: 10 }, {
        opacity: 1, y: 0, duration: 0.3,
      }, 1.4);
    }, gapSectionRef);

    return () => ctx.revert();
  }, [reduce]);

  // GSAP — The Shared Layer (pinned scroll section)
  useEffect(() => {
    if (reduce || !layerSectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: layerSectionRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Signal forms
      tl.fromTo(".layer-signal", { scale: 0, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.3, ease: "power3.out",
      }, 0);

      // Fragments converge
      tl.to(".layer-fragment", { x: 0, y: 0, opacity: 0.7, duration: 0.35, stagger: 0.05 }, 0.25);

      // Participants illuminate
      tl.to(".layer-participant", { opacity: 1, scale: 1, duration: 0.2, stagger: 0.06 }, 0.55);

      // Handoff card expands
      tl.fromTo(".layer-card", { opacity: 0, y: 20, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.3,
      }, 0.8);

      // Final copy
      tl.fromTo(".layer-copy", { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.25,
      }, 1.1);
    }, layerSectionRef);

    return () => ctx.revert();
  }, [reduce]);

  const [expandedCard, setExpandedCard] = useState(false);

  return (
    <div className="w-full bg-white text-[#0A0A0A] overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 nav-glass"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Mark */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Metaphor home">
            <MetaphorLogo className="w-6 h-6" />
            <span
              className="text-[15px] font-semibold tracking-tight text-[#0A0A0A]"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Metaphor
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {["Platform", "How it works", "Use cases", "Security"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                className="px-3 py-1.5 text-[13.5px] text-[#6B7280] hover:text-[#0A0A0A] transition-colors rounded-lg hover:bg-[rgba(10,10,10,0.04)]"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13.5px] text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-3 py-1.5 rounded-lg hover:bg-[rgba(10,10,10,0.04)]"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Sign in
            </Link>
            <Link
              href="/onboard"
              className="btn-primary text-[13.5px] min-h-[36px] px-4 rounded-full"
              id="nav-cta"
            >
              Build your network
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[rgba(10,10,10,0.04)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="w-5 h-0.5 bg-[#0A0A0A] mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-[#0A0A0A] mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-[#0A0A0A] transition-all" />
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[rgba(10,10,10,0.06)] bg-white/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-3"
            >
              {["Platform", "How it works", "Use cases", "Security"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[14px] text-[#6B7280] py-2 border-b border-[rgba(10,10,10,0.06)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Link href="/login" className="text-[14px] py-2 text-[#0A0A0A]">Sign in</Link>
              <Link href="/onboard" className="btn-primary w-full justify-center mt-2">
                Build your network
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── §1 HERO ─────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="min-h-[100dvh] flex items-center pt-16"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16 lg:py-0">

          {/* Left — copy */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1
                id="hero-heading"
                className="font-display text-[clamp(52px,6vw,88px)] leading-[1.05] tracking-[-0.025em] text-[#0A0A0A]"
                style={{ fontWeight: 500 }}
              >
                Make your AI tools work as one.
              </h1>
            </motion.div>

            <motion.p
              className="text-[17px] text-[#6B7280] leading-relaxed max-w-[460px]"
              style={{ fontFamily: "Satoshi, sans-serif" }}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Shared context. Intelligent handoffs. Coordinated execution — without you carrying the context between tools.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/onboard"
                className="btn-primary flex items-center gap-2 group"
                id="hero-primary-cta"
              >
                Build your network
                <ArrowRight size={15} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-ghost"
                id="hero-secondary-cta"
              >
                Explore how it works
              </a>
            </motion.div>

            {/* Social proof strip — below hero per taste rules */}
            <motion.div
              className="flex items-center gap-6 pt-2"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {[
                { label: "Participants connected", value: "12+" },
                { label: "Context handoffs", value: "1,049+" },
                { label: "Setup time", value: "< 5 min" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className="text-[18px] font-semibold text-[#0A0A0A] tracking-tight"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    {stat.value}
                  </span>
                  <span className="label-mono">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — live network diagram */}
          <motion.div
            className="relative w-full aspect-square max-w-[520px] mx-auto lg:mx-0"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          >
            {/* Subtle dot-grid background for the diagram area */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)",
              }}
            />
            <ParticipantNetwork phase={networkPhase} />
          </motion.div>
        </div>
      </section>

      {/* ── §2 THE CONTEXT GAP (GSAP pinned) ───────────────────────────── */}
      <section
        id="how-it-works"
        ref={gapSectionRef}
        className="relative min-h-[100dvh] bg-white flex items-center overflow-hidden"
        aria-label="The Context Gap section"
      >
        <div ref={gapInnerRef} className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">

            {/* Left — label + copy */}
            <div className="flex flex-col gap-6">
              <div className="label-mono text-[#6366F1]">The context gap</div>
              <h2
                className="font-display text-[clamp(40px,4.5vw,68px)] leading-[1.08] tracking-[-0.02em]"
                style={{ fontWeight: 500 }}
              >
                Every tool knows part of the work.
              </h2>

              <div className="flex flex-col gap-4 mt-2">
                {/* Participant chips */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "ChatGPT", role: "Reasoning" },
                    { name: "Claude", role: "Architecture" },
                    { name: "GitHub", role: "Codebase" },
                    { name: "Notion", role: "Knowledge" },
                    { name: "Antigravity", role: "Development" },
                    { name: "Cursor", role: "Implementation" },
                  ].map((p, i) => (
                    <div
                      key={p.name}
                      className={`gap-participant glass-card flex items-center gap-2.5 px-3 py-2.5 rounded-xl`}
                      style={{ borderRadius: 12, opacity: 0, transform: "scale(0.7) translateY(12px)" }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                        style={{ background: PARTICIPANTS[i]?.color || "#6366F1" }}
                      >
                        {p.name[0]}
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                          {p.name}
                        </div>
                        <div className="label-mono text-[9px]">{p.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bridge text — appears in beat 4 */}
              <div className="gap-bridge opacity-0">
                <p className="text-[15px] text-[#6B7280] leading-relaxed border-l-2 border-[#6366F1] pl-4">
                  Every handoff starts with catching the next tool up.
                </p>
              </div>

              {/* Final line — appears in beat 5 */}
              <div className="gap-final-line opacity-0">
                <p
                  className="font-display text-[22px] text-[#0A0A0A] leading-snug"
                  style={{ fontStyle: "italic", fontWeight: 400 }}
                >
                  The problem is not a lack of intelligence. It is a lack of connection.
                </p>
              </div>
            </div>

            {/* Right — fragments / intention visual */}
            <div className="relative flex items-center justify-center min-h-[400px]">
              {/* Central intention */}
              <div
                className="gap-intention opacity-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div
                  className="px-4 py-3 glass-elevated rounded-2xl text-center max-w-[200px]"
                >
                  <div className="label-mono mb-1">Intention</div>
                  <div className="text-[14px] font-semibold text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    Build the Clario notification system.
                  </div>
                </div>
              </div>

              {/* Scattered context fragments */}
              <div className="absolute inset-0 flex items-center justify-center">
                {FRAGMENTS.map((f, i) => (
                  <div
                    key={f.label}
                    className={`gap-fragment gap-fragment-${i} absolute opacity-0 scale-0`}
                    style={{
                      top: `${20 + i * 12}%`,
                      left: `${10 + ((i * 17) % 70)}%`,
                    }}
                  >
                    <div
                      className="px-2.5 py-1.5 rounded-xl border border-[rgba(10,10,10,0.08)] bg-white shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span className="text-[#6366F1] text-[10px]">{f.emoji}</span>
                      <span className="text-[11px] text-[#374151]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        {f.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicator (reduced motion only) */}
        {reduce && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <a href="#shared-layer" className="text-[13px] text-[#6B7280] flex items-center gap-1.5">
              Continue reading <ArrowRight size={12} />
            </a>
          </div>
        )}
      </section>

      {/* ── §3 THE SHARED LAYER (GSAP pinned) ──────────────────────────── */}
      <section
        id="shared-layer"
        ref={layerSectionRef}
        className="relative min-h-[100dvh] bg-white flex items-center overflow-hidden"
        aria-label="The Shared Layer section"
      >
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">

            {/* Left — label + copy */}
            <div className="flex flex-col gap-6">
              <div className="label-mono text-[#6366F1]">The shared layer</div>
              <h2
                className="font-display text-[clamp(40px,4.5vw,68px)] leading-[1.08] tracking-[-0.02em]"
                style={{ fontWeight: 500 }}
              >
                Give every tool the context it needs.
              </h2>

              <p className="text-[16px] text-[#6B7280] leading-relaxed max-w-[440px]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Metaphor keeps your project reality in one shared layer, then moves the right context to the right participant at the right moment.
              </p>

              {/* Handoff card */}
              <div className="layer-card opacity-0">
                <button
                  className="w-full text-left glass-card p-5 rounded-2xl group"
                  onClick={() => setExpandedCard(!expandedCard)}
                  aria-expanded={expandedCard}
                  aria-controls="handoff-detail"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="label-mono text-[#6366F1] mb-2">Clario notification system</div>
                      <div className="text-[14px] font-semibold text-[#0A0A0A] mb-1" style={{ fontFamily: "Satoshi, sans-serif" }}>
                        Draft the system architecture
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                        <span>Assigned to:</span>
                        <span className="font-medium text-[#D97706]">Claude</span>
                        <span className="text-[rgba(10,10,10,0.2)]">·</span>
                        <span>4 decisions · 2 constraints · 3 artifacts</span>
                      </div>
                    </div>
                    <div
                      className="shrink-0 w-6 h-6 rounded-full border border-[rgba(10,10,10,0.1)] flex items-center justify-center transition-transform"
                      style={{ transform: expandedCard ? "rotate(90deg)" : "rotate(0deg)" }}
                    >
                      <ArrowRight size={10} className="text-[#6B7280]" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedCard && (
                      <motion.div
                        id="handoff-detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-[rgba(10,10,10,0.06)] grid grid-cols-2 gap-4">
                          {[
                            { title: "Decisions", items: ["Push-based architecture selected", "Q4 deployment deadline"] },
                            { title: "Constraints", items: ["Preserve current API contract", "Use existing TypeScript structure"] },
                          ].map((group) => (
                            <div key={group.title}>
                              <div className="label-mono mb-2">{group.title}</div>
                              {group.items.map((item) => (
                                <div key={item} className="flex items-start gap-1.5 mb-1.5">
                                  <Check size={10} weight="bold" className="text-[#16A34A] mt-0.5 shrink-0" />
                                  <span className="text-[12px] text-[#374151]" style={{ fontFamily: "Satoshi, sans-serif" }}>{item}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <div className="layer-copy opacity-0">
                <p
                  className="font-display text-[20px] text-[#0A0A0A] leading-snug"
                  style={{ fontStyle: "italic", fontWeight: 400 }}
                >
                  Metaphor finds the right capability, then prepares the right context.
                </p>
              </div>
            </div>

            {/* Right — signal network forming */}
            <div className="relative flex items-center justify-center min-h-[440px]">
              {/* Central Metaphor signal */}
              <div className="layer-signal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" style={{ opacity: 0, transform: "translate(-50%,-50%) scale(0)" }}>
                <div
                  className="w-20 h-20 rounded-full border-2 border-[#6366F1] flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                    boxShadow: "0 0 32px rgba(99,102,241,0.15)",
                  }}
                >
                  <span className="text-[11px] font-semibold text-[#6366F1]" style={{ fontFamily: "Satoshi, sans-serif" }}>Metaphor</span>
                </div>
              </div>

              {/* Converging fragments */}
              {FRAGMENTS.slice(0, 4).map((f, i) => {
                const angles = [45, 135, 225, 315];
                const angle = angles[i] * (Math.PI / 180);
                const r = 120;
                return (
                  <div
                    key={f.label}
                    className="layer-fragment absolute"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: `translate(calc(-50% + ${Math.cos(angle) * r}px), calc(-50% + ${Math.sin(angle) * r}px))`,
                      opacity: 0,
                    }}
                  >
                    <div className="px-2.5 py-1.5 rounded-xl border border-[rgba(10,10,10,0.08)] bg-white shadow-sm whitespace-nowrap">
                      <span className="text-[11px] text-[#374151]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        {f.label}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Capability scan participants */}
              {[
                { name: "Planning", color: "#10A37F", angle: 0 },
                { name: "Architecture", color: "#D97706", angle: 90 },
                { name: "Implementation", color: "#8B5CF6", angle: 180 },
                { name: "Repository", color: "#0A0A0A", angle: 270 },
              ].map((cap, i) => {
                const angle = cap.angle * (Math.PI / 180);
                const r = 160;
                return (
                  <div
                    key={cap.name}
                    className="layer-participant absolute opacity-0 scale-75"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: `translate(calc(-50% + ${Math.cos(angle) * r}px), calc(-50% + ${Math.sin(angle) * r}px))`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ borderColor: cap.color, background: `${cap.color}15` }}
                    >
                      <span style={{ color: cap.color, fontFamily: "JetBrains Mono, monospace", fontSize: "8px" }}>
                        {cap.name.slice(0, 2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── §4 FOOTER CTA ───────────────────────────────────────────────── */}
      <section
        id="start"
        className="relative py-32 px-6 bg-white overflow-hidden"
        aria-labelledby="footer-cta-heading"
      >
        {/* Very subtle dot grid */}
        <div className="absolute inset-0 metaphor-dot-grid opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <motion.h2
            id="footer-cta-heading"
            className="font-display text-[clamp(44px,5vw,80px)] leading-[1.06] tracking-[-0.025em] text-[#0A0A0A] max-w-3xl"
            style={{ fontWeight: 500 }}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Your tools are ready. Give them shared context.
          </motion.h2>

          <motion.p
            className="text-[17px] text-[#6B7280] leading-relaxed max-w-[480px]"
            style={{ fontFamily: "Satoshi, sans-serif" }}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Build a connected workspace where your agents, MCP servers, and tools move work forward together.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/onboard"
              className="btn-primary flex items-center gap-2 group"
              id="footer-cta"
            >
              Build your network
              <ArrowRight size={15} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/login" className="btn-ghost">Sign in</Link>
          </motion.div>
        </div>

        {/* Footer links */}
        <div className="relative mt-24 pt-8 border-t border-[rgba(10,10,10,0.06)] max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <MetaphorLogo className="w-5 h-5 opacity-40" />
            <span className="text-[12px] text-[#9CA3AF]" style={{ fontFamily: "Satoshi, sans-serif" }}>
              © {new Date().getFullYear()} Metaphor
            </span>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Security", "Documentation"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[12px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
