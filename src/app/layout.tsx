import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://portal-gob-mx-tramites.vercel.app";

const siteDescription =
  "El portal gob.mx permite consultar el listado de trámites y programas sociales federales disponibles y a los cuales tienes acceso.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Portal Gob MX",
  description: siteDescription,
  icons: {
    icon: "https://ext.same-assets.com/2098432521/920971351.ico",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    title: "Portal Gob MX",
    description: siteDescription,
    siteName: "Portal Gob MX",
    images: [
      {
        url: "/og-portal-gob-mx-1200.jpg",
        width: 1200,
        height: 630,
        alt: "Gobierno de México",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Gob MX",
    description: siteDescription,
    images: ["/og-portal-gob-mx-1200.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
