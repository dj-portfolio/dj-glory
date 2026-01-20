import React from "react";
import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const _spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DJ GLORY | Electronic Music Producer & Performer | India",
  description:
    "Official portfolio of DJ Glory - India's rising electronic music producer and performer. Experience cutting-edge beats, live performances, and exclusive releases.",
  keywords: [
    "DJ",
    "Producer",
    "Electronic Music",
    "India",
    "EDM",
    "Live Performance",
    "Music Producer",
    "Techno",
    "House Music",
  ],
  authors: [{ name: "DJ Glory" }],
  openGraph: {
    title: "DJ GLORY | Electronic Music Producer & Performer",
    description:
      "India's rising electronic music producer and performer. Experience cutting-edge beats and exclusive releases.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "DJ GLORY | Electronic Music Producer & Performer",
    description:
      "India's rising electronic music producer and performer. Experience cutting-edge beats and exclusive releases.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
