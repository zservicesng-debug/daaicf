export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[var(--color-bg)]">{children}</div>;
}
