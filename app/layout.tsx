import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";

import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "MicroAtlas",
  title: {
    default: "MicroAtlas",
    template: "%s | MicroAtlas",
  },
  description: "A community atlas for micronational claims.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "MicroAtlas",
    description: "A community atlas for micronational claims.",
    url: siteUrl,
    siteName: "MicroAtlas",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "MicroAtlas — A community atlas for micronational claims.",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MicroAtlas",
    description: "A community atlas for micronational claims.",
    images: ["/twitter-image.png"],
  },
};

function SiteNavFallback() {
  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-8 py-4">
        <img
          src="/brand/microatlas-logo-horizontal.svg"
          alt="MicroAtlas"
          className="h-11 w-auto"
        />
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
      <body
        className={`${plexSans.className} ${plexSans.variable} ${cormorant.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Suspense fallback={<SiteNavFallback />}>
            <SiteNav />
          </Suspense>

          {children}

          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}