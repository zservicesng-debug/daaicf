"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { savePostAction } from "@/app/_actions/admin";
import { buttonClasses } from "@/components/ui/button";
import { SelectInput, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils";
import { type Post } from "@/types";

type GalleryLinkRow = {
  id: string;
  url: string;
};

type GalleryFileRow = {
  id: string;
  file: File;
  previewUrl: string;
};

function createGalleryLinkRow(): GalleryLinkRow {
  return {
    id: crypto.randomUUID(),
    url: "",
  };
}

function createGalleryFileRow(file: File): GalleryFileRow {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

function isPreviewableImageUrl(url: string) {
  return /^https?:\/\//i.test(url.trim());
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
          : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

export function PostEditorForm({
  post,
  partnerOptions = [],
}: {
  post?: Post | null;
  partnerOptions?: Array<{ id: string; name: string }>;
}) {
  const initialContent = post?.content || "<p>Start writing...</p>";
  const [coverFilePreview, setCoverFilePreview] = useState<string | null>(null);
  const [coverImageLink, setCoverImageLink] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Post["category"]>(
    post?.category || "Health"
  );
  const [partnerName, setPartnerName] = useState(post?.partnerName || "");
  const [galleryFiles, setGalleryFiles] = useState<GalleryFileRow[]>([]);
  const [galleryLinkRows, setGalleryLinkRows] = useState<GalleryLinkRow[]>([
    createGalleryLinkRow(),
  ]);
  const [clearGallery, setClearGallery] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [uploadingImage, setUploadingImage] = useState(false);
  const editorImageInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFilePickerRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFilesRef = useRef<GalleryFileRow[]>([]);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      setContent(current.getHTML());
    },
  });

  const coverPreview =
    coverFilePreview ||
    (isPreviewableImageUrl(coverImageLink) ? coverImageLink.trim() : "") ||
    post?.coverImageUrl ||
    "";
  const existingGalleryPreviews = clearGallery ? [] : post?.galleryImageUrls || [];
  const galleryFilePreviews = galleryFiles.map((item) => item.previewUrl);
  const galleryLinkPreviews = galleryLinkRows
    .map((row) => row.url.trim())
    .filter(isPreviewableImageUrl);
  const galleryPreviews = [
    ...existingGalleryPreviews,
    ...galleryLinkPreviews,
    ...galleryFilePreviews,
  ];
  const hasCustomPartnerName =
    partnerName.length > 0 &&
    !partnerOptions.some((partnerOption) => partnerOption.name === partnerName);

  useEffect(() => {
    galleryFilesRef.current = galleryFiles;
  }, [galleryFiles]);

  useEffect(() => {
    return () => {
      galleryFilesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  function syncGalleryFileInput(nextFiles: GalleryFileRow[]) {
    const input = galleryFileInputRef.current;
    if (!input) {
      return;
    }

    const transfer = new DataTransfer();
    nextFiles.forEach((item) => {
      transfer.items.add(item.file);
    });
    input.files = transfer.files;
  }

  function appendGalleryFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setGalleryFiles((current) => {
      const nextFiles = [...current, ...files.map(createGalleryFileRow)];
      syncGalleryFileInput(nextFiles);
      return nextFiles;
    });
  }

  function removeGalleryFile(fileId: string) {
    setGalleryFiles((current) => {
      const nextFiles = current.filter((item) => item.id !== fileId);
      const removedFile = current.find((item) => item.id === fileId);

      if (removedFile) {
        URL.revokeObjectURL(removedFile.previewUrl);
      }

      syncGalleryFileInput(nextFiles);
      return nextFiles;
    });
  }

  async function uploadEditorImage(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", "editor");

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;

    if (!response.ok || !payload?.url) {
      throw new Error(payload?.error || "Unable to upload the image right now.");
    }

    return payload.url;
  }

  async function handleEditorImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editor) {
      return;
    }

    setUploadingImage(true);

    try {
      const url = await uploadEditorImage(file);
      editor.chain().focus().setImage({ src: url }).run();
      toast({
        type: "success",
        title: "Image uploaded",
        description: "The image has been inserted into the post content.",
      });
    } catch (error) {
      toast({
        type: "error",
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "We could not upload that image right now.",
      });
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <form action={savePostAction} className="space-y-6">
      <input type="hidden" name="existingSlug" value={post?.slug || ""} />
      <input type="hidden" name="content" value={content} />

      <div>
        <label className="mb-2 block text-sm font-semibold">Title</label>
        <TextInput name="title" defaultValue={post?.title} required />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold">Slug</label>
          <TextInput defaultValue={post?.slug} disabled />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Category</label>
          <SelectInput
            name="category"
            defaultValue={post?.category || "Health"}
            onChange={(event) =>
              setSelectedCategory(event.target.value as Post["category"])
            }
          >
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Empowerment">Empowerment</option>
            <option value="Events">Events</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Community Service">Community Service</option>
            <option value="Awards/Recognition">Awards/Recognition</option>
            <option value="Partnership">Partnership</option>
            <option value="Scholarship">Scholarship</option>
          </SelectInput>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Gallery Year <span className="font-normal muted-copy">(optional)</span>
          </label>
          <TextInput
            name="galleryYear"
            type="number"
            min={1900}
            max={2100}
            defaultValue={post?.galleryYear || ""}
            placeholder={String(new Date().getFullYear())}
          />
          <p className="mt-2 text-sm muted-copy">
            Adds the cover and extra photos to this year in the gallery.
          </p>
        </div>
      </div>

      {selectedCategory === "Partnership" ? (
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Partner <span className="font-normal muted-copy">(optional)</span>
          </label>
          <SelectInput
            name="partnerName"
            value={partnerName}
            onChange={(event) => setPartnerName(event.target.value)}
          >
            <option value="">No partner selected</option>
            {hasCustomPartnerName ? (
              <option value={partnerName}>{partnerName}</option>
            ) : null}
            {partnerOptions.map((partner) => (
              <option key={partner.id} value={partner.name}>
                {partner.name}
              </option>
            ))}
          </SelectInput>
          <p className="mt-2 text-sm muted-copy">
            Choose a partner for this activity, or leave it empty.
          </p>
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Social Media Post Links
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <TextInput
            name="facebookUrl"
            defaultValue={post?.socialLinks.facebookUrl}
            placeholder="https://facebook.com/..."
          />
          <TextInput
            name="twitterUrl"
            defaultValue={post?.socialLinks.twitterUrl}
            placeholder="https://x.com/... or https://twitter.com/..."
          />
          <TextInput
            name="instagramUrl"
            defaultValue={post?.socialLinks.instagramUrl}
            placeholder="https://instagram.com/..."
          />
        </div>
        <p className="mt-2 text-sm muted-copy">
          Add the direct Facebook, Twitter, and Instagram links for this activity.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Cover Image</label>
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">
                Upload a cover image
              </p>
              <p className="mt-1 text-sm muted-copy">
                You can upload a file or paste a direct image link below. If both are
                provided, the uploaded file will be used.
              </p>
              <TextInput
                className="mt-4"
                name="coverImageFile"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setCoverFilePreview(file ? URL.createObjectURL(file) : null);
                }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Or use a cover image link
              </label>
              <TextInput
                name="coverImageUrl"
                type="url"
                value={coverImageLink}
                onChange={(event) => setCoverImageLink(event.target.value)}
                placeholder="https://example.com/cover-photo.jpg"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-44 items-center justify-center px-4 text-center text-sm muted-copy">
                Cover preview
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">More Photos</label>
        <div className="space-y-4 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <p className="text-sm muted-copy">
            Upload one or many extra photos, paste direct image links, or use both.
            On existing posts, new photos will be added to the current set unless you
            choose to replace/remove it below.
          </p>

          <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Paste extra photo links
                </p>
                <p className="mt-1 text-sm muted-copy">
                  Add one image link at a time, then save the post.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setGalleryLinkRows((current) => [...current, createGalleryLinkRow()])
                }
                className={cn(
                  buttonClasses({ variant: "surface", fullWidth: false }),
                  "px-4 py-2 text-xs"
                )}
              >
                <Plus className="h-4 w-4" />
                Add Link
              </button>
            </div>

            <div className="space-y-3">
              {galleryLinkRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid gap-3 md:grid-cols-[1fr_auto]"
                >
                  <TextInput
                    name="galleryImageLinks"
                    type="url"
                    value={row.url}
                    onChange={(event) => {
                      const nextUrl = event.target.value;
                      setGalleryLinkRows((current) =>
                        current.map((item) =>
                          item.id === row.id ? { ...item, url: nextUrl } : item
                        )
                      );
                    }}
                    placeholder="https://example.com/more-photo.jpg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryLinkRows((current) =>
                        current.length === 1
                          ? [{ ...current[0], url: "" }]
                          : current.filter((item) => item.id !== row.id)
                      )
                    }
                    className={cn(
                      buttonClasses({ variant: "danger", fullWidth: false }),
                      "px-3 py-2"
                    )}
                    aria-label={`Remove extra photo link ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Upload extra photo files
                </p>
                <p className="mt-1 text-sm muted-copy">
                  Pick one or many photos from your device, add more in batches,
                  and remove any one you do not want before saving.
                </p>
              </div>
              <button
                type="button"
                onClick={() => galleryFilePickerRef.current?.click()}
                className={cn(
                  buttonClasses({ variant: "surface", fullWidth: false }),
                  "px-4 py-2 text-xs"
                )}
              >
                <Plus className="h-4 w-4" />
                Add Photos
              </button>
            </div>

            <input
              ref={galleryFilePickerRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                appendGalleryFiles(Array.from(event.target.files || []));
                event.target.value = "";
              }}
            />
            <input
              ref={galleryFileInputRef}
              name="galleryImageFiles"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
            />

            {galleryFiles.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {galleryFiles.map((item, index) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={`Selected upload ${index + 1}`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-3 px-3 py-3">
                      <p className="min-w-0 flex-1 truncate text-sm text-[var(--color-text)]">
                        {item.file.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(item.id)}
                        className={cn(
                          buttonClasses({ variant: "danger", fullWidth: false }),
                          "px-3 py-2"
                        )}
                        aria-label={`Remove uploaded photo ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-5 text-sm muted-copy">
                No photo files selected yet.
              </div>
            )}
          </div>

          {post?.galleryImageUrls?.length ? (
            <label className="inline-flex items-center gap-3 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                name="clearGalleryImages"
                checked={clearGallery}
                onChange={(event) => setClearGallery(event.target.checked)}
              />
              Replace the current extra photo section with the new selection, or
              remove it completely if you leave no new photos.
            </label>
          ) : null}

          {galleryPreviews.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {galleryPreviews.map((preview, index) => (
                <div
                  key={`${preview}-${index}`}
                  className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt={`Extra photo preview ${index + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-4 py-5 text-sm muted-copy">
              No extra photos added yet.
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Content</label>
        <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={editor?.isActive("bold")}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={editor?.isActive("italic")}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor?.isActive("heading", { level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={editor?.isActive("bulletList")}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              active={editor?.isActive("orderedList")}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const value = window.prompt("Add a link");
                if (value) {
                  editor?.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
                }
              }}
              active={editor?.isActive("link")}
            >
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editorImageInputRef.current?.click()}
              disabled={uploadingImage || !editor}
            >
              {uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </ToolbarButton>
          </div>
          <input
            ref={editorImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleEditorImageChange}
          />
          <EditorContent
            editor={editor}
            className="prose-daaicf min-h-72 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="inline-flex items-center gap-3 text-sm font-medium text-[var(--color-text)]">
          <input
            type="radio"
            name="published"
            value="draft"
            defaultChecked={!post?.published}
          />
          Save as Draft
        </label>
        <label className="inline-flex items-center gap-3 text-sm font-medium text-[var(--color-text)]">
          <input
            type="radio"
            name="published"
            value="published"
            defaultChecked={post?.published ?? true}
          />
          Publish
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton variant="surface" fullWidth={false}>
          Save Changes
        </SubmitButton>
        <SubmitButton fullWidth={false}>Publish</SubmitButton>
      </div>
    </form>
  );
}
