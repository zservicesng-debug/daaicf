import { NextResponse } from "next/server";
import { requireAuthorizedPortalSession } from "@/lib/auth/portal";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "site-media";
const DEFAULT_MAX_FILE_SIZE = 15 * 1024 * 1024;
const GALLERY_MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["editor", "gallery", "posts"]);

function sanitizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFolder(value: FormDataEntryValue | null) {
  const normalized = typeof value === "string" ? value : "";
  return ALLOWED_FOLDERS.has(normalized) ? normalized : "editor";
}

export async function POST(request: Request) {
  try {
    await requireAuthorizedPortalSession("admin");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase storage is not configured for uploads." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = getFolder(formData.get("folder"));
  const maxFileSize =
    folder === "gallery" ? GALLERY_MAX_FILE_SIZE : DEFAULT_MAX_FILE_SIZE;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Select a valid file before uploading." },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return NextResponse.json(
      { error: "Only image and video uploads are supported." },
      { status: 400 }
    );
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      {
        error: `Files larger than ${folder === "gallery" ? "50MB" : "15MB"} are not allowed.`,
      },
      { status: 400 }
    );
  }

  const extension = sanitizeFilename(file.name.split(".").pop() || "") || "bin";
  const safeName = sanitizeFilename(file.name.replace(/\.[^.]+$/, "")) || "upload";
  const path = `${folder}/${safeName}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    return NextResponse.json(
      { error: "The upload could not be completed right now." },
      { status: 500 }
    );
  }

  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    url: data.publicUrl,
    path,
  });
}
