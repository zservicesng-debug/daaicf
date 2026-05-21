export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-hero">
      <div className="site-container py-14 md:py-20">
        <div className="hero-stack max-w-4xl">
          <p className="section-eyebrow text-white/68">{eyebrow}</p>
          <h1 className="serif-display mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76 sm:text-base md:text-lg md:leading-8">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
