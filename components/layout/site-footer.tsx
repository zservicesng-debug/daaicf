import Link from "next/link";
import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import {
  FOUNDATION_OPERATING_YEAR,
  FOUNDATION_REGISTERED_YEAR,
} from "@/lib/foundation";
import { getSocialLinks } from "@/lib/social";
import { getSettings } from "@/lib/store";

export async function SiteFooter() {
  const settings = await getSettings();
  const currentYear = new Date().getFullYear();
  const socialLinks = getSocialLinks(settings.contact);

  return (
    <footer className="bg-[var(--color-primary)] py-16 text-white">
      <div data-reveal-group className="site-container space-y-10">
        <div data-reveal="up" className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4 text-center md:text-left">
            <BrandMark inverse />
            <p className="text-sm italic text-white/78">
              {settings.organization.tagline}
            </p>
            <p className="text-sm text-white/70">
              RC: {settings.organization.rcNumber}
            </p>
            <p className="text-sm text-white/70">
              Operating since {FOUNDATION_OPERATING_YEAR} | Registered in{" "}
              {FOUNDATION_REGISTERED_YEAR}
            </p>
            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm md:justify-start">
                <Globe2 className="h-4 w-4 text-white/70" />
                <span className="font-semibold text-white/78">Follow us:</span>
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/22 px-3 py-1 font-semibold text-white/90 underline underline-offset-4 transition hover:border-white/50 hover:bg-white/10 hover:text-white"
                    aria-label={`Open DAAICF ${item.label} page`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="text-center md:text-left">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              Quick Links
            </p>
            <div className="grid gap-3 text-sm text-white/82">
              <Link href="/">Home</Link>
              <Link href="/activities">Activities</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/about">About</Link>
              <Link href="/apply/sponsor">Become a Sponsor</Link>
              <Link href="/apply/partner">Partner with Us</Link>
              {settings.features.helpApplicationsEnabled ? (
                <Link href="/apply">Apply for Help</Link>
              ) : null}
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div className="text-center md:text-left">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              Contact Us
            </p>
            <div className="space-y-3 text-sm text-white/82">
              <p className="flex items-center justify-center gap-2 md:justify-start">
                <MapPin className="h-4 w-4" />
                {settings.contact.address}
              </p>
              <p className="flex items-center justify-center gap-2 md:justify-start">
                <Phone className="h-4 w-4" />
                {settings.contact.phone}
              </p>
              <p className="flex items-center justify-center gap-2 md:justify-start">
                <Mail className="h-4 w-4" />
                {settings.contact.email}
              </p>
            </div>
          </div>
        </div>

        <div
          data-reveal="fade"
          className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center text-xs text-white/58 md:flex-row md:text-left"
        >
          <p>
            Copyright {currentYear} Dr. Andrew A. Igwe Care Foundation. All rights
            reserved. RC: {settings.organization.rcNumber}
          </p>
          <div className="flex items-center gap-4">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Use</Link>
          </div>
        </div>


      </div>
    </footer>
  );
}
