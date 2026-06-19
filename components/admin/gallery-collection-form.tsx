"use client";

import { useState } from "react";
import { Film, Images, Upload } from "lucide-react";
import { SelectInput, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { type GalleryAlbum, type GalleryMediaType } from "@/types";

const albumOptions: GalleryAlbum[] = [
  "Health Outreach",
  "Education",
  "Empowerment",
  "Events",
  "Relief",
];

type UploadedMedia = {
  url: string;
  path: string;
  type: GalleryMediaType;
};

export function GalleryUploadForm({
  action,
  galleryYears,
  initialYear,
}: {
  action: (formData: FormData) => void | Promise<void>;
  galleryYears: number[];
  initialYear?: number;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");

  const imageCount = files.filter((file) => file.type.startsWith("image/")).length;
  const videoCount = files.filter((file) => file.type.startsWith("video/")).length;

  async function publishBatch(formData: FormData) {
    setUploadError("");

    if (files.length === 0) {
      setUploadError("Choose at least one image or video before publishing.");
      return;
    }

    let uploaded: UploadedMedia[];
    try {
      uploaded = [];
      for (let start = 0; start < files.length; start += 3) {
        const batch = files.slice(start, start + 3);
        const completed = await Promise.all(
          batch.map(async (file) => {
            const uploadData = new FormData();
            uploadData.set("file", file);
            uploadData.set("folder", "gallery");

            const response = await fetch("/api/admin/uploads", {
              method: "POST",
              body: uploadData,
            });
            const result = (await response.json()) as {
              url?: string;
              path?: string;
              error?: string;
            };

            if (!response.ok || !result.url || !result.path) {
              throw new Error(result.error || `Could not upload ${file.name}.`);
            }

            return {
              url: result.url,
              path: result.path,
              type: file.type.startsWith("video/") ? "video" : "image",
            } satisfies UploadedMedia;
          })
        );
        uploaded.push(...completed);
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "The media batch could not be uploaded."
      );
      return;
    }

    const publishData = new FormData();
    publishData.set("album", String(formData.get("album") || ""));
    publishData.set("year", String(formData.get("year") || ""));
    uploaded.forEach((item) => {
      publishData.append("mediaLinks", item.url);
      publishData.append("mediaLinkTypes", item.type);
      publishData.append("mediaPaths", item.path);
    });

    await action(publishData);
  }

  return (
    <form
      action={publishBatch}
      className="space-y-5"
      data-submit-toast-title="Publishing gallery media"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">General Category</label>
          <SelectInput name="album" defaultValue="Health Outreach">
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

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Images and videos
        </label>
        <TextInput
          name="mediaFiles"
          type="file"
          accept="image/*,video/*"
          multiple
          required
          onChange={(event) => {
            setUploadError("");
            setFiles(Array.from(event.target.files || []));
          }}
        />
        <p className="mt-2 text-sm muted-copy">
          Select many files at once. They will all be published to the chosen category
          and year; no individual title is needed.
        </p>
      </div>

      {files.length > 0 ? (
        <div className="flex flex-wrap gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold text-[var(--color-text)]">
            <Upload className="h-4 w-4" /> {files.length} selected
          </span>
          {imageCount > 0 ? (
            <span className="inline-flex items-center gap-2 muted-copy">
              <Images className="h-4 w-4" /> {imageCount} image{imageCount === 1 ? "" : "s"}
            </span>
          ) : null}
          {videoCount > 0 ? (
            <span className="inline-flex items-center gap-2 muted-copy">
              <Film className="h-4 w-4" /> {videoCount} video{videoCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      ) : null}

      {uploadError ? (
        <p role="alert" className="text-sm font-medium text-[var(--color-accent)]">
          {uploadError}
        </p>
      ) : null}

      <SubmitButton>Publish Media</SubmitButton>
    </form>
  );
}
