import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { buildSiteJsonLd, jsonLdScript } from "@/lib/seo";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteJsonLd = buildSiteJsonLd();

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(siteJsonLd)}
      />
      <SiteNavbar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
    </div>
  );
}
