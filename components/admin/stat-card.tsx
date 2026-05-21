import Link from "next/link";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
  href?: string;
}) {
  const content = (
    <Card className="h-full p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(8,22,10,0.08)] sm:p-5">
      <div className={`mb-4 inline-flex rounded-2xl p-3 ${tone}`}>{icon}</div>
      <p className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">{value}</p>
      <p className="mt-2 text-sm muted-copy">{label}</p>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
