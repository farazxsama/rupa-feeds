import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FloatingContact } from "@/components/ui/FloatingContact";

export const metadata: Metadata = {
  title: "Rupa Feeds — Nutrition That Moves With Your Pond",
  description:
    "Floating, sinking and polyculture fish feed from Rupa Feeds — specialized feed for different feeding zones and aquaculture needs.",
};

export const viewport: Viewport = {
  themeColor: "#0504aa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {children}
        {/* breathing room so the floating buttons never sit on the footer's last line */}
        <div aria-hidden="true" className="h-24 bg-pond-950" />
        <FloatingContact />
      </body>
    </html>
  );
}
