"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
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

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center">
      {/* ── Header ── */}
      <header className="fixed top-8 w-full max-w-4xl px-6 flex items-center justify-between z-50 pointer-events-none">
        <div className="flex items-center justify-between w-full h-[52px] px-8 rounded-full glass-clear backdrop-blur-xl border border-[rgba(10,10,10,0.06)] shadow-[0_14px_40px_rgba(0,0,0,0.04)] pointer-events-auto">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Metaphor home">
            <MetaphorLogo className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity" />
            <span
              className="text-[14px] font-medium tracking-wide text-[var(--color-ink)]"
            >
              Metaphor
            </span>
          </Link>
          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-8 h-1 rounded-full bg-[var(--color-ink)]" />
              <div className="w-8 h-1 rounded-full bg-[rgba(10,10,10,0.10)]" />
            </div>
            <span
              className="text-[11px] text-[#AEB7BC] font-mono tracking-widest uppercase"
            >
              01 / 02
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-2xl pt-16 mt-32 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col gap-16"
        >
          {/* Heading */}
          <div className="flex flex-col gap-6 text-center items-center">
            <h1
              className="font-display text-[clamp(44px,5vw,56px)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]"
              style={{ fontWeight: 400 }}
            >
              What are you working on?
            </h1>
            <p className="text-[16px] text-[#3B4043] leading-relaxed max-w-md">
              Give Metaphor a starting point. Every context, handoff, and coordination flows from this.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-12 w-full max-w-md mx-auto">

            {/* Project name */}
            <div className="flex flex-col gap-4">
              <label
                htmlFor="project-name"
                className="text-[11px] tracking-widest uppercase text-[#AEB7BC] font-mono text-center"
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
                  className="w-full px-0 py-2 bg-transparent border-b text-center text-[24px] text-[var(--color-ink)] placeholder:text-[rgba(10,10,10,0.15)] outline-none transition-all"
                  style={{
                    fontFamily: "'Cormorant Garamond', var(--next-font-display), serif",
                    fontStyle: "italic",
                    borderBottomColor: errors.name
                      ? "rgba(220,38,38,0.5)"
                      : form.name
                      ? "var(--color-ink)"
                      : "rgba(10,10,10,0.10)",
                  }}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  autoFocus
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {errors.name && (
                  <motion.span
                    id="name-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] text-red-500 text-center"
                  >
                    {errors.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* CTA */}
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={handleContinue}
                disabled={isSubmitting}
                className="text-[14px] font-medium text-white bg-[#111315] hover:bg-[#2A2E33] transition-colors h-[48px] px-8 rounded-full flex items-center justify-center gap-3 w-full sm:w-auto"
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span>Setting up...</span>
                ) : (
                  <>
                    <span>Continue to tools</span>
                    <ArrowRight size={15} weight="bold" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
