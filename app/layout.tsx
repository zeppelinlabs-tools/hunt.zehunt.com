import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { RoleProvider } from "@/components/RoleProvider";
import PlatformShell from "@/components/PlatformShell";

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hunt.zehunt.com"),
  title: {
    default: "Hunt — Developer Knowledge Network & AI Memory Layer",
    template: "%s | Hunt",
  },
  description:
    "The problem-solving memory layer for developers and autonomous AI agents. Search verified error investigations, runtime environment matrices, avoided dead ends, and reproducible solutions via MCP.",
  keywords: [
    "developer knowledge network",
    "Model Context Protocol",
    "MCP server",
    "debugging dead ends",
    "verified solutions",
    "Next.js 15 errors",
    "Neon PostgreSQL",
    "Supabase Auth",
    "Cursor rules",
    "Claude Desktop MCP",
    "software engineering memory layer",
  ],
  authors: [{ name: "Zehunt", url: "https://zehunt.com" }],
  creator: "Zehunt",
  publisher: "Hunt by Zehunt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/hunt-icon.ico", sizes: "any" },
      { url: "/hunt-icon.jpg", sizes: "192x192", type: "image/jpeg" },
    ],
    shortcut: "/hunt-icon.ico",
    apple: [
      { url: "/hunt-icon.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hunt.zehunt.com",
    siteName: "Hunt by Zehunt",
    title: "Hunt — Developer Knowledge Network & AI Memory Layer",
    description:
      "Captures the full engineering investigation: environment context, dead ends, root causes, and verified fixes for developers and AI agents.",
    images: [
      {
        url: "/horizantal-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Hunt Developer Knowledge Network by Zehunt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hunt — Developer Knowledge Network & AI Memory Layer",
    description:
      "Stop repeating debugging loops. Discover verified engineering fixes and avoided dead ends.",
    images: ["/horizantal-logo.jpg"],
    creator: "@zehunt",
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
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hunt",
  alternateName: "Hunt by Zehunt",
  url: "https://hunt.zehunt.com",
  description: "AI-native developer knowledge network preserving failed attempts and verified solutions.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://hunt.zehunt.com/solutions?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const jsonLdSoftwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Hunt MCP Protocol Server",
  operatingSystem: "Cross-platform",
  applicationCategory: "DeveloperApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Model Context Protocol (MCP) JSON-RPC 2.0 endpoint",
    "Verified solution retrieval (hunt_get_solution)",
    "Failed attempts avoidance (hunt_find_failed_attempts)",
    "Semantic error search (hunt_search)",
  ],
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zehunt",
  url: "https://zehunt.com",
  logo: "https://hunt.zehunt.com/horizantal-logo.jpg",
  sameAs: ["https://github.com/zehunt"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="min-h-screen bg-[#fafafa] text-[#171717] antialiased">
        <RoleProvider>
          <PlatformShell>
            {children}
          </PlatformShell>
        </RoleProvider>
      </body>
    </html>
  );
}
