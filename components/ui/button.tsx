import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "surface" | "danger";

export function buttonClasses({
  variant = "primary",
  fullWidth = false,
}: {
  variant?: Variant;
  fullWidth?: boolean;
}) {
  return cn(
    "touch-target inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
    fullWidth && "w-full",
    {
      "bg-[var(--color-accent)] text-white hover:bg-[#aa1818]":
        variant === "primary",
      "border border-white/45 bg-transparent text-white hover:bg-white/10":
        variant === "outline",
      "text-[var(--color-primary)] hover:text-[var(--color-primary-soft)]":
        variant === "ghost",
      "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[rgba(26,92,42,0.22)] hover:bg-[var(--color-surface-muted)]":
        variant === "surface",
      "border border-[#efb3b3] bg-white text-[#a12626] hover:bg-[#fff5f5]":
        variant === "danger",
    }
  );
}

export function ButtonLink({
  href,
  children,
  variant,
  className,
  fullWidth,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(buttonClasses({ variant, fullWidth }), className)}
    >
      {children}
    </Link>
  );
}
