import Link from "next/link";
import { cn } from "@/lib/utils";

function buildHref(
  pathname: string,
  category: string,
  page?: number,
  paramName = "category"
) {
  const params = new URLSearchParams();
  if (category !== "All") {
    params.set(paramName, category);
  }
  if (page && page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function CategoryFilter({
  pathname,
  categories,
  active,
  paramName,
}: {
  pathname: string;
  categories: string[];
  active: string;
  paramName?: string;
}) {
  return (
    <div data-reveal="fade" className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const isCurrent = category === active;
        return (
          <Link
            key={category}
            href={buildHref(pathname, category, 1, paramName)}
            className={cn(
              "rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium motion-safe:hover:-translate-y-0.5",
              isCurrent
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[rgba(26,92,42,0.22)] hover:text-[var(--color-primary)]"
            )}
          >
            {category}
          </Link>
        );
      })}
    </div>
  );
}
