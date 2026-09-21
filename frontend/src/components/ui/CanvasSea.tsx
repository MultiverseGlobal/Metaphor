"use client";

import { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  maxRadius: number;
  held: boolean;
  releaseTime?: number;
}

const WAKE_DURATION_MS = 600; // Exact spec: fades over 600ms
const RIPPLE_DURATION_MS = 450;
const HELD_RADIUS = 12; // Spec: Selection -> held ripple at 12px radius

export function CanvasSea() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];
    let ripples: Ripple[] = [];
    let activeHoldRipple: Ripple | null = null;
    let holdTimeout: NodeJS.Timeout | null = null;
    let isVisible = true;

    // Handle high-DPI displays
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      points.push({
        x: e.clientX,
        y: e.clientY,
        time: now,
      });

      // Keep recent points
      if (points.length > 250) {
        points.shift();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;

      // Check if held for > 200ms
      holdTimeout = setTimeout(() => {
        activeHoldRipple = {
          x,
          y,
          startTime: performance.now(),
          duration: RIPPLE_DURATION_MS,
          maxRadius: HELD_RADIUS,
          held: true,
        };
        ripples.push(activeHoldRipple);
      }, 200);

      // Instant click ripple
      ripples.push({
        x,
        y,
        startTime: now,
        duration: RIPPLE_DURATION_MS,
        maxRadius: 36,
        held: false,
      });
    };

    const handleMouseUp = () => {
      if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
      }
      if (activeHoldRipple) {
        activeHoldRipple.held = false;
        activeHoldRipple.releaseTime = performance.now();
        activeHoldRipple.maxRadius = 32;
        activeHoldRipple = null;
      }
    };

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (now: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Filter expired points using wall-clock time
      points = points.filter((p) => now - p.time < WAKE_DURATION_MS);

      // Filter expired ripples
      ripples = ripples.filter((r) => {
        if (r.held) return true;
        const refTime = r.releaseTime ?? r.startTime;
        return now - refTime < r.duration;
      });

      // Only draw when there are points or ripples
      if (points.length > 0 || ripples.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw individual wake segments with fading opacity
        for (let i = 1; i < points.length; i++) {
          const pt = points[i];
          const prevPt = points[i - 1];

          const lifeRatio = 1 - (now - pt.time) / WAKE_DURATION_MS;
          if (lifeRatio <= 0) continue;

          ctx.beginPath();
          ctx.moveTo(prevPt.x, prevPt.y);
          ctx.lineTo(pt.x, pt.y);

          // Ink color: #111315
          ctx.strokeStyle = `rgba(17, 19, 21, ${lifeRatio * 0.12})`;
          ctx.lineWidth = 1 + lifeRatio * 1.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }

        // Draw ripples
        for (const ripple of ripples) {
          if (ripple.held) {
            // Held ripple stays at 12px with gentle pulse
            const pulse = 1 + Math.sin(now * 0.008) * 0.08;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, HELD_RADIUS * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(17, 19, 21, 0.25)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else {
            const refTime = ripple.releaseTime ?? ripple.startTime;
            const elapsed = now - refTime;
            const progress = Math.min(1, elapsed / ripple.duration);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentRadius = ripple.maxRadius * easeOut;
            const opacity = (1 - progress) * 0.3;

            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, currentRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(17, 19, 21, ${opacity})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (holdTimeout) clearTimeout(holdTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-[#FFFFFF] bg-[radial-gradient(rgba(17,19,21,0.06)_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none w-full h-full"
      style={{ zIndex: -1, backgroundColor: "#FFFFFF" }}
      aria-hidden="true"
    />
  );
}
