import Image from "next/image";
import Link from "next/link";
import {
  addGalleryYearAction,
  deleteGalleryItemAction,
  deleteGalleryYearAction,
  uploadGalleryMediaAction,
} from "@/app/_actions/admin";
import { GalleryUploadForm } from "@/components/admin/gallery-collection-form";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { listGallery, listGalleryYears, listPosts } from "@/lib/store";
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

export default async function AdminGalleryPage() {
  const [media, galleryYears, postsResult] = await Promise.all([
    listGallery(),
    listGalleryYears(),
    listPosts({ perPage: 500 }),
  ]);
  const postOptions = postsResult.items.map((post) => ({
    id: post.id,
    title: post.title,
  }));
  const populatedYears = Array.from(new Set(media.map((item) => item.year))).sort(
    (left, right) => right - left
  );
  const defaultYear = galleryYears[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Gallery
        </h1>
        <p className="mt-2 muted-copy">
          Bulk-publish images and videos by general category and year. Gallery uploads
          are separate from post media.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Upload Gallery Media
          </h2>
          <p className="mt-1 text-sm muted-copy">
            Pick a category and year, choose all the images and videos, then publish the
            batch once.
          </p>
          {galleryYears.length > 0 ? (
            <div className="mt-5">
              <GalleryUploadForm
                action={uploadGalleryMediaAction}
                galleryYears={galleryYears}
                initialYear={defaultYear}
                postOptions={postOptions}
              />
            </div>
          ) : (
            <p className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm muted-copy">
              Add a gallery year before uploading media.
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Manage Years</h2>
          <p className="mt-1 text-sm muted-copy">
            Add or remove the years available on the public gallery.
          </p>
          <form
            action={addGalleryYearAction}
            className="mt-4 flex gap-3"
            data-submit-toast-title="Adding gallery year"
          >
            <TextInput name="year" type="number" min={1900} max={2100} placeholder="2027" required />
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
                <button type="submit" className="text-xs font-semibold text-[var(--color-accent)]">
                  Remove
                </button>
              </form>
            ))}
          </div>
          <p className="mt-4 text-sm muted-copy">
            A year can only be removed after its gallery media has been deleted.
          </p>
        </Card>
      </div>

      {media.length > 0 ? (
        <div className="space-y-10">
          {populatedYears.map((year) => (
            <section key={year} className="space-y-6">
              <div>
                <h2 className="serif-display text-3xl font-semibold text-[var(--color-text)]">
                  {year}
                </h2>
                <p className="mt-1 text-sm muted-copy">
                  {media.filter((item) => item.year === year).length} media item
                  {media.filter((item) => item.year === year).length === 1 ? "" : "s"}
                </p>
              </div>

              {galleryCategories.map((category) => {
                const items = media.filter(
                  (item) => item.year === year && item.album === category
                );
                if (items.length === 0) return null;

                const imageCount = items.filter((item) => item.mediaType === "image").length;
                const videoCount = items.length - imageCount;

                return (
                  <div key={category} className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--color-text)]">{category}</h3>
                      <p className="mt-1 text-sm muted-copy">
                        {imageCount} image{imageCount === 1 ? "" : "s"} · {videoCount} video
                        {videoCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                      {items.map((item) => {
                        const deleteItem = deleteGalleryItemAction.bind(null, item.id, null);
                        return (
                          <Card key={item.id} className="overflow-hidden">
                            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]">
                              {item.mediaType === "video" ? (
                                <video src={item.imageUrl} className="h-full w-full object-cover" controls playsInline preload="metadata" />
                              ) : (
                                <Image src={item.imageUrl} alt={`${category} gallery image from ${year}`} fill unoptimized className="object-cover" />
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-3 p-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-[var(--color-text)]">
                                  {item.collectionTitle || (item.mediaType === "video" ? "Video" : "Image")}
                                </p>
                                <p className="mt-1 text-xs muted-copy">
                                  {item.mediaType === "video" ? "Video" : "Image"}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <Link
                                  href={`/admin/gallery/${item.collectionId}`}
                                  className="text-xs font-semibold text-[var(--color-primary)]"
                                >
                                  Edit
                                </Link>
                                <ConfirmActionModal
                                  action={deleteItem}
                                  title="Delete gallery media?"
                                  description="This media item will be permanently removed from the gallery. Posts will not be affected."
                                  trigger="Delete"
                                  triggerClassName="!px-3 !py-2 text-xs"
                                  confirmLabel="Delete Media"
                                  submitToastTitle="Deleting gallery media"
                                />
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      ) : (
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">No gallery media yet</h2>
          <p className="mt-2 muted-copy">
            Choose a general category and year above, select a batch of images or videos,
            and publish them together.
          </p>
        </Card>
      )}
    </div>
  );
}
