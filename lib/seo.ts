import type { Metadata } from "next";
import { FOUNDATION_MOTTO, FOUNDATION_OPERATING_YEAR } from "@/lib/foundation";
import { getConfiguredSocialLinks } from "@/lib/site-config";
import { appUrl, getAppBaseUrl } from "@/lib/site-url";

export const SITE_NAME = "Dr. Andrew A. Igwe Care Foundation";
export const SITE_ACRONYM = "DAAICF";
export const FOUNDER_NAME = "Dr. Andrew A. Igwe";
export const FOUNDER_PROFILE_PATH = "/about/dr-andrew-igwe";

export const organizationAliases = [
  SITE_ACRONYM,
  "DAAICF Foundation",
  "Dr Andrew A Igwe Care Foundation",
  "Dr Andrew Igwe Care Foundation",
  "Andrew Igwe Care Foundation",
];

export const founderAliases = [
  "Dr Andrew",
  "Dr Andrew A",
  "Dr Andrew Igwe",
  "Dr Andrew A Igwe",
  "Andrew Igwe",
  "Dr. Andrew Igwe",
];

export const coreSeoKeywords = [
  SITE_ACRONYM,
  SITE_NAME,
  ...organizationAliases,
  FOUNDER_NAME,
  ...founderAliases,
  "Nigeria NGO",
  "Nigeria charity foundation",
  "education outreach Nigeria",
  "medical outreach Nigeria",
  "community empowerment Nigeria",
];

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  return {
    title,
    description,
    keywords: [...coreSeoKeywords, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_NG",
      images: [{ url: "/icon", alt: `${SITE_ACRONYM} logo` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/icon"],
    },
  };
}

export function jsonLdScript(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export function buildSiteJsonLd() {
  const baseUrl = getAppBaseUrl();
  const socialLinks = getConfiguredSocialLinks();
  const sameAs = [
    socialLinks.facebookUrl,
    socialLinks.twitterUrl,
    socialLinks.instagramUrl,
  ].filter(Boolean);
  const organizationId = `${baseUrl}/#organization`;
  const founderId = `${baseUrl}${FOUNDER_PROFILE_PATH}#person`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["NGO", "Organization"],
        "@id": organizationId,
        name: SITE_NAME,
        alternateName: organizationAliases,
        legalName: SITE_NAME,
        url: baseUrl,
        logo: appUrl("/icon"),
        foundingDate: String(FOUNDATION_OPERATING_YEAR),
        description: `${SITE_NAME}, also known as ${SITE_ACRONYM}, supports underserved communities across Nigeria through education, healthcare, infrastructure, relief, and empowerment.`,
        slogan: FOUNDATION_MOTTO,
        areaServed: {
          "@type": "Country",
          name: "Nigeria",
        },
        founder: {
          "@id": founderId,
        },
        sameAs,
      },
      {
        "@type": "Person",
        "@id": founderId,
        name: FOUNDER_NAME,
        alternateName: founderAliases,
        honorificPrefix: "Dr.",
        url: appUrl(FOUNDER_PROFILE_PATH),
        jobTitle: "Founder and Sole Financer",
        worksFor: {
          "@id": organizationId,
        },
        affiliation: {
          "@id": organizationId,
        },
        description:
          "Dr. Andrew A. Igwe is the founder of Dr. Andrew A. Igwe Care Foundation, also known as DAAICF.",
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        name: SITE_NAME,
        alternateName: organizationAliases,
        url: baseUrl,
        publisher: {
          "@id": organizationId,
        },
        inLanguage: "en-NG",
      },
    ],
  };
}

export function buildFounderJsonLd() {
  const baseUrl = getAppBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${baseUrl}${FOUNDER_PROFILE_PATH}#profile-page`,
    url: appUrl(FOUNDER_PROFILE_PATH),
    name: `${FOUNDER_NAME} - Founder of ${SITE_ACRONYM}`,
    about: {
      "@id": `${baseUrl}${FOUNDER_PROFILE_PATH}#person`,
    },
    isPartOf: {
      "@id": `${baseUrl}/#website`,
    },
  };
}
