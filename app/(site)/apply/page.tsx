import { CircleAlert } from "lucide-react";
import { submitHelpApplication } from "@/app/_actions/public";
import { PageHero } from "@/components/public/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export default function ApplyPage() {
  return (
    <>
      <PageHero
        eyebrow="We're Here To Help"
        title="Apply for Help"
        description="Fill in the form below and our team will review your application with care and confidentiality."
      />

      <section className="site-section bg-white">
        <div className="site-container space-y-8">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                Need Help?
              </p>
              <h2 className="serif-display mt-3 text-2xl font-semibold text-[var(--color-text)]">
                Apply for assistance
              </h2>
              <p className="mt-3 text-sm leading-7 muted-copy">
                Use the form below if you are requesting support from the foundation.
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                Sponsor
              </p>
              <h2 className="serif-display mt-3 text-2xl font-semibold text-[var(--color-text)]">
                Fund the mission
              </h2>
              <p className="mt-3 text-sm leading-7 muted-copy">
                Sponsor generally, support a specific sector, or back selected active projects.
              </p>
              <div className="mt-5">
                <ButtonLink href="/apply/sponsor" variant="surface">
                  Become a Sponsor
                </ButtonLink>
              </div>
            </Card>
            <Card className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                Partner
              </p>
              <h2 className="serif-display mt-3 text-2xl font-semibold text-[var(--color-text)]">
                Collaborate with us
              </h2>
              <p className="mt-3 text-sm leading-7 muted-copy">
                Share programmes, resources, expertise, or strategic support with the foundation.
              </p>
              <div className="mt-5">
                <ButtonLink href="/apply/partner" variant="surface">
                  Partner with Us
                </ButtonLink>
              </div>
            </Card>
          </div>

          <div className="mx-auto max-w-2xl card-surface p-6 md:p-8">
            <form
              action={submitHelpApplication}
              className="space-y-5"
              data-submit-toast-title="Submitting help application"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Full Name *</label>
                  <TextInput name="name" placeholder="e.g. Chukwuemeka Obi" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Phone Number *</label>
                  <TextInput name="phone" placeholder="+234 800 000 0000" required />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Location *</label>
                <TextInput
                  name="location"
                  placeholder="e.g. Owerri North, Imo State"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Type of Help Needed *
                </label>
                <SelectInput name="helpType" defaultValue="" required>
                  <option value="" disabled>
                    Select a category...
                  </option>
                  <option value="Education">Education</option>
                  <option value="Medical">Medical</option>
                  <option value="Food/Relief">Food/Relief</option>
                  <option value="Empowerment">Empowerment</option>
                  <option value="Other">Other</option>
                </SelectInput>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Description of Need *</label>
                <TextArea
                  name="description"
                  placeholder="Please describe your situation and what assistance you need..."
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  How did you hear about us?{" "}
                  <span className="font-normal muted-copy">(optional)</span>
                </label>
                <TextInput name="howHeard" placeholder="e.g. Facebook, friend, radio" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Picture Evidence <span className="font-normal muted-copy">(optional)</span>
                </label>
                <TextInput name="evidenceImages" type="file" accept="image/*" multiple />
                <p className="mt-2 text-sm muted-copy">
                  You can upload more than one image if it helps explain your situation.
                </p>
              </div>

              <div className="rounded-[var(--radius-card)] border border-[#cde5d2] bg-[#eef8f0] p-4 text-sm text-[var(--color-text-muted)]">
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 h-4 w-4 text-[var(--color-primary)]" />
                  <p>
                    Your information is kept strictly confidential and will only be used
                    to process your application. We do not share personal data with
                    third parties.
                  </p>
                </div>
              </div>

              <SubmitButton>Submit Application</SubmitButton>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
