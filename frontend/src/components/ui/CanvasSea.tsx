"use client";

import { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  age: number;
  maxAge: number;
}

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

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];
    let ripples: Ripple[] = [];
    
    let isVisible = true;
    let mouseMovedSinceLastFrame = false;

    // Resize canvas
    const handleResize = () => {
      // Handle high-DPI displays
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
      mouseMovedSinceLastFrame = true;
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over clickable element
      const target = e.target as HTMLElement;
      setIsHovering(
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button"
      );

      // Add a point to the wake
      points.push({
        x: e.clientX,
        y: e.clientY,
        age: 0,
        maxAge: 40, // frames to live
      });
      // Cap points to prevent memory leak
      if (points.length > 200) {
        points.shift();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 40,
        opacity: 0.4,
        age: 0,
        maxAge: 30,
      });
    };

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Optimize: Only clear and redraw if there are active animations
      if (points.length === 0 && ripples.length === 0 && !mouseMovedSinceLastFrame) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      mouseMovedSinceLastFrame = false;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Wake (connected lines that fade)
      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const pt = points[i];
          const prevPt = points[i - 1];
          // Simple smoothing
          const xc = (prevPt.x + pt.x) / 2;
          const yc = (prevPt.y + pt.y) / 2;
          ctx.quadraticCurveTo(prevPt.x, prevPt.y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        // We draw the stroke with a gradient or solid color but fading opacity
        // A simple approach is just a single stroke that fades out
        // For a more physical wake, we would draw individual segments, but a single path is faster
        // We'll draw segments to allow fading tail
      }

      // Draw individual segment wake for fade effect
      for (let i = 1; i < points.length; i++) {
        const pt = points[i];
        const prevPt = points[i - 1];
        
        const lifeRatio = 1 - (pt.age / pt.maxAge);
        if (lifeRatio <= 0) continue;

        ctx.beginPath();
        ctx.moveTo(prevPt.x, prevPt.y);
        ctx.lineTo(pt.x, pt.y);
        
        // Ink color: #111315
        ctx.strokeStyle = `rgba(17, 19, 21, ${lifeRatio * 0.15})`;
        ctx.lineWidth = 1 + lifeRatio * 1.5;
        ctx.stroke();
      }

      // Update wake points
      points = points.filter(pt => {
        pt.age++;
        return pt.age < pt.maxAge;
      });

      // Draw Ripples
      ripples.forEach(ripple => {
        const lifeRatio = 1 - (ripple.age / ripple.maxAge);
        
        // Expand radius using ease-out
        const easeOut = 1 - Math.pow(1 - (ripple.age / ripple.maxAge), 3);
        ripple.radius = ripple.maxRadius * easeOut;
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(17, 19, 21, ${ripple.opacity * lifeRatio})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ripple.age++;
      });

      // Filter out dead ripples
      ripples = ripples.filter(r => r.age < r.maxAge);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null; // Fallback to CSS background only
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none w-full h-full bg-[#FFFFFF]"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      />
      {/* Custom Ink Cursor */}
      <div 
        className="fixed top-0 left-0 pointer-events-none rounded-full bg-[var(--color-ink)] transition-transform duration-100 ease-out"
        style={{
          width: isHovering ? '12px' : '8px',
          height: isHovering ? '12px' : '8px',
          transform: `translate(${mousePos.x - (isHovering ? 6 : 4)}px, ${mousePos.y - (isHovering ? 6 : 4)}px)`,
          zIndex: 9999,
          opacity: mousePos.x === -100 ? 0 : 1,
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        body { cursor: none !important; }
        a, button, input, [role="button"] { cursor: none !important; }
      `}} />
    </>
  );
}
