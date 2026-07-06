import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import aboutUsImage from "@/assets/about-us.jpeg";
import { PageHero } from "@/components/public/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { FOUNDATION_OPERATING_YEAR } from "@/lib/foundation";
import {
  FOUNDER_NAME,
  SITE_ACRONYM,
  SITE_NAME,
  buildFounderJsonLd,
  buildPageMetadata,
  founderAliases,
  jsonLdScript,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Dr Andrew - Dr. Andrew Igwe, Founder of DAAICF",
  description:
    "Profile for Dr Andrew, Dr. Andrew A. Igwe, founder and sole financer of DAAICF, the Dr. Andrew A. Igwe Care Foundation in Nigeria.",
  path: "/about/dr-andrew-igwe",
  keywords: [
    "Dr Andrew",
    "Dr Andrew A",
    "Dr Andrew Igwe",
    "Dr Andrew A Igwe",
    "Dr. Andrew A. Igwe biography",
    "founder of DAAICF",
  ],
});

const credentials = ["FISPN", "FECRMI", "FIMC", "CMC", "MNES"];

export default function FounderProfilePage() {
  const yearsOfImpact = new Date().getFullYear() - FOUNDATION_OPERATING_YEAR;
  const founderJsonLd = buildFounderJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(founderJsonLd)}
      />

      <PageHero
        eyebrow="Founder Profile"
        title={FOUNDER_NAME}
        description={`Founder and sole financer of ${SITE_NAME}, also known as ${SITE_ACRONYM}.`}
        contentClassName="max-w-5xl"
      />

      <section className="site-section bg-white">
        <div className="site-container grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div data-reveal="right" className="overflow-hidden rounded-[24px] shadow-soft">
            <Image
              src={aboutUsImage}
              alt={`${FOUNDER_NAME}, founder of ${SITE_ACRONYM}`}
              className="w-full object-cover"
              priority
            />
          </div>

          <div data-reveal="left">
            <p className="section-eyebrow">Dr Andrew Igwe</p>
            <h2 className="serif-display mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl md:text-5xl">
              {FOUNDER_NAME}, {credentials.join(", ")}
            </h2>
            <p className="mt-4 text-lg font-semibold text-[var(--color-text)] md:text-xl">
              Founder & Sole Financer - {SITE_NAME}
            </p>
            <p className="mt-2 text-base muted-copy md:text-lg">
              Also written as {founderAliases.slice(0, 3).join(", ")}.
            </p>

            <div className="mt-8 space-y-6 text-base leading-8 muted-copy md:text-lg">
              <p>
                Dr. Andrew A. Igwe is an environmental professional,
                philanthropist, and interpersonal-relationship expert whose work
                connects technical leadership with practical humanitarian service.
              </p>
              <p>
                Through {SITE_NAME}, he has supported vulnerable populations for
                more than {yearsOfImpact} years, with initiatives across
                scholarships, healthcare support, entrepreneurship, infrastructure,
                relief, and community service.
              </p>
              <p>
                His public service through {SITE_ACRONYM} is guided by compassion,
                sustainability, and empowerment, with a focus on helping
                underserved communities build more resilient futures.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/about">
                About the Foundation
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/activities" variant="surface">
                View Activities
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section bg-[var(--color-bg)]">
        <div className="site-container max-w-4xl">
          <p className="section-eyebrow">Foundation Connection</p>
          <h2 className="serif-display mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            The name behind DAAICF
          </h2>
          <div className="mt-7 space-y-5 text-base leading-8 muted-copy md:text-lg">
            <p>
              {SITE_ACRONYM} stands for {SITE_NAME}. The foundation carries Dr.
              Andrew Igwe&apos;s name because its work reflects his personal
              commitment to education, healthcare, empowerment, and humane support
              for communities across Nigeria.
            </p>
            <p>
              Visitors looking for Dr Andrew, Dr Andrew A, Dr Andrew Igwe, Dr
              Andrew A Igwe, or the Dr. Andrew A. Igwe Care Foundation can use
              this official profile as the direct reference page for the founder.
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-7 inline-flex items-center gap-2 text-base font-semibold text-[var(--color-primary)]"
          >
            Contact the foundation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
