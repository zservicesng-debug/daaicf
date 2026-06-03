import Image from "next/image";
import { ArrowRight } from "lucide-react";
import aboutUsImage from "@/assets/about-us.jpeg";
import { PageHero } from "@/components/public/page-hero";
import { ButtonLink } from "@/components/ui/button";
import {
  FOUNDATION_MOTTO,
  FOUNDATION_OPERATING_YEAR,
  FOUNDATION_REGISTERED_YEAR,
} from "@/lib/foundation";
import { getStore } from "@/lib/store";

export default async function AboutPage() {
  const { settings } = await getStore();
  const yearsOfImpact = new Date().getFullYear() - FOUNDATION_OPERATING_YEAR;

  return (
    <>
      <PageHero
        eyebrow="Who We Are"
        title="About DAAICF"
        description={`We are a Non Governmental Organization (NGO) Established in 2009, Registered with Corporate Affairs Commission (CAC) with the mission of caring for humanity by rendering humanitarian services to the community and ensuring poverty reduction through: Educational Support, Infrastructural Development , Skill Acquisition Entrepreneurship Empowerment, Health Care Support and Community Service.`}
        contentClassName="max-w-5xl"
        descriptionClassName="max-w-4xl xl:max-w-5xl"
      />

      <section className="site-section bg-white">
        <div className="site-container grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div data-reveal="right" className="overflow-hidden rounded-[24px] shadow-soft">
            <Image
              src={aboutUsImage}
              alt="Dr. Andrew A. Igwe"
              className="w-full object-cover"
            />
          </div>
          <div data-reveal="left">
            <p className="section-eyebrow">The Founder</p>
            <h2 className="serif-display mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl md:text-5xl">
              Dr. Andrew A. Igwe, FISPN, FECRMI, FIMC, CMC, MNES
            </h2>
            <p className="mt-3 text-base muted-copy md:text-lg">
              Founder & Sole Financer - Dr. Andrew A. Igwe Care Foundation
            </p>
            <p className="mt-2 text-base muted-copy md:text-lg">
              Environmentalist | Philanthropist | Interpersonal-Relationship Expert
            </p>
            <div className="mt-8 space-y-6 text-base leading-8 muted-copy md:text-lg">
              <p>
                Dr. Andrew A. Igwe is a humble, kind-hearted environmental
                professional, philanthropist, and interpersonal-relationship expert.
                Holding a PhD in Environmental Management and more than 20 years of
                experience in onshore and offshore operational safety, he has devoted
                his career to creating positive impact through both technical
                expertise and community service.
              </p>
              <p>
                Through the Dr. Andrew A. Igwe Care Foundation, he has spent the
                past {yearsOfImpact} years empowering vulnerable populations. His
                initiatives include:
              </p>
              <ul className="list-disc space-y-3 pl-5">
                <li>Scholarships for students</li>
                <li>Entrepreneurship programs for widows and orphans</li>
                <li>Infrastructural projects such as portable water systems and street lighting</li>
                <li>Provision of study materials (textbooks, bags, etc.)</li>
              </ul>
              <p>
                Dr. Igwe&apos;s core values are compassion, sustainability, and
                empowerment. He believes that lasting change is achieved by
                uplifting individuals and building resilient communities, and he
                continues to inspire others to join him in making a meaningful
                difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section bg-[var(--color-bg)] text-center">
        <div data-reveal="up" className="site-container max-w-4xl">
          <p className="section-eyebrow">Our Story</p>
          <h2 className="serif-display mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl md:text-5xl">
            {FOUNDATION_MOTTO}
          </h2>
          <blockquote className="serif-display mt-8 text-2xl italic leading-[1.5] text-[var(--color-primary)] sm:text-3xl md:text-4xl">
            &quot;Lasting change is achieved by uplifting individuals and building
            resilient communities.&quot;
          </blockquote>
          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 muted-copy md:text-lg">
            The foundation began operating in {FOUNDATION_OPERATING_YEAR} and was
            officially registered in {FOUNDATION_REGISTERED_YEAR} (RC:{" "}
            {settings.organization.rcNumber}).
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 muted-copy md:text-lg">
            Since then, DAAICF has continued to serve communities across education,
            healthcare, infrastructure, relief, and empowerment, reaching over{" "}
            {settings.impact.beneficiariesSupported.toLocaleString()} beneficiaries.
          </p>
        </div>
      </section>

      <section className="site-section bg-white">
        <div className="site-container">
          <div
            data-reveal="up"
            className="overflow-hidden rounded-[34px] border border-[var(--color-border)] bg-[linear-gradient(135deg,#f7faf5_0%,#ecf3e9_46%,#ffffff_100%)] p-6 shadow-soft sm:p-8 lg:p-10"
          >
            <div className="max-w-3xl">
              <p className="section-eyebrow">The Team</p>
              <h2 className="serif-display mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl md:text-5xl">
                Meet the people carrying the mission forward
              </h2>
              <p className="mt-6 text-base leading-8 muted-copy md:text-lg">
                Behind DAAICF&apos;s outreach, scholarships, infrastructure support,
                and community response is a team committed to practical service,
                accountability, and humane leadership.
              </p>
              <p className="mt-4 text-base leading-8 muted-copy md:text-lg">
                Explore the full members page to see who is helping shape the
                foundation&apos;s impact across programmes and partnerships.
              </p>
              <ButtonLink
                href="/about/team"
                className="mt-8 rounded-[var(--radius-card)]"
              >
                View the Team
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
