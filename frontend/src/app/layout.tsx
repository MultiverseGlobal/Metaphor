import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metaphor — The Context Operating System",
  description: "Metaphor is the Context Operating System for intelligent applications — transforming fragmented events into a living structured knowledge graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#07080c] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
