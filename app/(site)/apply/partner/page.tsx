import { PartnerApplicationForm } from "@/components/public/partner-application-form";
import { PageHero } from "@/components/public/page-hero";

export default function PartnerApplyPage() {
  return (
    <>
      <PageHero
        eyebrow="Collaborate With Us"
        title="Partner with Us"
        description="Join us in expanding health outreach, education, relief, and empowerment across Nigeria."
      />
      <section className="site-section bg-white">
        <div className="site-container">
          <div className="mx-auto max-w-3xl card-surface p-6 md:p-8">
            <PartnerApplicationForm />
          </div>
        </div>
      </section>
    </>
  );
}
