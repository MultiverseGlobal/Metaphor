import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metaphor | World Modeling Context Engine",
  description: "A continuously evolving model of your world, enabling AI systems to reason over relationships, history, and context.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
