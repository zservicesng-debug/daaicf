import Image from "next/image";
import { notFound } from "next/navigation";
import {
  deleteGalleryCollectionAction,
  deleteGalleryItemAction,
  updateGalleryCollectionAction,
} from "@/app/_actions/admin";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { SelectInput, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  getGalleryCollectionById,
  listGalleryYears,
  listPosts,
} from "@/lib/store";
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

export default async function GalleryCollectionPage(
  props: PageProps<"/admin/gallery/[id]">
) {
  const { id } = await props.params;
  const [collection, galleryYears, postsResult] = await Promise.all([
    getGalleryCollectionById(id),
    listGalleryYears(),
    listPosts({ perPage: 500 }),
  ]);

  if (!collection) {
    notFound();
  }

  const postOptions = postsResult.items.map((post) => ({
    id: post.id,
    title: post.title,
  }));
  const updateCollection = updateGalleryCollectionAction.bind(null, collection.id);
  const deleteCollection = deleteGalleryCollectionAction.bind(null, collection.id);
  const imageCount = collection.items.filter(
    (item) => item.mediaType === "image"
  ).length;
  const videoCount = collection.items.length - imageCount;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
            Edit Gallery Media
          </h1>
          <p className="mt-2 muted-copy">
            Review this gallery batch, update its title, year, category, or linked post,
            and remove individual media when needed.
          </p>
        </div>
        <ButtonLink href="/admin/gallery" variant="surface" fullWidth={false}>
          Back to Gallery
        </ButtonLink>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Details
          </h2>
          <p className="mt-1 text-sm muted-copy">
            These details apply to every photo and video in this batch.
          </p>

          <form
            action={updateCollection}
            className="mt-5 space-y-5"
            data-submit-toast-title="Saving gallery details"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold">Gallery Title</label>
              <TextInput
                name="title"
                defaultValue={collection.title}
                maxLength={120}
                placeholder={`${collection.album} ${collection.year}`}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">General Category</label>
                <SelectInput name="album" defaultValue={collection.album}>
                  {galleryCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </SelectInput>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Year</label>
                <SelectInput name="year" defaultValue={String(collection.year)}>
                  {galleryYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </SelectInput>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Attach to Post</label>
              <SelectInput
                name="sourcePostId"
                defaultValue={collection.sourcePostId || ""}
              >
                <option value="">No linked post</option>
                {postOptions.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </SelectInput>
            </div>

            <SubmitButton>Save Gallery Details</SubmitButton>
          </form>

          <div className="mt-6 border-t border-[var(--color-border)] pt-5">
            <p className="text-sm muted-copy">
              {collection.items.length} media item
              {collection.items.length === 1 ? "" : "s"} / {imageCount} image
              {imageCount === 1 ? "" : "s"} / {videoCount} video
              {videoCount === 1 ? "" : "s"}
            </p>
            <div className="mt-4">
              <ConfirmActionModal
                action={deleteCollection}
                title="Delete gallery batch?"
                description="This removes every photo and video in this batch from the gallery."
                trigger="Delete Batch"
                triggerClassName="!w-full"
                confirmLabel="Delete Batch"
                submitToastTitle="Deleting gallery batch"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Media
            </h2>
            <p className="mt-1 text-sm muted-copy">
              Videos and photos currently published under this gallery batch.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {collection.items.map((item) => {
              const deleteItem = deleteGalleryItemAction.bind(
                null,
                item.id,
                collection.id
              );

              return (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-muted)]">
                    {item.mediaType === "video" ? (
                      <video
                        src={item.imageUrl}
                        className="h-full w-full object-cover"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={item.imageUrl}
                        alt={item.caption || collection.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                        {collection.title}
                      </p>
                      <p className="mt-1 text-xs muted-copy">
                        {item.mediaType === "video" ? "Video" : "Image"}
                      </p>
                    </div>
                    <ConfirmActionModal
                      action={deleteItem}
                      title="Delete gallery media?"
                      description="This media item will be permanently removed from the gallery."
                      trigger="Delete"
                      triggerClassName="!px-3 !py-2 text-xs"
                      confirmLabel="Delete Media"
                      submitToastTitle="Deleting gallery media"
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
