import Image from "next/image";
import logoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[16px] border bg-white",
          compact ? "h-12 w-12" : "h-12 w-12 sm:h-14 sm:w-14",
          inverse
            ? "border-white/18 shadow-[0_12px_30px_rgba(8,22,10,0.18)]"
            : "border-[rgba(26,92,42,0.14)] shadow-[0_10px_24px_rgba(18,61,28,0.08)]"
        )}
      >
        <Image
          src={logoImage}
          alt="Dr. Andrew A. Igwe Care Foundation logo"
          fill
          sizes={compact ? "48px" : "56px"}
          className="object-cover"
        />
      </div>
      <div className="leading-tight">
        <p
          className={cn(
            "font-semibold tracking-tight",
            compact ? "text-base" : "text-[15px]",
            inverse ? "text-white" : "text-[var(--color-text)]"
          )}
        >
          {compact ? "DAAICF" : "Dr. Andrew A. Igwe"}
        </p>
        <p
          className={cn(
            "text-[10px] uppercase tracking-[0.2em]",
            inverse ? "text-white/75" : "text-[var(--color-text-muted)]"
          )}
        >
          {compact ? "Care Foundation" : "Care Foundation"}
        </p>
      </div>
    </div>
  );
}
