"use client";

import { useState } from "react";
import { Film, Images, Upload } from "lucide-react";
import { SelectInput, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type GalleryAlbum, type GalleryMediaType } from "@/types";

const albumOptions: GalleryAlbum[] = [
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

type UploadedMedia = {
  url: string;
  path: string;
  type: GalleryMediaType;
};

const GALLERY_MAX_FILE_SIZE = 50 * 1024 * 1024;
const UPLOAD_CONCURRENCY = 3;

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
  const { toast } = useToast();

  const imageCount = files.filter((file) => file.type.startsWith("image/")).length;
  const videoCount = files.filter((file) => file.type.startsWith("video/")).length;

  async function uploadGalleryFile(
    file: File,
    client: NonNullable<ReturnType<typeof createSupabaseBrowserClient>>
  ) {
    const response = await fetch("/api/admin/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size,
        folder: "gallery",
      }),
    });
    const result = (await response.json().catch(() => null)) as
      | {
          bucket?: string;
          url?: string;
          path?: string;
          token?: string;
          error?: string;
        }
      | null;

    if (
      !response.ok ||
      !result?.bucket ||
      !result.url ||
      !result.path ||
      !result.token
    ) {
      throw new Error(result?.error || `Could not prepare ${file.name}.`);
    }

    const { error } = await client.storage
      .from(result.bucket)
      .uploadToSignedUrl(result.path, result.token, file, {
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    return {
      url: result.url,
      path: result.path,
      type: file.type.startsWith("video/") ? "video" : "image",
    } satisfies UploadedMedia;
  }

  async function publishBatch(formData: FormData) {
    setUploadError("");

    if (files.length === 0) {
      setUploadError("Choose at least one image or video before publishing.");
      return;
    }

    const unsupportedFile = files.find(
      (file) => !file.type.startsWith("image/") && !file.type.startsWith("video/")
    );
    if (unsupportedFile) {
      setUploadError("Only image and video files can be published to the gallery.");
      return;
    }

    const oversizedFile = files.find((file) => file.size > GALLERY_MAX_FILE_SIZE);
    if (oversizedFile) {
      setUploadError("Gallery files must be 50 MB or smaller.");
      return;
    }

    const client = createSupabaseBrowserClient();
    if (!client) {
      setUploadError("Supabase storage is not configured for uploads.");
      return;
    }

    let uploaded: UploadedMedia[];
    try {
      uploaded = [];
      for (let start = 0; start < files.length; start += UPLOAD_CONCURRENCY) {
        const batch = files.slice(start, start + UPLOAD_CONCURRENCY);
        const completed = await Promise.all(
          batch.map((file) => uploadGalleryFile(file, client))
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

    toast({
      type: "success",
      title: "Gallery media published",
      description: `${uploaded.length} media item${uploaded.length === 1 ? "" : "s"} added to the gallery.`,
    });
    setFiles([]);
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
          <SelectInput name="album" defaultValue="Health">
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
