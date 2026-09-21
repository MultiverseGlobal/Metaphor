"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "@phosphor-icons/react";

export default function ConnectedWorldPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 min-h-[70vh]">
      <motion.div 
        className="flex flex-col items-center max-w-md text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Subtle icon/indicator */}
        <div className="w-12 h-12 rounded-full border border-[rgba(10,10,10,0.06)] flex items-center justify-center mb-6 glass-clear">
          <div className="w-2 h-2 rounded-full bg-[var(--color-ink)]" />
        </div>

        {/* Messaging */}
        <h1 
          className="text-[20px] text-[var(--color-ink)] mb-3"
          style={{ fontFamily: "'Cormorant Garamond', var(--next-font-display), serif", fontStyle: "italic" }}
        >
          Your environment is quiet
        </h1>
        
        <p className="text-[14px] text-[#3B4043] leading-relaxed mb-8">
          The canvas is ready. Connect your first tool or create a new project to establish shared context.
        </p>

        {/* Action */}
        <button className="h-[40px] px-6 rounded-full bg-[var(--color-ink)] text-white text-[13px] font-medium hover:bg-[#2A2E33] transition-colors flex items-center gap-2">
          <Plus size={14} weight="bold" />
          <span>New Project</span>
        </button>
      </motion.div>
    </div>
  );
}
