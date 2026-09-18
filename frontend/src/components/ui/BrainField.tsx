"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function BrainField() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position as percentage of window width/height
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* 
        The Context Field: A subtle, breathing ambient object 
        It shifts slightly based on mouse position to feel alive, 
        but remains entirely secondary to content.
      */}
      
      {/* Base ambient field */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[60vw] h-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.03] dark:opacity-[0.06] blur-[120px]"
        style={{
          background: "radial-gradient(circle, var(--pds-accent) 0%, transparent 70%)",
        }}
        animate={{
          x: `calc(${mousePosition.x * 0.1}vw - 5vw)`,
          y: `calc(${mousePosition.y * 0.1}vh - 5vh)`,
          scale: [1, 1.05, 1],
        }}
        transition={{
          x: { type: "spring", stiffness: 10, damping: 30, mass: 2 },
          y: { type: "spring", stiffness: 10, damping: 30, mass: 2 },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Core "Node" - tight, subtle central presence */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[30vw] h-[30vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.02] dark:opacity-[0.04] blur-[80px]"
        style={{
          background: "radial-gradient(circle, var(--color-foreground) 0%, transparent 60%)",
        }}
        animate={{
          scale: [1, 1.1, 0.95, 1],
          rotate: [0, 90, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}
