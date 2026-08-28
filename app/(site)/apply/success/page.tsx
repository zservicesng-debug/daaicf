import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ApplySuccessPage(
  props: PageProps<"/apply/success">
) {
  const settings = await getSettings();
  if (!settings.features.helpApplicationsEnabled) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const name = (searchParams.name as string) || "Applicant";

  return (
    <section className="site-section bg-site-gradient min-h-[70vh]">
      <div className="site-container flex justify-center">
        <Card className="max-w-2xl p-8 text-center md:p-12">
          <p className="section-eyebrow">Thank You</p>
          <h1 className="serif-display mt-4 text-4xl font-bold text-[var(--color-text)] md:text-5xl">
            Application received
          </h1>
          <p className="mt-5 text-lg leading-8 muted-copy">
            Thank you, <span className="font-semibold text-[var(--color-text)]">{name}</span>.
            Our team has received your request and will review it carefully.
          </p>
          <p className="mt-4 text-lg leading-8 muted-copy">
            Please allow 5–7 business days for a response. If we need more
            information, we’ll reach out using the contact details you provided.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
          >
            Return Home →
          </Link>
        </Card>
      </div>
    </section>
  );
}
