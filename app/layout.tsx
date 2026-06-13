import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";

import { SiteNav } from "@/components/site-nav";

import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "MicroAtlas",
    template: "%s | MicroAtlas",
  },
  description:
    "A public atlas and registry for micronations, self-declared states, and experimental civic projects.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

function SiteNavFallback() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-8 py-4">
        <span className="font-semibold">MicroAtlas</span>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<SiteNavFallback />}>
            <SiteNav />
          </Suspense>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}