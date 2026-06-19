import { CategoryFilter } from "@/components/public/category-filter";
import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { PageHero } from "@/components/public/page-hero";
import { Card } from "@/components/ui/card";
import { listGallery, listGalleryYears } from "@/lib/store";
import { type GalleryAlbum } from "@/types";

const galleryCategories: GalleryAlbum[] = [
  "Health",
  "Education",
  "Empowerment",
  "Events",
  "Infrastructure",
  "Community Service",
  "Awards/Recognition",
  "Partnership",
  "Scholarship",
];

export default async function GalleryPage(props: PageProps<"/gallery">) {
  const searchParams = await props.searchParams;
  const galleryYears = await listGalleryYears();
  const requestedYear = Number(searchParams.year);
  const activeYear =
    galleryYears.find((year) => year === requestedYear) ?? galleryYears[0] ?? null;
  const media = activeYear ? await listGallery({ year: activeYear }) : [];
  const groupedItems = galleryCategories
    .map((category) => ({
      category,
      items: media.filter((item) => item.album === category),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Visual Stories"
        title="Media Gallery"
        description="Browse our work year by year. Photos and videos are arranged under each outreach category for easy viewing."
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
              Showing <span className="font-semibold text-[var(--color-text)]">{activeYear}</span>{" "}
              gallery media, grouped by general category.
            </p>
          ) : null}

          {groupedItems.length > 0 && activeYear ? (
            <div className="space-y-12">
              {groupedItems.map((section) => (
                <section key={section.category} className="space-y-5">
                  <div>
                    <h2 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                      {section.category}
                    </h2>
                    <p className="mt-1 text-sm muted-copy">
                      {section.items.length} media item{section.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <GalleryLightbox items={section.items} category={section.category} year={activeYear} />
                </section>
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <h2 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                {galleryYears.length === 0
                  ? "No gallery years configured yet"
                  : `No gallery media for ${activeYear ?? "this year"} yet`}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 muted-copy">
                {galleryYears.length === 0
                  ? "The admin panel needs at least one gallery year before public media can appear here."
                  : "Images and videos will appear here after they are published from the gallery manager."}
              </p>
            </Card>
          )}
        </div>
      </section>
    </>
  );
}
