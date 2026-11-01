import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Archivo_Black, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CallbackDock } from "@/components/callback-dock";

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bandari Motors — Import a vehicle to Kenya, tracked from auction to your gate",
  description:
    "Order Japanese, UK and UAE vehicles online, watch every stage of the shipment to Mombasa, clear with KRA and share updates with your crew. Real duty calculations, live tracking, 10-stage pipeline.",
  keywords: [
    "import cars to Kenya",
    "Japanese used cars Kenya",
    "vehicle shipping Mombasa",
    "KRA duty calculator",
    "car tracking Kenya",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <CallbackDock />
      </body>
    </html>
  );
}
