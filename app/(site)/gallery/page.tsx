import { CategoryFilter } from "@/components/public/category-filter";
import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { PageHero } from "@/components/public/page-hero";
import { Card } from "@/components/ui/card";
import { listGalleryCollections, listGalleryYears } from "@/lib/store";

const galleryCategories = [
  "Health Outreach",
  "Education",
  "Empowerment",
  "Events",
  "Relief",
] as const;

export default async function GalleryPage(props: PageProps<"/gallery">) {
  const searchParams = await props.searchParams;
  const galleryYears = await listGalleryYears();
  const requestedYear = Number(searchParams.year);
  const activeYear =
    galleryYears.find((year) => year === requestedYear) ?? galleryYears[0] ?? null;
  const collections = activeYear ? await listGalleryCollections({ year: activeYear }) : [];
  const groupedItems = galleryCategories
    .map((category) => ({
      category,
      items: collections.filter((item) => item.album === category),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Visual Stories"
        title="Media Gallery"
        description="Browse our outreach and event collections year by year, then open each category to explore the photos and videos inside every season of impact."
      />

      <section className="site-section bg-white">
        <div className="site-container space-y-8">
          {galleryYears.length > 0 ? (
            <CategoryFilter
              pathname="/gallery"
              categories={galleryYears.map(String)}
              active={activeYear ? String(activeYear) : ""}
              paramName="year"
            />
          ) : null}

          {activeYear ? (
            <p className="text-sm muted-copy">
              Showing the{" "}
              <span className="font-semibold text-[var(--color-text)]">{activeYear}</span>{" "}
              collections, grouped by category.
            </p>
          ) : null}

          {groupedItems.length > 0 ? (
            <div className="space-y-10">
              {groupedItems.map((section) => {
                const mediaCount = section.items.reduce(
                  (total, collection) => total + collection.items.length,
                  0
                );

                return (
                  <div key={section.category} className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h2 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                          {section.category}
                        </h2>
                        <p className="mt-1 text-sm muted-copy">
                          {section.items.length} collection
                          {section.items.length === 1 ? "" : "s"} and {mediaCount} media
                          item{mediaCount === 1 ? "" : "s"} from {activeYear}.
                        </p>
                      </div>
                    </div>
                    <GalleryLightbox collections={section.items} />
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="p-8">
              <h2 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                {galleryYears.length === 0
                  ? "No gallery years configured yet"
                  : `No gallery collections for ${activeYear ?? "this year"} yet`}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 muted-copy">
                {galleryYears.length === 0
                  ? "The admin panel needs at least one gallery year before public collections can appear here."
                  : "The admin will publish real event and outreach media collections here as they are uploaded."}
              </p>
            </Card>
          )}
        </div>
      </section>
    </>
  );
}
