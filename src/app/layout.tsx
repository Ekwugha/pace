import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

/**
 * Font configurations
 * Using Inter for body text and Space Grotesk for display/headings
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pace - AI Day Orchestrator",
  description:
    "An intelligent system that helps you plan overwhelming days through interaction, negotiation, and encouragement.",
  keywords: [
    "productivity",
    "day planner",
    "task management",
    "AI assistant",
    "time management",
  ],
  authors: [{ name: "Pace Team" }],
};

export const viewport: Viewport = {
  themeColor: "#0c4a6e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased min-h-screen bg-slate-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
