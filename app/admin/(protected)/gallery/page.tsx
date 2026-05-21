import Image from "next/image";
import Link from "next/link";
import {
  addGalleryYearAction,
  createGalleryCollectionAction,
  deleteGalleryCollectionAction,
  deleteGalleryYearAction,
} from "@/app/_actions/admin";
import { GalleryCollectionForm } from "@/components/admin/gallery-collection-form";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { listGalleryCollections, listGalleryYears } from "@/lib/store";

export default async function AdminGalleryPage() {
  const [collections, galleryYears] = await Promise.all([
    listGalleryCollections(),
    listGalleryYears(),
  ]);
  const populatedYears = Array.from(new Set(collections.map((item) => item.year))).sort(
    (left, right) => right - left
  );
  const defaultYear = galleryYears[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
            Gallery
          </h1>
          <p className="mt-2 muted-copy">
            Create yearly collections with many images or videos, then come back later
            to add more media to each collection.
          </p>
        </div>
        <div className="grid w-full max-w-5xl gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              New Collection
            </h2>
            <p className="mt-1 text-sm muted-copy">
              One collection title can hold many media items in the same category and
              year. Paste direct image/video links, upload files, or use both together.
            </p>
            {galleryYears.length > 0 ? (
              <div className="mt-4">
                <GalleryCollectionForm
                  action={createGalleryCollectionAction}
                  galleryYears={galleryYears}
                  submitLabel="Create Collection"
                  mode="create"
                  initialYear={defaultYear}
                />
              </div>
            ) : (
              <p className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm muted-copy">
                Add a gallery year before creating collections.
              </p>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Manage Years</h2>
            <p className="mt-1 text-sm muted-copy">
              Add or remove the year collections visible on the public gallery page.
            </p>
            <form
              action={addGalleryYearAction}
              className="mt-4 flex gap-3"
              data-submit-toast-title="Adding gallery year"
            >
              <TextInput
                name="year"
                type="number"
                min={1900}
                max={2100}
                placeholder="2027"
                required
              />
              <SubmitButton fullWidth={false}>+ Add Year</SubmitButton>
            </form>
            <div className="mt-4 flex flex-wrap gap-3">
              {galleryYears.map((year) => (
                <form
                  key={year}
                  action={deleteGalleryYearAction.bind(null, year)}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2"
                  data-submit-toast-title="Removing gallery year"
                >
                  <span className="text-sm font-medium text-[var(--color-text)]">{year}</span>
                  <button
                    type="submit"
                    className="text-xs font-semibold text-[var(--color-accent)]"
                    aria-label={`Remove ${year}`}
                  >
                    Remove
                  </button>
                </form>
              ))}
            </div>
            <p className="mt-4 text-sm muted-copy">
              A year that still has media inside collections cannot be removed until
              those collection items are deleted.
            </p>
          </Card>
        </div>
      </div>

      {collections.length > 0 ? (
        <div className="space-y-8">
          {populatedYears.map((year) => {
            const items = collections.filter((item) => item.year === year);

            return (
              <section key={year} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="serif-display text-3xl font-semibold text-[var(--color-text)]">
                      {year}
                    </h2>
                    <p className="mt-1 text-sm muted-copy">
                      {items.length} collection{items.length === 1 ? "" : "s"} in this year.
                    </p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((collection) => {
                    const cover = collection.items[0];
                    const deleteCollection = deleteGalleryCollectionAction.bind(
                      null,
                      collection.id
                    );

                    return (
                      <Card key={collection.id} className="overflow-hidden">
                        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]">
                          {cover.mediaType === "video" ? (
                            <video
                              src={cover.imageUrl}
                              className="h-full w-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <Image
                              src={cover.imageUrl}
                              alt={collection.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="space-y-4 p-4">
                          <div>
                            <p className="font-medium text-[var(--color-text)]">
                              {collection.title}
                            </p>
                            <p className="mt-1 text-sm muted-copy">
                              {collection.album} | {collection.year} | {collection.items.length} media
                              item{collection.items.length === 1 ? "" : "s"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Link
                              href={`/admin/gallery/${collection.id}`}
                              className="rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
                            >
                              Manage Collection
                            </Link>
                            <ConfirmActionModal
                              action={deleteCollection}
                              title="Delete gallery collection?"
                              description={`This will permanently remove "${collection.title}" and all ${collection.items.length} media item${collection.items.length === 1 ? "" : "s"} inside it. This action cannot be undone.`}
                              trigger="Delete"
                              triggerClassName="!px-4 !py-2 text-sm"
                              confirmLabel="Delete Collection"
                              submitToastTitle="Deleting gallery collection"
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            No gallery collections yet
          </h2>
          <p className="mt-2 muted-copy">
            The public gallery is currently empty. Create your first collection above
            with one title and many images or videos.
          </p>
        </Card>
      )}
    </div>
  );
}
