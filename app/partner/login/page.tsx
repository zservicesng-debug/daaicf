import Link from "next/link";
import { Lock } from "lucide-react";
import { PortalLoginForm } from "@/components/portal/login-form";
import { Card } from "@/components/ui/card";

export default async function PartnerLoginPage(props: PageProps<"/partner/login">) {
  const searchParams = await props.searchParams;
  const redirectTo = searchParams.redirectTo as string | undefined;

  return (
    <section className="bg-site-gradient flex min-h-screen items-center py-16">
      <div className="site-container flex justify-center">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="serif-display mt-5 text-4xl font-bold text-[var(--color-text)]">
            Partner Portal
          </h1>
          <p className="mt-2 muted-copy">Shared visibility and collaboration tools</p>

          <Card className="mt-8 p-6 text-left md:p-8">
            <PortalLoginForm role="partner" redirectTo={redirectTo} />
          </Card>

          <Link href="/" className="mt-6 inline-block text-sm muted-copy">
            Back to website
          </Link>
        </div>
      </div>
    </section>
  );
}
