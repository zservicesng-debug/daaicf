import { Search } from "lucide-react";
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
  const searchQuery = String(searchParams.q || "").trim();
  const activeYear =
    galleryYears.find((year) => year === requestedYear) ?? galleryYears[0] ?? null;
  const allMedia = activeYear ? await listGallery({ year: activeYear }) : [];
  const normalizedSearch = searchQuery.toLowerCase();
  const media = normalizedSearch
    ? allMedia.filter((item) =>
        [
          item.collectionTitle,
          item.caption,
          item.album,
          item.mediaType,
          String(item.year),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : allMedia;
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

          {activeYear ? (
            <form action="/gallery" className="flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="year" value={activeYear} />
              <label className="relative flex-1">
                <span className="sr-only">Search gallery</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search gallery titles, categories, photos, or videos"
                  className="input-shell !pl-12"
                />
              </label>
              <button
                type="submit"
                className="touch-target inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
              >
                Search
              </button>
              {searchQuery ? (
                <a
                  href={`/gallery?year=${activeYear}`}
                  className="touch-target inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-text)]"
                >
                  Clear
                </a>
              ) : null}
            </form>
          ) : null}

          {groupedItems.length > 0 && activeYear ? (
            <div className="space-y-12">
              {groupedItems.map((section) => {
                const photoCount = section.items.filter(
                  (item) => item.mediaType === "image"
                ).length;
                const videoCount = section.items.filter(
                  (item) => item.mediaType === "video"
                ).length;

                return (
                  <section key={section.category} className="space-y-5">
                    <div>
                      <h2 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                        {section.category}
                      </h2>
                      <p className="mt-1 text-sm muted-copy">
                        {photoCount} photo{photoCount === 1 ? "" : "s"} ·{" "}
                        {videoCount} video{videoCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <GalleryLightbox items={section.items} category={section.category} year={activeYear} />
                  </section>
                );
              })}
            </div>
          ) : (
            <Card className="p-8">
              <h2 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                {searchQuery
                  ? "No matching gallery media"
                  : galleryYears.length === 0
                  ? "No gallery years configured yet"
                  : `No gallery media for ${activeYear ?? "this year"} yet`}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 muted-copy">
                {searchQuery
                  ? "Try a different title, category, year, photo, or video search."
                  : galleryYears.length === 0
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
