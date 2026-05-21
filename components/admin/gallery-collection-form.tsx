"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { SelectInput, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import { type GalleryAlbum, type GalleryMediaType } from "@/types";

type MediaLinkRow = {
  id: string;
  type: GalleryMediaType;
  url: string;
};

const albumOptions: GalleryAlbum[] = [
  "Health Outreach",
  "Education",
  "Empowerment",
  "Events",
  "Relief",
];

function createLinkRow(): MediaLinkRow {
  return {
    id: crypto.randomUUID(),
    type: "image",
    url: "",
  };
}

export function GalleryCollectionForm({
  action,
  galleryYears,
  submitLabel,
  mode,
  initialTitle,
  initialAlbum = "Health Outreach",
  initialYear,
}: {
  action: (formData: FormData) => void | Promise<void>;
  galleryYears: number[];
  submitLabel: string;
  mode: "create" | "append";
  initialTitle?: string;
  initialAlbum?: GalleryAlbum;
  initialYear?: number;
}) {
  const [links, setLinks] = useState<MediaLinkRow[]>([createLinkRow()]);

  return (
    <form
      action={action}
      className="space-y-5"
      data-submit-toast-title={submitLabel}
    >
      {mode === "create" ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-semibold">Collection Title</label>
            <TextInput
              name="title"
              defaultValue={initialTitle}
              placeholder="e.g. 2026 Health Outreach in Owerri"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Category</label>
              <SelectInput name="album" defaultValue={initialAlbum}>
                {albumOptions.map((album) => (
                  <option key={album} value={album}>
                    {album}
                  </option>
                ))}
              </SelectInput>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Year</label>
              <SelectInput
                name="year"
                defaultValue={initialYear ? String(initialYear) : String(galleryYears[0] || "")}
              >
                {galleryYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>
        </>
      ) : null}

      <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Paste media links</p>
            <p className="mt-1 text-sm muted-copy">
              Add direct image or video URLs one by one, then upload them together.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLinks((current) => [...current, createLinkRow()])}
            className={cn(buttonClasses({ variant: "surface", fullWidth: false }), "px-4 py-2 text-xs")}
          >
            <Plus className="h-4 w-4" />
            Add Link
          </button>
        </div>

        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={link.id} className="grid gap-3 md:grid-cols-[150px_1fr_auto]">
              <SelectInput
                name="mediaLinkTypes"
                value={link.type}
                onChange={(event) => {
                  const value = event.target.value as GalleryMediaType;
                  setLinks((current) =>
                    current.map((item) =>
                      item.id === link.id ? { ...item, type: value } : item
                    )
                  );
                }}
              >
                <option value="image">Image link</option>
                <option value="video">Video link</option>
              </SelectInput>
              <TextInput
                name="mediaLinks"
                type="url"
                value={link.url}
                onChange={(event) => {
                  const value = event.target.value;
                  setLinks((current) =>
                    current.map((item) =>
                      item.id === link.id ? { ...item, url: value } : item
                    )
                  );
                }}
                placeholder={
                  link.type === "video"
                    ? "https://example.com/video.mp4"
                    : "https://example.com/photo.jpg"
                }
              />
              <button
                type="button"
                onClick={() =>
                  setLinks((current) =>
                    current.length === 1
                      ? [{ ...current[0], url: "", type: "image" }]
                      : current.filter((item) => item.id !== link.id)
                  )
                }
                className={cn(
                  buttonClasses({ variant: "danger", fullWidth: false }),
                  "px-3 py-2"
                )}
                aria-label={`Remove media link ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Upload image or video files
        </label>
        <TextInput name="mediaFiles" type="file" accept="image/*,video/*" multiple />
        <p className="mt-2 text-sm muted-copy">
          You can combine direct links and uploaded files in the same collection.
        </p>
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
