"use client";

import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground selection:bg-primary/30 selection:text-white">
      {/* The Void - No Sidebars, No Headers. Just the generative canvas. */}
      <main className="flex-1 relative w-full h-full">
        {children}
      </main>
    </div>
  );
}
