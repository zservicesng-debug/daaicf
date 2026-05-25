import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Heart,
  HeartHandshake,
  Stethoscope,
} from "lucide-react";
import slide1 from "@/assets/slide1.jpg";
import slide2 from "@/assets/slide2.jpg";
import slide3 from "@/assets/slide3.jpg";
import slide4 from "@/assets/slide4.jpg";
import slide5 from "@/assets/slide5.jpg";
import slide6 from "@/assets/slide6.jpg";
import { PostCard } from "@/components/public/post-card";
import { AnimatedCount } from "@/components/ui/animated-count";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FOUNDATION_MOTTO,
  FOUNDATION_OPERATING_YEAR,
  FOUNDATION_REGISTERED_YEAR,
} from "@/lib/foundation";
import { getStore, listPosts } from "@/lib/store";

const values = [
  {
    title: "Compassion",
    body: "We lead with empathy and keep human dignity at the center of every intervention.",
    icon: Heart,
  },
  {
    title: "Education",
    body: "We open doors through scholarships, school support, and practical learning pathways.",
    icon: BookOpen,
  },
  {
    title: "Healthcare",
    body: "We bring access to screenings, treatment support, and health outreach where it is needed.",
    icon: Stethoscope,
  },
  {
    title: "Empowerment",
    body: "We equip families and communities with skills, resources, and long-term support.",
    icon: HeartHandshake,
  },
];

const heroSlides = [slide1, slide2, slide3, slide4, slide5, slide6];

export default async function HomePage() {
  const { settings } = await getStore();
  const featuredPosts = (await listPosts({ publishedOnly: true, perPage: 2 })).items;
  const serviceYears = Math.max(
    settings.impact.yearsOfService,
    new Date().getFullYear() - FOUNDATION_OPERATING_YEAR
  );

  const impactStats = [
    {
      label: "Communities reached",
      value: settings.impact.communitiesReached,
      suffix: "+",
    },
    {
      label: "Beneficiaries supported",
      value: settings.impact.beneficiariesSupported,
      suffix: "+",
    },
    {
      label: "Events held",
      value: settings.impact.eventsHeld,
      suffix: "+",
    },
    {
      label: "Years of service",
      value: serviceYears,
      suffix: "",
    },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[var(--color-primary)] text-white">
        <div className="hero-slideshow absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.src}
              className="hero-slide"
              style={{ animationDelay: `${index * 8}s` }}
            >
              <Image
                src={slide}
                alt=""
                fill
                priority={index === 0}
                placeholder={index === 0 ? "blur" : "empty"}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>
        <div className="hero-tint-overlay absolute inset-0" />
        <div className="absolute inset-0 grain-overlay opacity-42" />
        <div className="hero-orb hero-orb-delay absolute right-10 top-16 h-56 w-56 rounded-full bg-[rgba(196,30,30,0.18)] blur-3xl" />

        <div className="site-container relative z-10 flex min-h-[calc(100vh-84px)] items-center justify-center py-16 md:py-20">
          <div className="hero-stack max-w-4xl text-center">
            <div className="mx-auto flex w-fit flex-col items-center rounded-[28px] border border-white/18 bg-[rgba(7,20,10,0.22)] px-6 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:px-8">
              <span className="serif-display mt-2 text-3xl font-bold tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:text-4xl xl:text-[3.25rem]">
                {FOUNDATION_MOTTO}
              </span>
              <span className="mt-2 text-[11px] font-semibold tracking-[0.3em] text-white/82 uppercase sm:text-xs">
                Since {FOUNDATION_OPERATING_YEAR}
              </span>
            </div>
            <h1 className="serif-display mx-auto mt-6 max-w-5xl text-4xl font-bold tracking-tight text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] sm:text-5xl xl:text-6xl">
              Dr. Andrew A. Igwe Care Foundation
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/92 drop-shadow-[0_8px_24px_rgba(0,0,0,0.38)] sm:text-lg md:text-xl md:leading-9">
              Practical care through education, healthcare, infrastructure, and
              empowerment for communities across Nigeria.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <ButtonLink href="/activities" variant="primary" className="sm:min-w-44">
                Explore Our Work
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/apply" variant="outline" className="sm:min-w-44">
                Request Support
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <p className="mx-auto mt-6 text-sm font-medium text-white/76">
              Registered in {FOUNDATION_REGISTERED_YEAR} · RC {settings.organization.rcNumber}
            </p>
          </div>
        </div>

        <div className="scroll-cue absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
          <span className="text-[10px] tracking-[0.26em] text-white/55">SCROLL</span>
          <span className="h-12 w-px bg-white/22" />
        </div>
      </section>

      <section className="site-section bg-white">
        <div className="site-container grid gap-12 lg:grid-cols-[0.98fr_1.02fr] lg:items-start">
          <div data-reveal="right">
            <p className="section-eyebrow">Our Mission</p>
            <h2 className="serif-display mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl md:text-5xl">
              Uplifting communities with care that is practical, local, and lasting.
            </h2>
            <div className="mt-7 max-w-2xl space-y-5 text-base leading-8 text-[var(--color-text-muted)] md:text-lg">
              <p>
                DAAICF is a non-governmental, not-for-profit organisation focused on
                improving the quality of life of underprivileged individuals and
                communities across Nigeria.
              </p>
              <p>
                Guided by our motto, {FOUNDATION_MOTTO.toLowerCase()}, we work
                through strategic interventions in education, healthcare,
                infrastructure, food relief, and economic empowerment so support
                reaches the people who need it most.
              </p>
            </div>
            <Link
              href="/about"
              className="mt-7 inline-flex items-center gap-2 text-base font-semibold text-[var(--color-primary)]"
            >
              Learn more about the foundation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div data-reveal-group className="grid gap-5 sm:grid-cols-2">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="relative overflow-hidden bg-[var(--color-surface-muted)] p-6 pl-7 sm:pl-6"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-5 left-0 top-5 w-px bg-gradient-to-b from-transparent via-[rgba(42,122,58,0.95)] to-transparent shadow-[0_0_16px_rgba(42,122,58,0.55)] sm:hidden"
                  />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="serif-display mt-5 text-2xl font-semibold text-[var(--color-text)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 muted-copy">{item.body}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="site-section bg-[var(--color-primary)] text-white">
        <div className="site-container">
          <div data-reveal="fade" className="max-w-3xl">
            <p className="section-eyebrow text-white/58">Our Impact</p>
            <h2 className="serif-display mt-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Measured by real people reached, not just promises made.
            </h2>
          </div>

          <div data-reveal-group className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {impactStats.map((item) => (
              <div
                key={item.label}
                data-reveal="up"
                className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6"
              >
                <p className="serif-display text-3xl font-bold text-white sm:text-4xl">
                  <AnimatedCount value={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-3 text-xs leading-5 text-white/70 sm:text-sm">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section bg-[var(--color-bg)]">
        <div className="site-container">
          <div
            data-reveal="fade"
            className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
          >
            <div>
              <p className="section-eyebrow">Featured Updates</p>
              <h2 className="serif-display mt-3 text-3xl font-bold text-[var(--color-text)] sm:text-4xl md:text-5xl">
                Recent Activities
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 muted-copy md:text-base">
                A lighter snapshot of the latest outreach work. Visit the activities
                page for the full archive and discussion.
              </p>
            </div>
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 text-base font-semibold text-[var(--color-primary)]"
            >
              View all activities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredPosts.length > 0 ? (
            <div data-reveal-group className="grid gap-6 lg:grid-cols-2">
              {featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <h3 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                New activities will appear here soon
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 muted-copy">
                Check back for the latest foundation updates as new activities are
                published.
              </p>
            </Card>
          )}
        </div>
      </section>

      <section className="site-section bg-white">
        <div className="site-container">
          <div
            data-reveal="up"
            className="overflow-hidden rounded-[32px] bg-[var(--color-primary)] px-6 py-10 text-white shadow-soft sm:px-10 md:px-12"
          >
            <p className="section-eyebrow text-white/58">Join the Movement</p>
            <h2 className="serif-display mt-4 max-w-3xl text-3xl font-bold sm:text-4xl md:text-5xl">
              Ready to support the mission or ask for help?
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/74 md:text-lg">
              Whether you want to sponsor a sector or project, partner with us,
              volunteer, or reach out for assistance, we are ready to listen and
              connect you to the next step.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/apply/sponsor" variant="primary">
                Become a Sponsor
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/apply/partner" variant="outline">
                Partner with Us
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/74 sm:flex-row sm:items-center">
              <Link href="/apply" className="font-semibold text-white">
                Apply for assistance
              </Link>
              <span className="hidden text-white/35 sm:inline">/</span>
              <Link href="/contact" className="font-semibold text-white">
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
