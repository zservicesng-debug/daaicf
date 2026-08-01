import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthorizedPortalSession } from "@/lib/auth/portal";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "site-media";
const MAX_POST_GALLERY_FILE_SIZE = 15 * 1024 * 1024;
const MAX_GALLERY_FILE_SIZE = 50 * 1024 * 1024;

const uploadRequestSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.string().trim().min(1),
  size: z.number().int().positive(),
  folder: z.enum(["gallery", "posts-gallery"]).optional(),
}).superRefine((value, context) => {
  const isGalleryUpload = value.folder === "gallery";
  const maxFileSize = isGalleryUpload
    ? MAX_GALLERY_FILE_SIZE
    : MAX_POST_GALLERY_FILE_SIZE;
  const supportsMimeType = isGalleryUpload
    ? value.type.startsWith("image/") || value.type.startsWith("video/")
    : value.type.startsWith("image/");

  if (!supportsMimeType) {
    context.addIssue({
      code: "custom",
      path: ["type"],
      message: isGalleryUpload
        ? "Choose an image or video file."
        : "Choose an image file.",
    });
  }

  if (value.size > maxFileSize) {
    context.addIssue({
      code: "custom",
      path: ["size"],
      message: isGalleryUpload
        ? "Choose an image or video no larger than 50 MB."
        : "Choose an image no larger than 15 MB.",
    });
  }
});

function sanitizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    await requireAuthorizedPortalSession("admin");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = uploadRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ||
          "Choose a supported file within the upload size limit.",
      },
      { status: 400 }
    );
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase storage is not configured for uploads." },
      { status: 503 }
    );
  }

  const extension =
    sanitizeFilename(parsed.data.name.split(".").pop() || "") || "bin";
  const safeName =
    sanitizeFilename(parsed.data.name.replace(/\.[^.]+$/, "")) || "upload";
  const folder =
    parsed.data.folder === "gallery" ? "gallery" : "posts/gallery";
  const path =
    `${folder}/${safeName}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { data, error } = await client.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data?.token) {
    return NextResponse.json(
      { error: "The upload could not be prepared right now." },
      { status: 500 }
    );
  }

  const { data: publicData } = client.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  return NextResponse.json({
    bucket: STORAGE_BUCKET,
    path,
    token: data.token,
    url: publicData.publicUrl,
  });
}
