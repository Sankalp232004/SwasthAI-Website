import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { SITE_CONFIG } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: "SwasthAI • Intelligent Medical Triage System for Clinics",
    template: "%s | SwasthAI"
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Clinic Management",
    "Healthcare",
    "Patient Experience",
    "OPD",
    "HealthTech",
    "Digital Health",
    "Healthcare Operations",
    "Clinic Workflow",
    "Patient Triage",
    "Queue Management",
    "India Healthcare"
  ],
  authors: [{ name: SITE_CONFIG.founder.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.url}/img/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.fullName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}/img/og-image.png`],
    creator: "@swasthai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/img/favicon.ico",
    shortcut: "/img/favicon-32x32.png",
    apple: "/img/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data (JSON-LD) for Healthcare Software / Organization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": SITE_CONFIG.name,
    "operatingSystem": "All Web Browsers (Chrome, Safari, Edge)",
    "applicationCategory": "HealthApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "description": SITE_CONFIG.description,
    "creator": {
      "@type": "Person",
      "name": SITE_CONFIG.founder.name
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_CONFIG.name,
      "url": SITE_CONFIG.url,
      "logo": `${SITE_CONFIG.url}/img/logo.png`
    }
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <AnalyticsTracker />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
