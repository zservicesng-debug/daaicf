import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
    </div>
  );
}
