import { SponsorApplicationForm } from "@/components/public/sponsor-application-form";
import { PageHero } from "@/components/public/page-hero";
import { listProjects } from "@/lib/store";

export default async function SponsorApplyPage() {
  const projects = await listProjects();

  return (
    <>
      <PageHero
        eyebrow="Support Our Cause"
        title="Become a Sponsor"
        description="Support the foundation generally, focus on a particular sector, or back specific active projects that strengthen underserved communities."
      />
      <section className="site-section bg-white">
        <div className="site-container">
          <div className="mx-auto max-w-3xl card-surface p-6 md:p-8">
            <SponsorApplicationForm projects={projects} />
          </div>
        </div>
      </section>
    </>
  );
}

