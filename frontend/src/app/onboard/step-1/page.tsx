"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

// ── Step 1 — Name the beginning ───────────────────────────────────────────────

const MAX_NAME = 48;
const MAX_DESCRIPTION = 160;

interface FormState {
  name: string;
  description: string;
}

function getStoredState(): FormState {
  if (typeof window === "undefined") return { name: "", description: "" };
  try {
    const raw = sessionStorage.getItem("metaphor_onboard_step1");
    return raw ? JSON.parse(raw) : { name: "", description: "" };
  } catch {
    return { name: "", description: "" };
  }
}

function validateName(v: string) {
  if (!v.trim()) return "Give your project a name";
  if (v.trim().length < 2) return "Must be at least 2 characters";
  if (v.length > MAX_NAME) return `Keep it under ${MAX_NAME} characters`;
  return null;
}

export default function OnboardStep1() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: "", description: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [touched, setTouched] = useState({ name: false, description: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore state from sessionStorage (survives back-nav)
  useEffect(() => {
    setForm(getStoredState());
  }, []);

  // Persist state on every change
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("metaphor_onboard_step1", JSON.stringify(form));
    }
  }, [form]);

  const handleChange = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      if (field === "name") {
        const err = validateName(value);
        setErrors((prev) => ({ ...prev, name: err || undefined }));
      }
    }
  }, [touched]);

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "name") {
      const err = validateName(form.name);
      setErrors((prev) => ({ ...prev, name: err || undefined }));
    }
  };

  const handleContinue = async () => {
    const nameErr = validateName(form.name);
    if (nameErr) {
      setErrors({ name: nameErr });
      setTouched({ name: true, description: true });
      return;
    }
    setIsSubmitting(true);
    // Brief pause for natural feel
    await new Promise((r) => setTimeout(r, 180));
    router.push("/onboard/step-2");
  };

  const isNameValid = !validateName(form.name);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-[rgba(10,10,10,0.06)]">
        <Link href="/" className="flex items-center gap-2" aria-label="Metaphor home">
          <MetaphorLogo className="w-5 h-5" />
          <span
            className="text-[14px] font-semibold tracking-tight text-[#0A0A0A]"
            style={{ fontFamily: "Satoshi, sans-serif" }}
          >
            Metaphor
          </span>
        </Link>
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-8 h-1 rounded-full bg-[#6366F1]" />
            <div className="w-8 h-1 rounded-full bg-[rgba(10,10,10,0.10)]" />
          </div>
          <span
            className="text-[11px] text-[#6B7280]"
            style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em" }}
          >
            01 / 02
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12" id="onboard-step-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[540px] flex flex-col gap-10"
        >
          {/* Heading */}
          <div className="flex flex-col gap-3">
            <div
              className="text-[11px] text-[#6366F1] tracking-widest uppercase"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              Step 1
            </div>
            <h1
              className="font-display text-[clamp(36px,5vw,56px)] leading-[1.08] tracking-[-0.02em] text-[#0A0A0A]"
              style={{ fontWeight: 500 }}
            >
              What are you working on?
            </h1>
            <p className="text-[15px] text-[#6B7280] leading-relaxed" style={{ fontFamily: "Satoshi, sans-serif" }}>
              Give Metaphor a starting point. Every context, handoff, and coordination flows from this.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6">

            {/* Project name */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project-name"
                className="text-[11px] tracking-widest uppercase text-[#6B7280]"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                Project name
              </label>

              <div className="relative">
                <input
                  id="project-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  maxLength={MAX_NAME + 5}
                  placeholder="e.g. Clario notification system"
                  className="w-full px-4 py-3.5 bg-white border rounded-2xl text-[16px] text-[#0A0A0A] placeholder:text-[rgba(10,10,10,0.25)] outline-none transition-all"
                  style={{
                    fontFamily: "Satoshi, sans-serif",
                    letterSpacing: "-0.01em",
                    border: errors.name
                      ? "1px solid rgba(220,38,38,0.5)"
                      : form.name
                      ? "1px solid rgba(99,102,241,0.4)"
                      : "1px solid rgba(10,10,10,0.10)",
                    boxShadow: form.name && !errors.name
                      ? "0 0 0 3px rgba(99,102,241,0.08)"
                      : errors.name
                      ? "0 0 0 3px rgba(220,38,38,0.06)"
                      : "none",
                  }}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  autoFocus
                />

                {/* Character count */}
                <span
                  className="absolute right-3.5 bottom-3.5 text-[10px]"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: form.name.length > MAX_NAME ? "rgba(220,38,38,0.8)" : "rgba(10,10,10,0.25)",
                  }}
                >
                  {form.name.length}/{MAX_NAME}
                </span>
              </div>

              {/* Error */}
              <AnimatePresence>
                {errors.name && (
                  <motion.span
                    id="name-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[12px] text-red-500"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                    role="alert"
                  >
                    {errors.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Live preview — the project name becomes a display word */}
              <AnimatePresence>
                {form.name.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-2 px-4 py-3 rounded-xl border border-[rgba(99,102,241,0.12)] bg-[rgba(99,102,241,0.03)]"
                    >
                      <div
                        className="text-[11px] text-[#6B7280] mb-1"
                        style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em" }}
                      >
                        Your workspace will be named
                      </div>
                      <div
                        className="font-display text-[22px] text-[#6366F1] leading-snug"
                        style={{ fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.01em" }}
                      >
                        {form.name.trim()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Project description */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project-description"
                className="text-[11px] tracking-widest uppercase text-[#6B7280] flex items-center justify-between"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                <span>Short description</span>
                <span className="normal-case text-[10px] text-[rgba(10,10,10,0.30)]">Optional</span>
              </label>

              <textarea
                id="project-description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onBlur={() => handleBlur("description")}
                maxLength={MAX_DESCRIPTION + 10}
                placeholder="What's the goal? Who's using it? What tools are already in play?"
                rows={3}
                className="w-full px-4 py-3.5 bg-white border border-[rgba(10,10,10,0.10)] rounded-2xl text-[15px] text-[#0A0A0A] placeholder:text-[rgba(10,10,10,0.25)] outline-none resize-none transition-all focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  letterSpacing: "-0.005em",
                  lineHeight: 1.6,
                }}
                aria-label="Project description (optional)"
              />

              <div className="flex items-center justify-between">
                <p className="text-[12px] text-[rgba(10,10,10,0.35)]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  Metaphor uses this to suggest tool connections and prepare context briefs.
                </p>
                <span
                  className="text-[10px] shrink-0 ml-3"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: form.description.length > MAX_DESCRIPTION ? "rgba(220,38,38,0.8)" : "rgba(10,10,10,0.25)",
                  }}
                >
                  {form.description.length}/{MAX_DESCRIPTION}
                </span>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 group mt-2"
              id="step1-continue"
              whileTap={{ scale: 0.98 }}
              style={{ minHeight: 52 }}
            >
              {isSubmitting ? (
                <span className="text-[14px]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  Setting up...
                </span>
              ) : (
                <>
                  <span className="text-[14px]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    Continue — connect your tools
                  </span>
                  <ArrowRight
                    size={15}
                    weight="bold"
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </>
              )}
            </motion.button>

            {/* Sign in prompt */}
            <p className="text-center text-[13px] text-[rgba(10,10,10,0.38)]" style={{ fontFamily: "Satoshi, sans-serif" }}>
              Already have a workspace?{" "}
              <Link href="/login" className="text-[#6366F1] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
