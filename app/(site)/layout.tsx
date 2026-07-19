import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { buildSiteJsonLd, jsonLdScript } from "@/lib/seo";
import { getSettings } from "@/lib/store";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteJsonLd = buildSiteJsonLd();
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(siteJsonLd)}
      />
      <SiteNavbar helpApplicationsEnabled={settings.features.helpApplicationsEnabled} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
    </div>
  );
}
