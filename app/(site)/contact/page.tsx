import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { ContactForm } from "@/components/public/contact-form";
import { Card } from "@/components/ui/card";
import {
  FOUNDATION_OPERATING_YEAR,
  FOUNDATION_REGISTERED_YEAR,
} from "@/lib/foundation";
import { getSocialLinks } from "@/lib/social";
import { getStore } from "@/lib/store";

export default async function ContactPage() {
  const { settings } = await getStore();
  const socialLinks = getSocialLinks(settings.contact);

  return (
    <>
      <PageHero
        eyebrow="Reach Out"
        title="Contact Us"
        description="We would love to hear from you. Reach out for enquiries, partnerships, or to share your story."
      />

      <section className="site-section bg-white">
        <div className="site-container grid gap-8 lg:grid-cols-2">
          <div data-reveal="right" className="space-y-6">
            <h2 className="serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              Get in touch
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <span className="rounded-2xl bg-[var(--color-surface-muted)] p-3 text-[var(--color-primary)]">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-[var(--color-text)]">Address</p>
                  <p className="muted-copy">{settings.contact.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="rounded-2xl bg-[var(--color-surface-muted)] p-3 text-[var(--color-primary)]">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-[var(--color-text)]">Phone</p>
                  <p className="muted-copy">{settings.contact.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="rounded-2xl bg-[var(--color-surface-muted)] p-3 text-[var(--color-primary)]">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-[var(--color-text)]">Email</p>
                  <p className="muted-copy">{settings.contact.email}</p>
                </div>
              </div>
              {socialLinks.length > 0 ? (
                <div className="flex items-start gap-4">
                  <span className="rounded-2xl bg-[var(--color-surface-muted)] p-3 text-[var(--color-primary)]">
                    <Globe2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--color-text)]">Social Media</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {socialLinks.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="text-sm muted-copy hover:text-[var(--color-primary)]"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <Card className="border-[#d8ebdc] bg-[#f8fcf9] p-6">
              <p className="font-semibold text-[var(--color-primary)]">
                RC: {settings.organization.rcNumber}
              </p>
              <p className="mt-2 text-sm leading-7 muted-copy">
                Dr. Andrew A. Igwe Care Foundation has been operating since{" "}
                {FOUNDATION_OPERATING_YEAR} and was officially registered in{" "}
                {FOUNDATION_REGISTERED_YEAR} in the Federal Republic of Nigeria.
              </p>
            </Card>
          </div>

          <Card className="p-6 md:p-8">
            <ContactForm />
          </Card>
        </div>
      </section>
    </>
  );
}
