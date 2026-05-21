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
  metadataBase: new URL("https://daaicf.org"),
  title: {
    default: "Dr. Andrew A. Igwe Care Foundation",
    template: "%s | Dr. Andrew A. Igwe Care Foundation",
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png" },
      { url: "/icon", rel: "shortcut icon", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  description:
    `Supporting underserved communities across Nigeria since ${FOUNDATION_OPERATING_YEAR}, officially registered in ${FOUNDATION_REGISTERED_YEAR}.`,
  applicationName: "DAAICF",
  keywords: [
    "DAAICF",
    "Dr. Andrew A. Igwe Care Foundation",
    "Nigeria charity",
    "education outreach",
    "medical outreach",
    "community empowerment",
  ],
  openGraph: {
    title: "Dr. Andrew A. Igwe Care Foundation",
    description:
      `${FOUNDATION_MOTTO} through education, healthcare, infrastructure, relief, and empowerment.`,
    type: "website",
    locale: "en_NG",
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
