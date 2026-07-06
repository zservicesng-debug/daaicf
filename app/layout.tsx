import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Playfair_Display } from "next/font/google";
import { ScrollObserver } from "@/components/layout/scroll-observer";
import { ToastProvider } from "@/components/ui/toast-provider";
import {
  FOUNDATION_MOTTO,
  FOUNDATION_OPERATING_YEAR,
  FOUNDATION_REGISTERED_YEAR,
} from "@/lib/foundation";
import {
  SITE_ACRONYM,
  SITE_NAME,
  coreSeoKeywords,
  organizationAliases,
} from "@/lib/seo";
import { getAppBaseUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: {
    default: `${SITE_ACRONYM} | ${SITE_NAME}`,
    template: `%s | ${SITE_ACRONYM}`,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png" },
      { url: "/icon", rel: "shortcut icon", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  description:
    `${SITE_NAME}, also known as ${SITE_ACRONYM}, supports underserved communities across Nigeria since ${FOUNDATION_OPERATING_YEAR} and is officially registered in ${FOUNDATION_REGISTERED_YEAR}.`,
  applicationName: SITE_ACRONYM,
  authors: [{ name: SITE_NAME, url: "/" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Nonprofit organization",
  keywords: coreSeoKeywords,
  other: {
    "application-name": SITE_ACRONYM,
    "og:alternate_name": organizationAliases.join(", "),
  },
  openGraph: {
    title: `${SITE_ACRONYM} | ${SITE_NAME}`,
    description:
      `${FOUNDATION_MOTTO} through education, healthcare, infrastructure, relief, and empowerment.`,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_NG",
    images: [{ url: "/icon", alt: `${SITE_ACRONYM} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_ACRONYM} | ${SITE_NAME}`,
    description:
      `${FOUNDATION_MOTTO} through education, healthcare, infrastructure, relief, and empowerment.`,
    images: ["/icon"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#1A5C2A",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <ToastProvider>
          <ScrollObserver />
          {children}
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}
