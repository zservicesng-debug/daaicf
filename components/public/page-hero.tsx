import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  contentClassName,
  descriptionClassName,
}: {
  eyebrow: string;
  title: string;
  description: string;
  contentClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <section className="page-hero">
      <div className="site-container py-14 md:py-20">
        <div className={cn("hero-stack max-w-4xl", contentClassName)}>
          <p className="section-eyebrow text-white/68">{eyebrow}</p>
          <h1 className="serif-display mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p
            className={cn(
              "mt-4 max-w-2xl text-sm leading-7 text-white/76 sm:text-base md:text-lg md:leading-8",
              descriptionClassName
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
