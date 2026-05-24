import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FOUNDATION_OPERATING_YEAR } from "@/lib/foundation";
import { getStore } from "@/lib/store";

function TeamPortrait({
  name,
  initials,
  imageUrl,
  className,
}: {
  name: string;
  initials: string;
  imageUrl?: string | null;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden bg-[radial-gradient(circle_at_top,rgba(26,92,42,0.18),transparent_48%),linear-gradient(180deg,#eef3eb_0%,#d9e6d7_100%)] ${className || ""}`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--color-primary)] text-3xl font-semibold text-white shadow-[0_20px_50px_rgba(18,61,28,0.24)]">
            {initials}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function TeamPage() {
  const { teamMembers, settings } = await getStore();
  const featuredMembers = teamMembers.filter((member) => member.isFeatured);
  const leadMember = featuredMembers[0] || null;
  const otherMembers = leadMember
    ? teamMembers.filter((member) => member.id !== leadMember.id)
    : teamMembers;

  return (
    <>
      <PageHero
        eyebrow="Leadership & Service"
        title="Meet the DAAICF Team"
        description="Behind every scholarship, outreach, relief intervention, and community project is a team committed to compassionate service, thoughtful leadership, and practical impact."
        contentClassName="max-w-5xl"
        descriptionClassName="max-w-4xl xl:max-w-5xl"
      />

      <section className="site-section bg-white">
        <div className="site-container grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          {leadMember ? (
            <div
              data-reveal="left"
              className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(140deg,#103f1d_0%,#1a5c2a_54%,#236d35_100%)] text-white shadow-[0_28px_70px_rgba(18,61,28,0.22)]"
            >
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.82fr_1.18fr] lg:p-10">
                <TeamPortrait
                  name={leadMember.name}
                  initials={leadMember.initials}
                  imageUrl={leadMember.imageUrl}
                  className="aspect-[4/5] rounded-[26px] border border-white/12"
                />
                <div className="flex flex-col justify-center">
                  <p className="section-eyebrow text-white/70">Featured Profile</p>
                  <h2 className="serif-display mt-4 text-3xl font-bold sm:text-4xl">
                    {leadMember.name}
                  </h2>
                  <p className="mt-3 text-sm font-semibold tracking-[0.1em] text-white/78 uppercase">
                    {leadMember.role}
                  </p>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
                    {leadMember.description}
                  </p>
                  <div className="mt-8 inline-flex w-fit rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm text-white/78">
                    Serving communities since {FOUNDATION_OPERATING_YEAR}
                  </div>
                </div>
              </div>
            </div>
          ) : teamMembers.length > 0 ? (
            <Card className="p-8 sm:p-10">
              <p className="section-eyebrow">Leadership Circle</p>
              <h2 className="serif-display mt-4 text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
                Every member profile below is managed directly from the team directory
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 muted-copy md:text-lg">
                A featured profile can be highlighted here at any time. Until then,
                the full directory below remains the main public view of the team.
              </p>
            </Card>
          ) : (
            <Card className="p-8">
              <h2 className="serif-display text-3xl font-semibold text-[var(--color-text)]">
                Team profiles are coming soon
              </h2>
              <p className="mt-3 max-w-2xl muted-copy">
                The foundation team will appear here once their public profiles are
                added from the admin portal.
              </p>
            </Card>
          )}

          <div data-reveal="right" className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <Card className="p-6">
              <p className="section-eyebrow">People</p>
              <p className="serif-display mt-4 text-4xl font-bold text-[var(--color-text)]">
                {teamMembers.length}
              </p>
              <p className="mt-3 text-sm leading-7 muted-copy">
                Team members publicly representing the foundation&apos;s work and
                leadership.
              </p>
            </Card>
            <Card className="p-6">
              <p className="section-eyebrow">Impact</p>
              <p className="serif-display mt-4 text-4xl font-bold text-[var(--color-text)]">
                {settings.impact.beneficiariesSupported.toLocaleString()}+
              </p>
              <p className="mt-3 text-sm leading-7 muted-copy">
                Beneficiaries supported through healthcare, education, relief, and
                empowerment programmes.
              </p>
            </Card>
            <Card className="p-6">
              <p className="section-eyebrow">Work With Us</p>
              <p className="mt-4 text-base leading-8 muted-copy">
                Interested in partnering, sponsoring, or volunteering with the
                foundation? Let&apos;s build meaningful impact together.
              </p>
              <ButtonLink
                href="/contact"
                variant="surface"
                className="mt-6 rounded-[var(--radius-card)]"
              >
                Contact the Foundation
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </Card>
          </div>
        </div>
      </section>

      <section className="site-section bg-[var(--color-bg)]">
        <div className="site-container">
          <div data-reveal="up" className="max-w-3xl">
            <p className="section-eyebrow">Our People</p>
            <h2 className="serif-display mt-4 text-3xl font-bold text-[var(--color-text)] sm:text-4xl md:text-5xl">
              A team shaped by compassion, structure, and follow-through
            </h2>
            <p className="mt-5 text-base leading-8 muted-copy md:text-lg">
              DAAICF brings together leaders, programme coordinators, and service
              professionals who help turn vision into practical help for families
              and communities.
            </p>
          </div>

          {otherMembers.length > 0 ? (
            <div data-reveal-group className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {otherMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <TeamPortrait
                    name={member.name}
                    initials={member.initials}
                    imageUrl={member.imageUrl}
                    className="aspect-[4/4.6]"
                  />
                  <div className="space-y-3 p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                          {member.name}
                        </h3>
                        {member.isFeatured ? (
                          <span className="rounded-full bg-[rgba(26,92,42,0.1)] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--color-primary)] uppercase">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm font-semibold tracking-[0.08em] text-[var(--color-accent)] uppercase">
                        {member.role}
                      </p>
                    </div>
                    <p className="text-sm leading-7 muted-copy">{member.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : leadMember ? (
            <Card className="mt-12 p-8">
              <p className="text-base leading-8 muted-copy">
                Additional team profiles can be added from the admin portal as the
                public directory grows.
              </p>
            </Card>
          ) : null}
        </div>
      </section>
    </>
  );
}
