import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ARCHIVED } from "@/lib/archive";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FF8F00",
};

export const metadata: Metadata = {
  title: "GR Sitara Onam Festival",
  description: ARCHIVED
    ? "Namma Onam 2.0, the GR Sitara Onam celebration held on 15 & 16 August 2026."
    : "Join us for a grand Onam celebration at GR Sitara.",
  // A residents' community site: keep it out of search results once archived.
  robots: ARCHIVED ? { index: false, follow: false } : undefined,
  keywords: ["Onam", "Festival", "GR Sitara", "Kerala", "Sadhya"],
  authors: [{ name: "Project Mahabali" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GR Onam",
  },
};

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
