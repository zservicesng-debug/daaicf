import Image from "next/image";
import { notFound } from "next/navigation";
import {
  addGalleryCollectionMediaAction,
  deleteGalleryCollectionAction,
  deleteGalleryItemAction,
  updateGalleryCollectionAction,
} from "@/app/_actions/admin";
import { GalleryCollectionForm } from "@/components/admin/gallery-collection-form";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { SelectInput, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { getGalleryCollectionById, listGalleryYears } from "@/lib/store";

export default async function AdminGalleryCollectionPage(
  props: PageProps<"/admin/gallery/[id]">
) {
  const { id } = await props.params;
  const [collection, galleryYears] = await Promise.all([
    getGalleryCollectionById(id),
    listGalleryYears(),
  ]);

  if (!collection) {
    notFound();
  }

  const saveCollection = updateGalleryCollectionAction.bind(null, collection.id);
  const addMedia = addGalleryCollectionMediaAction.bind(null, collection.id);
  const deleteCollection = deleteGalleryCollectionAction.bind(null, collection.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
            {collection.title}
          </h1>
          <p className="mt-2 muted-copy">
            Manage collection details, add more images or videos, and remove media one
            item at a time.
          </p>
        </div>
        <ConfirmActionModal
          action={deleteCollection}
          title="Delete gallery collection?"
          description={`This will permanently remove "${collection.title}" and all ${collection.items.length} media item${collection.items.length === 1 ? "" : "s"} inside it. This action cannot be undone.`}
          trigger="Delete Collection"
          confirmLabel="Delete Collection"
          submitToastTitle="Deleting gallery collection"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Collection Details
          </h2>
          <form
            action={saveCollection}
            className="mt-5 space-y-5"
            data-submit-toast-title="Saving gallery collection"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold">Collection Title</label>
              <TextInput name="title" defaultValue={collection.title} required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">Category</label>
                <SelectInput name="album" defaultValue={collection.album}>
                  <option value="Health Outreach">Health Outreach</option>
                  <option value="Education">Education</option>
                  <option value="Empowerment">Empowerment</option>
                  <option value="Events">Events</option>
                  <option value="Relief">Relief</option>
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
            <SubmitButton>Save Collection</SubmitButton>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Add More Media
          </h2>
          <p className="mt-1 text-sm muted-copy">
            Paste more direct media links or upload extra files into this same collection.
          </p>
          <div className="mt-5">
            <GalleryCollectionForm
              action={addMedia}
              galleryYears={galleryYears}
              submitLabel="Add Media"
              mode="append"
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Collection Media</h2>
            <p className="mt-1 text-sm muted-copy">
              {collection.items.length} media item{collection.items.length === 1 ? "" : "s"} in
              this collection.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {collection.items.map((item, index) => {
            const deleteItem = deleteGalleryItemAction.bind(
              null,
              item.id,
              collection.id
            );

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                  {item.mediaType === "video" ? (
                    <video
                      src={item.imageUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      controls
                    />
                  ) : (
                    <Image
                      src={item.imageUrl}
                      alt={`${collection.title} media ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium text-[var(--color-text)]">
                      {item.mediaType === "video" ? "Video" : "Image"} {index + 1}
                    </p>
                    <p className="mt-1 text-sm muted-copy">{item.caption}</p>
                  </div>
                  <ConfirmActionModal
                    action={deleteItem}
                    title="Delete media item?"
                    description={`This will remove ${item.mediaType} ${index + 1} from "${collection.title}". This action cannot be undone.`}
                    trigger="Delete"
                    triggerClassName="!px-3 !py-2 text-xs"
                    confirmLabel="Delete Media"
                    submitToastTitle="Deleting gallery media"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
