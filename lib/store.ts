import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { resolveConfiguredSocialLinks } from "@/lib/site-config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import * as mockStore from "@/lib/mock-store";
import {
  createPlaceholderImage,
  excerpt,
  guessGalleryMediaTypeFromUrl,
  initialsFromName,
  slugify,
} from "@/lib/utils";
import {
  type ApplicationStatus,
  type ChatMember,
  type GalleryCollection,
  type ChatMessage,
  type ChatRoom,
  type Comment,
  type ContactMessage,
  type DashboardSnapshot,
  type GalleryImage,
  type GalleryMediaType,
  type HelpApplication,
  type MockCredentialUser,
  type PartnerApplication,
  type PartnerPermission,
  type PortalRole,
  type Post,
  type Project,
  type SettingsBundle,
  type SiteStore,
  type SponsorApplication,
  type SponsorProjectAccess,
  type TeamMember,
} from "@/types";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Post["category"];
  partner_name: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  cover_image_url: string;
  cover_image_path: string | null;
  gallery_image_urls: string[] | null;
  gallery_image_paths: string[] | null;
  published: boolean;
  show_on_home: boolean;
  created_at: string;
};

type GalleryRow = {
  id: string;
  image_url: string;
  image_path: string | null;
  collection_id: string;
  collection_title: string;
  media_type: GalleryMediaType;
  caption: string;
  album: GalleryImage["album"];
  gallery_year: number;
  created_at: string;
};

type GalleryYearRow = {
  year: number;
};

type CommentRow = {
  id: string;
  post_id: string;
  author_name: string;
  message: string;
  status: Comment["status"];
  created_at: string;
};

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type HelpApplicationRow = {
  id: string;
  name: string;
  phone: string;
  location: string;
  help_type: HelpApplication["helpType"];
  description: string;
  how_heard: string | null;
  evidence_image_urls: string[] | null;
  evidence_image_paths: string[] | null;
  status: HelpApplication["status"];
  created_at: string;
};

type SponsorApplicationRow = {
  id: string;
  name: string;
  org_name: string;
  email: string;
  phone: string;
  applicant_type: SponsorApplication["applicantType"];
  sponsorship_preference:
    | SponsorApplication["sponsorshipPreference"]
    | "All Projects"
    | "General Financial Support";
  sector_interests: SponsorApplication["sectorInterests"] | null;
  project_ids: string[] | null;
  budget_range: string;
  message: string | null;
  status: SponsorApplication["status"];
  created_at: string;
};

type PartnerApplicationRow = {
  id: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string;
  org_type: string;
  partnership_interests: PartnerApplication["partnershipInterests"] | null;
  description: string;
  website: string | null;
  status: PartnerApplication["status"];
  created_at: string;
};

type SiteSettingsRow = {
  id: string;
  organization_name: string;
  rc_number: string;
  tagline: string;
  country: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  facebook_url: string;
  twitter_url: string | null;
  instagram_url: string | null;
  communities_reached: number;
  beneficiaries_supported: number;
  events_held: number;
  years_of_service: number;
};

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  category: Project["category"];
  status: Project["status"];
  budget_goal: number;
  created_at: string;
};

type UserProfileRow = {
  id: string;
  role: PortalRole;
  display_name: string;
  org_name: string | null;
  email: string;
  phone: string;
  is_admin: boolean;
  status: MockCredentialUser["status"];
  created_at: string;
};

type SponsorAccessRow = {
  id: string;
  sponsor_user_id: string;
  project_id: string;
  granted_at: string;
};

type PartnerPermissionRow = {
  id: string;
  partner_user_id: string;
  permission_key: string;
  granted_at: string;
};

type ChatRoomRow = {
  id: string;
  name: string;
  type: ChatRoom["type"];
  created_by: string;
  allow_join_requests: boolean;
  linked_user_id: string;
  created_at: string;
};

type ChatMemberRow = {
  id: string;
  room_id: string;
  user_id: string;
  role: ChatMember["role"];
  joined_at: string;
};

type ChatMessageRow = {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type TeamMemberRow = {
  id: string;
  name: string;
  role: string;
  description: string;
  image_url: string | null;
  image_path: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "site-media";
const defaultStore = mockStore.getStore();
const MOCK_UNSET = Symbol("MOCK_UNSET");

function getAdminClient() {
  return createSupabaseAdminClient();
}

function usingSupabase() {
  return Boolean(getAdminClient());
}

function maybeUseMock<T>(callback: () => T): T | typeof MOCK_UNSET {
  if (!usingSupabase()) {
    return callback();
  }

  return MOCK_UNSET;
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    partnerName: row.partner_name || null,
    socialLinks: {
      facebookUrl: row.facebook_url || undefined,
      twitterUrl: row.twitter_url || undefined,
      instagramUrl: row.instagram_url || undefined,
    },
    coverImageUrl: row.cover_image_url,
    coverImagePath: row.cover_image_path,
    galleryImageUrls: row.gallery_image_urls || [],
    galleryImagePaths: row.gallery_image_paths || [],
    published: row.published,
    showOnHome: row.show_on_home,
    createdAt: row.created_at,
  };
}

function mapGallery(row: GalleryRow): GalleryImage {
  return {
    id: row.id,
    collectionId: row.collection_id,
    collectionTitle: row.collection_title,
    imageUrl: row.image_url,
    imagePath: row.image_path,
    mediaType: row.media_type,
    caption: row.caption,
    album: row.album,
    year: row.gallery_year,
    createdAt: row.created_at,
  };
}

function mapGalleryCollections(items: GalleryImage[]): GalleryCollection[] {
  const grouped = new Map<string, GalleryCollection>();

  for (const item of items) {
    const existing = grouped.get(item.collectionId);

    if (existing) {
      existing.items.push(item);
      if (item.createdAt < existing.createdAt) {
        existing.createdAt = item.createdAt;
      }
      continue;
    }

    grouped.set(item.collectionId, {
      id: item.collectionId,
      title: item.collectionTitle,
      album: item.album,
      year: item.year,
      items: [item],
      createdAt: item.createdAt,
    });
  }

  return Array.from(grouped.values())
    .map((collection) => ({
      ...collection,
      items: [...collection.items].sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt)
      ),
    }))
    .sort((left, right) => {
      const leftLatest = left.items[left.items.length - 1]?.createdAt || left.createdAt;
      const rightLatest =
        right.items[right.items.length - 1]?.createdAt || right.createdAt;

      return rightLatest.localeCompare(leftLatest);
    });
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorName: row.author_name,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapContactMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
  };
}

function mapHelpApplication(row: HelpApplicationRow): HelpApplication {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    location: row.location,
    helpType: row.help_type,
    description: row.description,
    howHeard: row.how_heard || undefined,
    evidenceImageUrls: row.evidence_image_urls || [],
    evidenceImagePaths: row.evidence_image_paths || [],
    status: row.status,
    createdAt: row.created_at,
  };
}

function normalizeSponsorPreference(
  value: SponsorApplicationRow["sponsorship_preference"]
): SponsorApplication["sponsorshipPreference"] {
  if (value === "Specific Project(s)" || value === "Specific Sector(s)") {
    return value;
  }

  return "General Support";
}

function mapSponsorApplication(row: SponsorApplicationRow): SponsorApplication {
  return {
    id: row.id,
    name: row.name,
    orgName: row.org_name,
    email: row.email,
    phone: row.phone,
    applicantType: row.applicant_type,
    sponsorshipPreference: normalizeSponsorPreference(row.sponsorship_preference),
    sectorInterests: row.sector_interests || [],
    projectIds: row.project_ids || [],
    budgetRange: row.budget_range,
    message: row.message || undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapPartnerApplication(row: PartnerApplicationRow): PartnerApplication {
  return {
    id: row.id,
    orgName: row.org_name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    orgType: row.org_type,
    partnershipInterests: row.partnership_interests || [],
    description: row.description,
    website: row.website || undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapSettings(row?: SiteSettingsRow | null): SettingsBundle {
  if (!row) {
    return defaultStore.settings;
  }

  const socialLinks = resolveConfiguredSocialLinks({
    facebookUrl: row.facebook_url || "",
    twitterUrl: row.twitter_url || "",
    instagramUrl: row.instagram_url || "",
  });

  return {
    impact: {
      communitiesReached: row.communities_reached,
      beneficiariesSupported: row.beneficiaries_supported,
      eventsHeld: row.events_held,
      yearsOfService: row.years_of_service,
    },
    contact: {
      email: row.contact_email,
      phone: row.contact_phone,
      address: row.contact_address,
      facebookUrl: socialLinks.facebookUrl,
      twitterUrl: socialLinks.twitterUrl,
      instagramUrl: socialLinks.instagramUrl,
    },
    organization: {
      name: row.organization_name,
      rcNumber: row.rc_number,
      tagline: row.tagline,
      country: row.country,
    },
  };
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    budgetGoal: Number(row.budget_goal),
    createdAt: row.created_at,
  };
}

function mapUser(row: UserProfileRow): MockCredentialUser {
  return {
    id: row.id,
    role: row.role,
    displayName: row.display_name,
    orgName: row.org_name || undefined,
    email: row.email,
    phone: row.phone,
    isAdmin: row.is_admin,
    status: row.status,
    createdAt: row.created_at,
    password: "",
  };
}

function mapSponsorAccess(row: SponsorAccessRow): SponsorProjectAccess {
  return {
    id: row.id,
    sponsorUserId: row.sponsor_user_id,
    projectId: row.project_id,
    grantedAt: row.granted_at,
  };
}

function mapPartnerPermission(row: PartnerPermissionRow): PartnerPermission {
  return {
    id: row.id,
    partnerUserId: row.partner_user_id,
    permissionKey: row.permission_key,
    grantedAt: row.granted_at,
  };
}

function mapChatRoom(row: ChatRoomRow): ChatRoom {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    createdBy: row.created_by,
    allowJoinRequests: row.allow_join_requests,
    linkedUserId: row.linked_user_id,
    createdAt: row.created_at,
  };
}

function mapChatMember(row: ChatMemberRow): ChatMember {
  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
  };
}

function mapChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    roomId: row.room_id,
    senderId: row.sender_id,
    message: row.message,
    createdAt: row.created_at,
  };
}

function mapTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    initials: initialsFromName(row.name),
    name: row.name,
    role: row.role,
    description: row.description,
    imageUrl: row.image_url,
    imagePath: row.image_path,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function sortTeamMembers(members: TeamMember[]) {
  return [...members].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}

function makePostPlaceholder(title: string, category: Post["category"]) {
  return createPlaceholderImage({
    title,
    subtitle: category,
    accent: category === "Health" ? "#C41E1E" : "#1A5C2A",
  });
}

function sanitizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFormFile(value: unknown) {
  return value instanceof File && value.size > 0 ? value : null;
}

function getFormFiles(values: unknown[]) {
  return values.filter((value): value is File => value instanceof File && value.size > 0);
}

async function uploadStorageFile(folder: string, slug: string, file: File) {
  const client = getAdminClient();
  if (!client) {
    return null;
  }

  const extension = sanitizeFilename(file.name.split(".").pop() || "") || "bin";
  const safeSlug = sanitizeFilename(slug) || "upload";
  const path = `${folder}/${safeSlug}-${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

async function uploadStorageFiles(folder: string, slug: string, files: File[]) {
  const uploads = await Promise.all(
    files.map((file, index) => uploadStorageFile(folder, `${slug}-${index + 1}`, file))
  );

  return uploads.filter(
    (upload): upload is { path: string; publicUrl: string } => Boolean(upload)
  );
}

async function removeStorageFile(path?: string | null) {
  if (!path) {
    return;
  }

  const client = getAdminClient();
  if (!client) {
    return;
  }

  const { error } = await client.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    throw error;
  }
}

async function removeStorageFiles(paths?: string[] | null) {
  if (!paths || paths.length === 0) {
    return;
  }

  await Promise.all(paths.map((path) => removeStorageFile(path)));
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  const client = getAdminClient();
  if (!client) {
    return baseSlug;
  }

  let candidate = baseSlug;
  let suffix = 2;

  for (;;) {
    const { data } = await client
      .from("posts")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle()
      .throwOnError();

    if (!data || data.id === excludeId) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function resolvePostImage(options: {
  title: string;
  category: Post["category"];
  coverImageFile?: File | null;
  coverImageLink?: string;
  existingUrl?: string;
  existingPath?: string | null;
}) {
  const nextFile = options.coverImageFile;
  const nextLink = options.coverImageLink?.trim();

  if (nextFile && usingSupabase()) {
    const uploaded = await uploadStorageFile("posts", options.title, nextFile);
    if (uploaded) {
      return {
        coverImageUrl: uploaded.publicUrl,
        coverImagePath: uploaded.path,
        oldPathToDelete: options.existingPath,
      };
    }
  }

  if (nextLink) {
    return {
      coverImageUrl: nextLink,
      coverImagePath: null,
      oldPathToDelete: options.existingPath,
    };
  }

  if (options.existingUrl) {
    return {
      coverImageUrl: options.existingUrl,
      coverImagePath: options.existingPath || null,
      oldPathToDelete: null,
    };
  }

  return {
    coverImageUrl: makePostPlaceholder(options.title, options.category),
    coverImagePath: null,
    oldPathToDelete: options.existingPath,
  };
}

async function resolveTeamMemberImage(options: {
  name: string;
  imageFile?: File | null;
  imageLink?: string;
  existingUrl?: string | null;
  existingPath?: string | null;
  clearExisting?: boolean;
}) {
  const nextFile = options.imageFile;
  const nextLink = options.imageLink?.trim();
  const clearExisting = options.clearExisting === true;

  if (nextFile && usingSupabase()) {
    const uploaded = await uploadStorageFile("team", options.name, nextFile);
    if (uploaded) {
      return {
        imageUrl: uploaded.publicUrl,
        imagePath: uploaded.path,
        oldPathToDelete: options.existingPath,
      };
    }
  }

  if (nextFile) {
    return {
      imageUrl: createPlaceholderImage({
        title: options.name,
        subtitle: "Team member portrait",
        accent: "#1A5C2A",
        background: "#48667D",
      }),
      imagePath: null,
      oldPathToDelete: options.existingPath,
    };
  }

  if (nextLink) {
    return {
      imageUrl: nextLink,
      imagePath: null,
      oldPathToDelete: options.existingPath,
    };
  }

  if (clearExisting) {
    return {
      imageUrl: null,
      imagePath: null,
      oldPathToDelete: options.existingPath,
    };
  }

  return {
    imageUrl: options.existingUrl || null,
    imagePath: options.existingPath || null,
    oldPathToDelete: null,
  };
}

async function resolvePostGalleryImages(options: {
  title: string;
  galleryImageFiles?: File[];
  galleryImageLinks?: string[];
  existingUrls?: string[];
  existingPaths?: string[];
  clearExisting?: boolean;
}) {
  const nextFiles = options.galleryImageFiles || [];
  const nextLinks = (options.galleryImageLinks || []).map((link) => link.trim()).filter(Boolean);
  const existingUrls = options.clearExisting ? [] : options.existingUrls || [];
  const existingPaths = options.clearExisting ? [] : options.existingPaths || [];
  const oldPathsToDelete = options.clearExisting ? options.existingPaths || [] : [];

  if (nextFiles.length === 0 && nextLinks.length === 0) {
    if (options.clearExisting) {
      return {
        galleryImageUrls: [],
        galleryImagePaths: [],
        oldPathsToDelete,
      };
    }

    return {
      galleryImageUrls: existingUrls,
      galleryImagePaths: existingPaths,
      oldPathsToDelete: [],
    };
  }

  if (nextFiles.length > 0 && usingSupabase()) {
    const uploaded = await uploadStorageFiles("posts/gallery", options.title, nextFiles);
    return {
      galleryImageUrls: [
        ...existingUrls,
        ...nextLinks,
        ...uploaded.map((item) => item.publicUrl),
      ],
      galleryImagePaths: [...existingPaths, ...uploaded.map((item) => item.path)],
      oldPathsToDelete,
    };
  }

  if (nextFiles.length > 0) {
    return {
      galleryImageUrls: [
        ...existingUrls,
        ...nextLinks,
        ...nextFiles.map((file, index) =>
          createPlaceholderImage({
            title: `${options.title} ${index + 1}`,
            subtitle: "More photos",
            accent: "#1A5C2A",
          })
        ),
      ],
      galleryImagePaths: existingPaths,
      oldPathsToDelete,
    };
  }

  return {
    galleryImageUrls: [...existingUrls, ...nextLinks],
    galleryImagePaths: existingPaths,
    oldPathsToDelete,
  };
}

async function resolveHelpEvidenceImages(options: {
  applicantName: string;
  evidenceImageFiles?: File[];
}) {
  const nextFiles = options.evidenceImageFiles || [];

  if (nextFiles.length > 0 && usingSupabase()) {
    const uploaded = await uploadStorageFiles(
      "applications/evidence",
      options.applicantName,
      nextFiles
    );

    return {
      evidenceImageUrls: uploaded.map((item) => item.publicUrl),
      evidenceImagePaths: uploaded.map((item) => item.path),
    };
  }

  if (nextFiles.length > 0) {
    return {
      evidenceImageUrls: nextFiles.map((_, index) =>
        createPlaceholderImage({
          title: `${options.applicantName} Evidence ${index + 1}`,
          subtitle: "Help application",
          accent: "#4A6650",
        })
      ),
      evidenceImagePaths: [],
    };
  }

  return {
    evidenceImageUrls: [],
    evidenceImagePaths: [],
  };
}

function detectGalleryMediaTypeFromFile(file: File): GalleryMediaType {
  if (file.type.startsWith("video/")) {
    return "video";
  }

  return "image";
}

type GalleryLinkInput = {
  url: string;
  type: GalleryMediaType;
};

type ResolvedGalleryMediaInput = {
  imageUrl: string;
  imagePath: string | null;
  mediaType: GalleryMediaType;
  caption: string;
};

async function resolveGalleryMediaInputs(options: {
  title: string;
  mediaFiles?: File[];
  mediaLinks?: GalleryLinkInput[];
}) {
  const mediaFiles = options.mediaFiles || [];
  const mediaLinks = options.mediaLinks || [];
  const uploads: ResolvedGalleryMediaInput[] = [];

  for (const [index, link] of mediaLinks.entries()) {
    uploads.push({
      imageUrl: link.url.trim(),
      imagePath: null,
      mediaType: link.type || guessGalleryMediaTypeFromUrl(link.url),
      caption: `${options.title} ${index + 1}`,
    });
  }

  if (mediaFiles.length > 0 && usingSupabase()) {
    const uploaded = await Promise.all(
      mediaFiles.map(async (file, index) => {
        const stored = await uploadStorageFile(
          "gallery",
          `${options.title}-${index + 1}`,
          file
        );

        if (!stored) {
          return null;
        }

        return {
          imageUrl: stored.publicUrl,
          imagePath: stored.path,
          mediaType: detectGalleryMediaTypeFromFile(file),
          caption: file.name || `${options.title} ${index + 1}`,
        };
      })
    );

    const uploadedItems = uploaded.filter(
      (item): item is NonNullable<(typeof uploaded)[number]> => item !== null
    );

    uploads.push(...uploadedItems);
  } else if (mediaFiles.length > 0) {
    uploads.push(
      ...mediaFiles.map((file, index) => ({
        imageUrl: createPlaceholderImage({
          title: `${options.title} ${index + 1}`,
          subtitle: detectGalleryMediaTypeFromFile(file) === "video" ? "Video" : "Image",
          accent: "#1A5C2A",
        }),
        imagePath: null,
        mediaType: detectGalleryMediaTypeFromFile(file),
        caption: file.name || `${options.title} ${index + 1}`,
      }))
    );
  }

  return uploads;
}

async function fetchSettings() {
  const client = getAdminClient();
  if (!client) {
    return defaultStore.settings;
  }

  const { data } = await client
    .from("site_settings")
    .select("*")
    .eq("id", "primary")
    .maybeSingle()
    .throwOnError();

  return mapSettings(data as SiteSettingsRow | null);
}

async function fetchAllUsers() {
  const client = getAdminClient();
  if (!client) {
    return defaultStore.users;
  }

  const { data } = await client
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .throwOnError();

  return (data as UserProfileRow[]).map(mapUser);
}

async function fetchTeamMembers() {
  const client = getAdminClient();
  if (!client) {
    return defaultStore.teamMembers;
  }

  const { data } = await client
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .throwOnError();

  return sortTeamMembers((data as TeamMemberRow[]).map(mapTeamMember));
}

export async function getStore(): Promise<SiteStore> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getStore());
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return defaultStore;
  }

  const [
    settings,
    postsResult,
    galleryResult,
    commentsResult,
    contactMessagesResult,
    applicationsResult,
    sponsorApplicationsResult,
    partnerApplicationsResult,
    projectsResult,
    users,
    teamMembers,
    sponsorAccessResult,
    partnerPermissionsResult,
    chatRoomsResult,
    chatMembersResult,
    chatMessagesResult,
  ] = await Promise.all([
    fetchSettings(),
    client.from("posts").select("*").order("created_at", { ascending: false }).throwOnError(),
    client
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false })
      .throwOnError(),
    client.from("comments").select("*").order("created_at", { ascending: false }).throwOnError(),
    client
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .throwOnError(),
    client
      .from("help_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .throwOnError(),
    client
      .from("sponsor_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .throwOnError(),
    client
      .from("partner_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .throwOnError(),
    client.from("projects").select("*").order("created_at", { ascending: false }).throwOnError(),
    fetchAllUsers(),
    fetchTeamMembers(),
    client
      .from("sponsor_project_access")
      .select("*")
      .order("granted_at", { ascending: false })
      .throwOnError(),
    client
      .from("partner_permissions")
      .select("*")
      .order("granted_at", { ascending: false })
      .throwOnError(),
    client.from("chat_rooms").select("*").order("created_at", { ascending: false }).throwOnError(),
    client
      .from("chat_members")
      .select("*")
      .order("joined_at", { ascending: false })
      .throwOnError(),
    client
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .throwOnError(),
  ]);

  return {
    settings,
    posts: (postsResult.data as PostRow[]).map(mapPost),
    gallery: (galleryResult.data as GalleryRow[]).map(mapGallery),
    comments: (commentsResult.data as CommentRow[]).map(mapComment),
    contactMessages: (contactMessagesResult.data as ContactMessageRow[]).map(
      mapContactMessage
    ),
    applications: (applicationsResult.data as HelpApplicationRow[]).map(
      mapHelpApplication
    ),
    sponsorApplications: (
      sponsorApplicationsResult.data as SponsorApplicationRow[]
    ).map(mapSponsorApplication),
    partnerApplications: (
      partnerApplicationsResult.data as PartnerApplicationRow[]
    ).map(mapPartnerApplication),
    projects: (projectsResult.data as ProjectRow[]).map(mapProject),
    users,
    teamMembers,
    sponsorAccess: (sponsorAccessResult.data as SponsorAccessRow[]).map(
      mapSponsorAccess
    ),
    partnerPermissions: (
      partnerPermissionsResult.data as PartnerPermissionRow[]
    ).map(mapPartnerPermission),
    chatRooms: (chatRoomsResult.data as ChatRoomRow[]).map(mapChatRoom),
    chatMembers: (chatMembersResult.data as ChatMemberRow[]).map(mapChatMember),
    chatMessages: (chatMessagesResult.data as ChatMessageRow[]).map(mapChatMessage),
  };
}

export async function listPosts(options?: {
  category?: string;
  page?: number;
  perPage?: number;
  publishedOnly?: boolean;
  homeOnly?: boolean;
}): Promise<{ items: Post[]; totalPages: number }> {
  noStore();

  const mock = maybeUseMock(() => mockStore.listPosts(options));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.listPosts(options);
  }

  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 6;
  const from = Math.max(0, (page - 1) * perPage);
  const to = from + perPage - 1;

  let query = client.from("posts").select("*", { count: "exact" });
  if (options?.category && options.category !== "All") {
    query = query.eq("category", options.category);
  }
  if (options?.publishedOnly) {
    query = query.eq("published", true);
  }
  if (options?.homeOnly) {
    query = query.eq("show_on_home", true);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)
    .throwOnError();

  const totalItems = count || 0;

  return {
    items: (data as PostRow[]).map(mapPost),
    totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getPostBySlug(slug));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getPostBySlug(slug);
  }

  const { data } = await client
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
    .throwOnError();

  return data ? mapPost(data as PostRow) : null;
}

export async function createPost(input: {
  title: string;
  category: Post["category"];
  partnerName?: string | null;
  content: string;
  socialLinks: Post["socialLinks"];
  published: boolean;
  showOnHome: boolean;
  coverImageFile?: File | null;
  coverImageLink?: string;
  galleryImageFiles?: File[];
  galleryImageLinks?: string[];
}) {
  const mock = maybeUseMock(() =>
    mockStore.createPost({
      title: input.title,
      category: input.category,
      partnerName: input.partnerName,
      content: input.content,
      socialLinks: input.socialLinks,
      published: input.published,
      showOnHome: input.showOnHome,
      coverImageFile: input.coverImageFile,
      coverImageLink: input.coverImageLink,
      galleryImageFiles: input.galleryImageFiles,
      galleryImageLinks: input.galleryImageLinks,
    })
  );
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.createPost({
      title: input.title,
      category: input.category,
      partnerName: input.partnerName,
      content: input.content,
      socialLinks: input.socialLinks,
      published: input.published,
      showOnHome: input.showOnHome,
      coverImageFile: input.coverImageFile,
      coverImageLink: input.coverImageLink,
      galleryImageFiles: input.galleryImageFiles,
      galleryImageLinks: input.galleryImageLinks,
    });
  }

  const title = input.title.trim();
  const slug = await ensureUniqueSlug(slugify(title));
  const image = await resolvePostImage({
    title,
    category: input.category,
    coverImageFile: input.coverImageFile,
    coverImageLink: input.coverImageLink,
  });
  const gallery = await resolvePostGalleryImages({
    title,
    galleryImageFiles: input.galleryImageFiles,
    galleryImageLinks: input.galleryImageLinks,
  });

  const { data } = await client
    .from("posts")
    .insert({
      title,
      slug,
      excerpt: excerpt(input.content, 160),
      content: input.content,
      category: input.category,
      partner_name: input.partnerName?.trim() || null,
      facebook_url: input.socialLinks.facebookUrl?.trim() || null,
      twitter_url: input.socialLinks.twitterUrl?.trim() || null,
      instagram_url: input.socialLinks.instagramUrl?.trim() || null,
      cover_image_url: image.coverImageUrl,
      cover_image_path: image.coverImagePath,
      gallery_image_urls: gallery.galleryImageUrls,
      gallery_image_paths: gallery.galleryImagePaths,
      published: input.published,
      show_on_home: input.showOnHome,
    })
    .select("*")
    .single()
    .throwOnError();

  return mapPost(data as PostRow);
}

export async function updatePost(
  slug: string,
  input: {
    title: string;
    category: Post["category"];
    partnerName?: string | null;
    content: string;
    socialLinks: Post["socialLinks"];
    published: boolean;
    showOnHome: boolean;
    coverImageFile?: File | null;
    coverImageLink?: string;
    galleryImageFiles?: File[];
    galleryImageLinks?: string[];
    clearGalleryImages?: boolean;
  }
) {
  const mock = maybeUseMock(() =>
    mockStore.updatePost(slug, {
      title: input.title,
      category: input.category,
      partnerName: input.partnerName,
      content: input.content,
      socialLinks: input.socialLinks,
      published: input.published,
      showOnHome: input.showOnHome,
      coverImageFile: input.coverImageFile,
      coverImageLink: input.coverImageLink,
      galleryImageFiles: input.galleryImageFiles,
      galleryImageLinks: input.galleryImageLinks,
      clearGalleryImages: input.clearGalleryImages,
    })
  );
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updatePost(slug, {
      title: input.title,
      category: input.category,
      partnerName: input.partnerName,
      content: input.content,
      socialLinks: input.socialLinks,
      published: input.published,
      showOnHome: input.showOnHome,
      coverImageFile: input.coverImageFile,
      coverImageLink: input.coverImageLink,
      galleryImageFiles: input.galleryImageFiles,
      galleryImageLinks: input.galleryImageLinks,
      clearGalleryImages: input.clearGalleryImages,
    });
  }

  const { data: existing } = await client
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
    .throwOnError();

  if (!existing) {
    return null;
  }

  const title = input.title.trim();
  const nextSlug = await ensureUniqueSlug(slugify(title), (existing as PostRow).id);
  const image = await resolvePostImage({
    title,
    category: input.category,
    coverImageFile: input.coverImageFile,
    coverImageLink: input.coverImageLink,
    existingUrl: (existing as PostRow).cover_image_url,
    existingPath: (existing as PostRow).cover_image_path,
  });
  const gallery = await resolvePostGalleryImages({
    title,
    galleryImageFiles: input.galleryImageFiles,
    galleryImageLinks: input.galleryImageLinks,
    existingUrls: (existing as PostRow).gallery_image_urls || [],
    existingPaths: (existing as PostRow).gallery_image_paths || [],
    clearExisting: input.clearGalleryImages,
  });

  const { data } = await client
    .from("posts")
    .update({
      title,
      slug: nextSlug,
      excerpt: excerpt(input.content, 160),
      content: input.content,
      category: input.category,
      partner_name: input.partnerName?.trim() || null,
      facebook_url: input.socialLinks.facebookUrl?.trim() || null,
      twitter_url: input.socialLinks.twitterUrl?.trim() || null,
      instagram_url: input.socialLinks.instagramUrl?.trim() || null,
      cover_image_url: image.coverImageUrl,
      cover_image_path: image.coverImagePath,
      gallery_image_urls: gallery.galleryImageUrls,
      gallery_image_paths: gallery.galleryImagePaths,
      published: input.published,
      show_on_home: input.showOnHome,
    })
    .eq("id", (existing as PostRow).id)
    .select("*")
    .single()
    .throwOnError();

  if (image.oldPathToDelete && image.oldPathToDelete !== image.coverImagePath) {
    await removeStorageFile(image.oldPathToDelete);
  }
  if (gallery.oldPathsToDelete.length > 0) {
    await removeStorageFiles(gallery.oldPathsToDelete);
  }

  return mapPost(data as PostRow);
}

export async function deletePost(slug: string) {
  const mock = maybeUseMock(() => mockStore.deletePost(slug));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.deletePost(slug);
  }

  const { data: existing } = await client
    .from("posts")
    .select("id, cover_image_path, gallery_image_paths")
    .eq("slug", slug)
    .maybeSingle()
    .throwOnError();

  if (!existing) {
    return;
  }

  await client.from("posts").delete().eq("id", existing.id).throwOnError();
  await removeStorageFile(existing.cover_image_path as string | null);
  await removeStorageFiles((existing.gallery_image_paths as string[] | null) || []);
}

export async function listGallery(options?: {
  album?: string;
  year?: number;
  collectionId?: string;
}): Promise<GalleryImage[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.listGallery(options));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.listGallery(options);
  }

  let query = client.from("gallery_images").select("*");
  if (options?.album && options.album !== "All") {
    query = query.eq("album", options.album);
  }
  if (options?.year) {
    query = query.eq("gallery_year", options.year);
  }
  if (options?.collectionId) {
    query = query.eq("collection_id", options.collectionId);
  }

  const { data } = await query
    .order("created_at", { ascending: false })
    .throwOnError();

  return (data as GalleryRow[]).map(mapGallery);
}

export async function listGalleryCollections(options?: {
  album?: string;
  year?: number;
}): Promise<GalleryCollection[]> {
  noStore();

  const items = await listGallery(options);
  return mapGalleryCollections(items);
}

export async function listGalleryYears(): Promise<number[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.listGalleryYears());
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.listGalleryYears();
  }

  const { data } = await client
    .from("gallery_years")
    .select("year")
    .order("year", { ascending: false })
    .throwOnError();

  return (data as GalleryYearRow[]).map((row) => Number(row.year));
}

async function galleryYearExists(year: number) {
  const client = getAdminClient();
  if (!client) {
    return false;
  }

  const { data } = await client
    .from("gallery_years")
    .select("year")
    .eq("year", year)
    .maybeSingle()
    .throwOnError();

  return Boolean(data);
}

export async function getGalleryCollectionById(
  collectionId: string
): Promise<GalleryCollection | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getGalleryCollectionById(collectionId));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const items = await listGallery({ collectionId });
  const collections = mapGalleryCollections(items);
  return collections[0] || null;
}

export async function createGalleryCollection(input: {
  title: string;
  album: SiteStore["gallery"][number]["album"];
  year: number;
  mediaFiles?: File[];
  mediaLinks?: GalleryLinkInput[];
}) {
  const mock = maybeUseMock(() =>
    mockStore.createGalleryCollection({
      title: input.title,
      album: input.album,
      year: input.year,
      mediaFiles: input.mediaFiles,
      mediaLinks: input.mediaLinks,
    })
  );
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.createGalleryCollection({
      title: input.title,
      album: input.album,
      year: input.year,
      mediaFiles: input.mediaFiles,
      mediaLinks: input.mediaLinks,
    });
  }

  const yearExists = await galleryYearExists(input.year);
  if (!yearExists) {
    throw new Error(
      `Gallery year ${input.year} is not available yet. Add the year first, then upload the collection media.`
    );
  }

  const collectionId = crypto.randomUUID();
  const media = await resolveGalleryMediaInputs({
    title: input.title,
    mediaFiles: input.mediaFiles,
    mediaLinks: input.mediaLinks,
  });

  if (media.length === 0) {
    throw new Error("Add at least one image or video before saving the collection.");
  }

  const { data } = await client
    .from("gallery_images")
    .insert(
      media.map((item) => ({
        image_url: item.imageUrl,
        image_path: item.imagePath,
        caption: item.caption,
        collection_id: collectionId,
        collection_title: input.title,
        media_type: item.mediaType,
        album: input.album,
        gallery_year: input.year,
      }))
    )
    .select("*")
    .throwOnError();

  return mapGalleryCollections((data as GalleryRow[]).map(mapGallery))[0];
}

export async function updateGalleryCollection(
  collectionId: string,
  input: {
    title: string;
    album: SiteStore["gallery"][number]["album"];
    year: number;
  }
) {
  const mock = maybeUseMock(() =>
    mockStore.updateGalleryCollection(collectionId, input)
  );
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updateGalleryCollection(collectionId, input);
  }

  const yearExists = await galleryYearExists(input.year);
  if (!yearExists) {
    throw new Error(
      `Gallery year ${input.year} is not available yet. Add the year first, then save the collection.`
    );
  }

  await client
    .from("gallery_images")
    .update({
      collection_title: input.title,
      album: input.album,
      gallery_year: input.year,
    })
    .eq("collection_id", collectionId)
    .throwOnError();

  return getGalleryCollectionById(collectionId);
}

export async function addGalleryCollectionMedia(
  collectionId: string,
  input: {
    mediaFiles?: File[];
    mediaLinks?: GalleryLinkInput[];
  }
) {
  const mock = maybeUseMock(() =>
    mockStore.addGalleryCollectionMedia(collectionId, input)
  );
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.addGalleryCollectionMedia(collectionId, input);
  }

  const collection = await getGalleryCollectionById(collectionId);
  if (!collection) {
    throw new Error("We could not find that gallery collection.");
  }

  const media = await resolveGalleryMediaInputs({
    title: collection.title,
    mediaFiles: input.mediaFiles,
    mediaLinks: input.mediaLinks,
  });

  if (media.length === 0) {
    throw new Error("Add at least one image or video before updating the collection.");
  }

  await client
    .from("gallery_images")
    .insert(
      media.map((item) => ({
        image_url: item.imageUrl,
        image_path: item.imagePath,
        caption: item.caption,
        collection_id: collection.id,
        collection_title: collection.title,
        media_type: item.mediaType,
        album: collection.album,
        gallery_year: collection.year,
      }))
    )
    .throwOnError();

  return getGalleryCollectionById(collectionId);
}

export async function addGalleryYear(year: number) {
  const mock = maybeUseMock(() => mockStore.addGalleryYear(year));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.addGalleryYear(year);
  }

  const { data: existing } = await client
    .from("gallery_years")
    .select("year")
    .eq("year", year)
    .maybeSingle()
    .throwOnError();

  if (existing) {
    throw new Error(`Gallery year ${year} already exists.`);
  }

  await client.from("gallery_years").insert({ year }).throwOnError();
  return year;
}

export async function removeGalleryItem(id: string) {
  const mock = maybeUseMock(() => mockStore.removeGalleryItem(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.removeGalleryItem(id);
  }

  const { data: existing } = await client
    .from("gallery_images")
    .select("id, image_path, collection_id")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  if (!existing) {
    return;
  }

  await client.from("gallery_images").delete().eq("id", id).throwOnError();
  await removeStorageFile(existing.image_path as string | null);

  const { count } = await client
    .from("gallery_images")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", existing.collection_id as string)
    .throwOnError();

  if ((count || 0) === 0) {
    return;
  }
}

export async function removeGalleryCollection(collectionId: string) {
  const mock = maybeUseMock(() =>
    mockStore.removeGalleryCollection(collectionId)
  );
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.removeGalleryCollection(collectionId);
  }

  const { data } = await client
    .from("gallery_images")
    .select("id, image_path")
    .eq("collection_id", collectionId)
    .throwOnError();

  const rows = (data as Array<{ id: string; image_path: string | null }>) || [];
  if (rows.length === 0) {
    return;
  }

  await client
    .from("gallery_images")
    .delete()
    .eq("collection_id", collectionId)
    .throwOnError();
  await removeStorageFiles(rows.map((row) => row.image_path).filter(Boolean) as string[]);
}

export async function removeGalleryYear(year: number) {
  const mock = maybeUseMock(() => mockStore.removeGalleryYear(year));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.removeGalleryYear(year);
  }

  const { count } = await client
    .from("gallery_images")
    .select("id", { count: "exact", head: true })
    .eq("gallery_year", year)
    .throwOnError();

  if ((count || 0) > 0) {
    throw new Error(
      `Gallery year ${year} still has ${count} media item${count === 1 ? "" : "s"} assigned to it. Delete those collection item${count === 1 ? "" : "s"} first.`
    );
  }

  await client.from("gallery_years").delete().eq("year", year).throwOnError();
  return year;
}

export async function listComments(postId?: string): Promise<Comment[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.listComments(postId));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.listComments(postId);
  }

  let query = client.from("comments").select("*");
  if (postId) {
    query = query.eq("post_id", postId);
  }

  const { data } = await query
    .order("created_at", { ascending: false })
    .throwOnError();

  return (data as CommentRow[]).map(mapComment);
}

export async function addComment(
  input: Pick<Comment, "postId" | "authorName" | "message">
) {
  const mock = maybeUseMock(() => mockStore.addComment(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.addComment(input);
  }

  const { data } = await client
    .from("comments")
    .insert({
      post_id: input.postId,
      author_name: input.authorName,
      message: input.message,
      status: "pending",
    })
    .select("*")
    .single()
    .throwOnError();

  return mapComment(data as CommentRow);
}

export async function updateCommentStatus(id: string, status: Comment["status"]) {
  const mock = maybeUseMock(() => mockStore.updateCommentStatus(id, status));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updateCommentStatus(id, status);
  }

  const { data } = await client
    .from("comments")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle()
    .throwOnError();

  return data ? mapComment(data as CommentRow) : null;
}

export async function deleteComment(id: string) {
  const mock = maybeUseMock(() => mockStore.deleteComment(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.deleteComment(id);
  }

  await client.from("comments").delete().eq("id", id).throwOnError();
}

export async function addContactMessage(input: {
  name: string;
  email: string;
  message: string;
}) {
  const mock = maybeUseMock(() => mockStore.addContactMessage(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.addContactMessage(input);
  }

  const { data } = await client
    .from("contact_messages")
    .insert(input)
    .select("*")
    .single()
    .throwOnError();

  return mapContactMessage(data as ContactMessageRow);
}

export async function addHelpApplication(
  input: Omit<
    HelpApplication,
    "id" | "status" | "createdAt" | "evidenceImageUrls" | "evidenceImagePaths"
  > & {
    evidenceImageFiles?: File[];
  }
) {
  const mock = maybeUseMock(() => mockStore.addHelpApplication(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.addHelpApplication(input);
  }

  const evidence = await resolveHelpEvidenceImages({
    applicantName: input.name,
    evidenceImageFiles: input.evidenceImageFiles,
  });

  const { data } = await client
    .from("help_applications")
    .insert({
      name: input.name,
      phone: input.phone,
      location: input.location,
      help_type: input.helpType,
      description: input.description,
      how_heard: input.howHeard || null,
      evidence_image_urls: evidence.evidenceImageUrls,
      evidence_image_paths: evidence.evidenceImagePaths,
      status: "new",
    })
    .select("*")
    .single()
    .throwOnError();

  return mapHelpApplication(data as HelpApplicationRow);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
) {
  const mock = maybeUseMock(() => mockStore.updateApplicationStatus(id, status));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updateApplicationStatus(id, status);
  }

  const { data } = await client
    .from("help_applications")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle()
    .throwOnError();

  return data ? mapHelpApplication(data as HelpApplicationRow) : null;
}

export async function deleteHelpApplication(id: string) {
  const mock = maybeUseMock(() => mockStore.deleteHelpApplication(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.deleteHelpApplication(id);
  }

  const { data: existing } = await client
    .from("help_applications")
    .select("id, evidence_image_paths")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  if (!existing) {
    return;
  }

  await client.from("help_applications").delete().eq("id", id).throwOnError();
  await removeStorageFiles((existing.evidence_image_paths as string[] | null) || []);
}

export async function getApplicationById(
  id: string
): Promise<HelpApplication | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getApplicationById(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getApplicationById(id);
  }

  const { data } = await client
    .from("help_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return data ? mapHelpApplication(data as HelpApplicationRow) : null;
}

export async function addSponsorApplication(
  input: Omit<SponsorApplication, "id" | "status" | "createdAt">
) {
  const mock = maybeUseMock(() => mockStore.addSponsorApplication(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.addSponsorApplication(input);
  }

  const { data } = await client
    .from("sponsor_applications")
    .insert({
      name: input.name,
      org_name: input.orgName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      applicant_type: input.applicantType,
      sponsorship_preference: input.sponsorshipPreference,
      sector_interests: input.sectorInterests,
      project_ids: input.projectIds,
      budget_range: input.budgetRange,
      message: input.message || null,
      status: "pending",
    })
    .select("*")
    .single()
    .throwOnError();

  return mapSponsorApplication(data as SponsorApplicationRow);
}

export async function updateSponsorApplication(
  id: string,
  input: Partial<Omit<SponsorApplication, "id" | "createdAt">>
) {
  const mock = maybeUseMock(() => mockStore.updateSponsorApplication(id, input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updateSponsorApplication(id, input);
  }

  const payload: Record<string, unknown> = {};
  if (input.status) {
    payload.status = input.status;
  }
  if (input.projectIds) {
    payload.project_ids = input.projectIds;
  }
  if (input.sectorInterests) {
    payload.sector_interests = input.sectorInterests;
  }

  const { data } = await client
    .from("sponsor_applications")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle()
    .throwOnError();

  return data ? mapSponsorApplication(data as SponsorApplicationRow) : null;
}

export async function getSponsorApplicationById(
  id: string
): Promise<SponsorApplication | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getSponsorApplicationById(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getSponsorApplicationById(id);
  }

  const { data } = await client
    .from("sponsor_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return data ? mapSponsorApplication(data as SponsorApplicationRow) : null;
}

export async function deleteSponsorApplication(id: string) {
  const mock = maybeUseMock(() => mockStore.deleteSponsorApplication(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.deleteSponsorApplication(id);
  }

  await client.from("sponsor_applications").delete().eq("id", id).throwOnError();
}

export async function addPartnerApplication(
  input: Omit<PartnerApplication, "id" | "status" | "createdAt">
) {
  const mock = maybeUseMock(() => mockStore.addPartnerApplication(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.addPartnerApplication(input);
  }

  const { data } = await client
    .from("partner_applications")
    .insert({
      org_name: input.orgName,
      contact_name: input.contactName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      org_type: input.orgType,
      website: input.website || null,
      description: input.description,
      partnership_interests: input.partnershipInterests,
      status: "pending",
    })
    .select("*")
    .single()
    .throwOnError();

  return mapPartnerApplication(data as PartnerApplicationRow);
}

export async function updatePartnerApplication(
  id: string,
  input: Partial<Omit<PartnerApplication, "id" | "createdAt">>
) {
  const mock = maybeUseMock(() => mockStore.updatePartnerApplication(id, input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updatePartnerApplication(id, input);
  }

  const payload: Record<string, unknown> = {};
  if (input.status) {
    payload.status = input.status;
  }

  const { data } = await client
    .from("partner_applications")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle()
    .throwOnError();

  return data ? mapPartnerApplication(data as PartnerApplicationRow) : null;
}

export async function getPartnerApplicationById(
  id: string
): Promise<PartnerApplication | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getPartnerApplicationById(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getPartnerApplicationById(id);
  }

  const { data } = await client
    .from("partner_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return data ? mapPartnerApplication(data as PartnerApplicationRow) : null;
}

export async function deletePartnerApplication(id: string) {
  const mock = maybeUseMock(() => mockStore.deletePartnerApplication(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.deletePartnerApplication(id);
  }

  await client.from("partner_applications").delete().eq("id", id).throwOnError();
}

export async function updateSettings(input: Partial<SiteStore["settings"]>) {
  const mock = maybeUseMock(() => mockStore.updateSettings(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updateSettings(input);
  }

  const current = await fetchSettings();
  const nextSettings: SettingsBundle = {
    impact: {
      ...current.impact,
      ...input.impact,
    },
    contact: {
      ...current.contact,
      ...input.contact,
    },
    organization: {
      ...current.organization,
      ...input.organization,
    },
  };

  await client
    .from("site_settings")
    .upsert(
      {
        id: "primary",
        organization_name: nextSettings.organization.name,
        rc_number: nextSettings.organization.rcNumber,
        tagline: nextSettings.organization.tagline,
        country: nextSettings.organization.country,
        contact_email: nextSettings.contact.email,
        contact_phone: nextSettings.contact.phone,
        contact_address: nextSettings.contact.address,
        facebook_url: nextSettings.contact.facebookUrl,
        twitter_url: nextSettings.contact.twitterUrl,
        instagram_url: nextSettings.contact.instagramUrl,
        communities_reached: nextSettings.impact.communitiesReached,
        beneficiaries_supported: nextSettings.impact.beneficiariesSupported,
        events_held: nextSettings.impact.eventsHeld,
        years_of_service: nextSettings.impact.yearsOfService,
      },
      { onConflict: "id" }
    )
    .throwOnError();

  return nextSettings;
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.listTeamMembers());
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.listTeamMembers();
  }

  return fetchTeamMembers();
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getTeamMemberById(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getTeamMemberById(id);
  }

  const { data } = await client
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return data ? mapTeamMember(data as TeamMemberRow) : null;
}

export async function createTeamMember(input: {
  name: string;
  role: string;
  description: string;
  isFeatured: boolean;
  sortOrder: number;
  imageFile?: File | null;
  imageLink?: string;
}) {
  const mock = maybeUseMock(() =>
    mockStore.createTeamMember({
      name: input.name,
      role: input.role,
      description: input.description,
      imageUrl:
        input.imageLink?.trim() ||
        (input.imageFile
          ? createPlaceholderImage({
              title: input.name,
              subtitle: "Team member portrait",
              accent: "#1A5C2A",
              background: "#48667D",
            })
          : null),
      imagePath: null,
      isFeatured: input.isFeatured,
      sortOrder: input.sortOrder,
    })
  );
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.createTeamMember({
      name: input.name,
      role: input.role,
      description: input.description,
      imageUrl:
        input.imageLink?.trim() ||
        (input.imageFile
          ? createPlaceholderImage({
              title: input.name,
              subtitle: "Team member portrait",
              accent: "#1A5C2A",
              background: "#48667D",
            })
          : null),
      imagePath: null,
      isFeatured: input.isFeatured,
      sortOrder: input.sortOrder,
    });
  }

  const image = await resolveTeamMemberImage({
    name: input.name,
    imageFile: input.imageFile,
    imageLink: input.imageLink,
  });

  if (input.isFeatured) {
    await client
      .from("team_members")
      .update({ is_featured: false })
      .eq("is_featured", true)
      .throwOnError();
  }

  const { data } = await client
    .from("team_members")
    .insert({
      name: input.name,
      role: input.role,
      description: input.description,
      image_url: image.imageUrl,
      image_path: image.imagePath,
      is_featured: input.isFeatured,
      sort_order: input.sortOrder,
    })
    .select("*")
    .single()
    .throwOnError();

  return mapTeamMember(data as TeamMemberRow);
}

export async function updateTeamMember(
  id: string,
  input: {
    name: string;
    role: string;
    description: string;
    isFeatured: boolean;
    sortOrder: number;
    imageFile?: File | null;
    imageLink?: string;
    clearImage?: boolean;
  }
) {
  const existing = await getTeamMemberById(id);
  if (!existing) {
    return null;
  }

  const mock = maybeUseMock(() =>
    mockStore.updateTeamMember(id, {
      name: input.name,
      role: input.role,
      description: input.description,
      imageUrl:
        input.imageLink?.trim() ||
        (input.imageFile
          ? createPlaceholderImage({
              title: input.name,
              subtitle: "Team member portrait",
              accent: "#1A5C2A",
              background: "#48667D",
            })
          : input.clearImage
            ? null
            : existing.imageUrl || null),
      imagePath: null,
      isFeatured: input.isFeatured,
      sortOrder: input.sortOrder,
    })
  );
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updateTeamMember(id, {
      name: input.name,
      role: input.role,
      description: input.description,
      imageUrl:
        input.imageLink?.trim() ||
        (input.imageFile
          ? createPlaceholderImage({
              title: input.name,
              subtitle: "Team member portrait",
              accent: "#1A5C2A",
              background: "#48667D",
            })
          : input.clearImage
            ? null
            : existing.imageUrl || null),
      imagePath: null,
      isFeatured: input.isFeatured,
      sortOrder: input.sortOrder,
    });
  }

  const image = await resolveTeamMemberImage({
    name: input.name,
    imageFile: input.imageFile,
    imageLink: input.imageLink,
    existingUrl: existing.imageUrl,
    existingPath: existing.imagePath,
    clearExisting: input.clearImage,
  });

  if (input.isFeatured) {
    await client
      .from("team_members")
      .update({ is_featured: false })
      .eq("is_featured", true)
      .neq("id", id)
      .throwOnError();
  }

  const { data } = await client
    .from("team_members")
    .update({
      name: input.name,
      role: input.role,
      description: input.description,
      image_url: image.imageUrl,
      image_path: image.imagePath,
      is_featured: input.isFeatured,
      sort_order: input.sortOrder,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle()
    .throwOnError();

  if (image.oldPathToDelete) {
    await removeStorageFile(image.oldPathToDelete);
  }

  return data ? mapTeamMember(data as TeamMemberRow) : null;
}

export async function deleteTeamMember(id: string) {
  const existing = await getTeamMemberById(id);

  const mock = maybeUseMock(() => mockStore.deleteTeamMember(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.deleteTeamMember(id);
  }

  await client.from("team_members").delete().eq("id", id).throwOnError();

  if (existing?.imagePath) {
    await removeStorageFile(existing.imagePath);
  }
}

export async function listProjects(
  status?: Project["status"]
): Promise<Project[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.listProjects(status));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.listProjects(status);
  }

  let query = client.from("projects").select("*");
  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query
    .order("created_at", { ascending: false })
    .throwOnError();

  return (data as ProjectRow[]).map(mapProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getProjectById(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getProjectById(id);
  }

  const { data } = await client
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return data ? mapProject(data as ProjectRow) : null;
}

export async function createProject(input: Omit<Project, "id" | "createdAt">) {
  const mock = maybeUseMock(() => mockStore.createProject(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.createProject(input);
  }

  const { data } = await client
    .from("projects")
    .insert({
      title: input.title,
      description: input.description,
      category: input.category,
      status: input.status,
      budget_goal: input.budgetGoal,
    })
    .select("*")
    .single()
    .throwOnError();

  return mapProject(data as ProjectRow);
}

export async function updateProject(id: string, input: Partial<Project>) {
  const mock = maybeUseMock(() => mockStore.updateProject(id, input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updateProject(id, input);
  }

  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) {
    payload.title = input.title;
  }
  if (input.description !== undefined) {
    payload.description = input.description;
  }
  if (input.category !== undefined) {
    payload.category = input.category;
  }
  if (input.status !== undefined) {
    payload.status = input.status;
  }
  if (input.budgetGoal !== undefined) {
    payload.budget_goal = input.budgetGoal;
  }

  const { data } = await client
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle()
    .throwOnError();

  return data ? mapProject(data as ProjectRow) : null;
}

export async function findUserByEmail(
  role: PortalRole,
  email: string
): Promise<MockCredentialUser | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.findUserByEmail(role, email));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.findUserByEmail(role, email);
  }

  const { data } = await client
    .from("user_profiles")
    .select("*")
    .eq("role", role)
    .eq("email", email.toLowerCase())
    .maybeSingle()
    .throwOnError();

  return data ? mapUser(data as UserProfileRow) : null;
}

export async function listUsersByRole(
  role: PortalRole
): Promise<MockCredentialUser[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.listUsersByRole(role));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.listUsersByRole(role);
  }

  const { data } = await client
    .from("user_profiles")
    .select("*")
    .eq("role", role)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .throwOnError();

  return (data as UserProfileRow[]).map(mapUser);
}

export async function getUserById(id: string): Promise<MockCredentialUser | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getUserById(id));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getUserById(id);
  }

  const { data } = await client
    .from("user_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return data ? mapUser(data as UserProfileRow) : null;
}

export async function updateUserProfile(
  id: string,
  input: Partial<MockCredentialUser> & { password?: string }
) {
  const mock = maybeUseMock(() => mockStore.updateUserProfile(id, input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.updateUserProfile(id, input);
  }

  const authPayload: {
    email?: string;
    email_confirm?: boolean;
    password?: string;
  } = {};

  if (input.email) {
    authPayload.email = input.email.toLowerCase();
    authPayload.email_confirm = true;
  }
  if (input.password) {
    authPayload.password = input.password;
  }

  if (Object.keys(authPayload).length > 0) {
    await client.auth.admin.updateUserById(id, authPayload);
  }

  const profilePayload: Record<string, unknown> = {};
  if (input.displayName !== undefined) {
    profilePayload.display_name = input.displayName;
  }
  if (input.orgName !== undefined) {
    profilePayload.org_name = input.orgName || null;
  }
  if (input.email !== undefined) {
    profilePayload.email = input.email.toLowerCase();
  }
  if (input.phone !== undefined) {
    profilePayload.phone = input.phone;
  }
  if (input.status !== undefined) {
    profilePayload.status = input.status;
  }

  const { data } = await client
    .from("user_profiles")
    .update(profilePayload)
    .eq("id", id)
    .select("*")
    .maybeSingle()
    .throwOnError();

  return data ? mapUser(data as UserProfileRow) : null;
}

type PortalAdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

async function findAuthUserByEmail(client: PortalAdminClient, email: string) {
  const { data, error } = await client.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  return (
    data.users.find((candidate) => candidate.email?.toLowerCase() === email) || null
  );
}

export async function createPortalUser(input: {
  role: PortalRole;
  displayName: string;
  email: string;
  phone: string;
  orgName?: string;
  status?: "active" | "inactive";
  password?: string;
}) {
  const mock = maybeUseMock(() => mockStore.createPortalUser(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.createPortalUser(input);
  }

  const email = input.email.toLowerCase();
  const existingAuthUser = await findAuthUserByEmail(client, email);
  const userMetadata = {
    role: input.role,
    display_name: input.displayName,
    org_name: input.orgName || null,
    is_admin: input.role === "admin",
  };

  let authUserId = existingAuthUser?.id;

  if (existingAuthUser) {
    const authPayload: {
      email: string;
      email_confirm: boolean;
      password?: string;
      user_metadata: typeof userMetadata;
    } = {
      email,
      email_confirm: true,
      user_metadata: userMetadata,
    };

    if (input.password) {
      authPayload.password = input.password;
    }

    const { error } = await client.auth.admin.updateUserById(
      existingAuthUser.id,
      authPayload
    );

    if (error) {
      throw error;
    }
  } else if (input.password) {
    const { data: authData, error } = await client.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: userMetadata,
    });

    if (error || !authData.user) {
      throw error || new Error("Unable to create portal user.");
    }

    authUserId = authData.user.id;
  } else {
    const { data: inviteData, error } = await client.auth.admin.inviteUserByEmail(
      email,
      {
        data: userMetadata,
        redirectTo: process.env.PORTAL_INVITE_REDIRECT_TO || undefined,
      }
    );

    if (error || !inviteData.user) {
      throw error || new Error("Unable to invite portal user.");
    }

    authUserId = inviteData.user.id;
  }

  if (!authUserId) {
    throw new Error("Unable to determine the portal user ID.");
  }

  const { data } = await client
    .from("user_profiles")
    .upsert(
      {
        id: authUserId,
        role: input.role,
        display_name: input.displayName,
        org_name: input.orgName || null,
        email,
        phone: input.phone,
        is_admin: input.role === "admin",
        status: input.status || "active",
      },
      { onConflict: "id" }
    )
    .select("*")
    .single()
    .throwOnError();

  return mapUser(data as UserProfileRow);
}

export async function ensureSponsorAccess(userId: string, projectIds: string[]) {
  const mock = maybeUseMock(() => mockStore.ensureSponsorAccess(userId, projectIds));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.ensureSponsorAccess(userId, projectIds);
  }

  await client
    .from("sponsor_project_access")
    .delete()
    .eq("sponsor_user_id", userId)
    .throwOnError();

  if (projectIds.length === 0) {
    return;
  }

  await client
    .from("sponsor_project_access")
    .insert(
      projectIds.map((projectId) => ({
        sponsor_user_id: userId,
        project_id: projectId,
      }))
    )
    .throwOnError();
}

export async function ensurePartnerPermissions(
  userId: string,
  permissionKeys: string[]
) {
  const mock = maybeUseMock(() =>
    mockStore.ensurePartnerPermissions(userId, permissionKeys)
  );
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.ensurePartnerPermissions(userId, permissionKeys);
  }

  await client
    .from("partner_permissions")
    .delete()
    .eq("partner_user_id", userId)
    .throwOnError();

  if (permissionKeys.length === 0) {
    return;
  }

  await client
    .from("partner_permissions")
    .insert(
      permissionKeys.map((permissionKey) => ({
        partner_user_id: userId,
        permission_key: permissionKey,
      }))
    )
    .throwOnError();
}

export async function getSponsorProjects(userId: string): Promise<Project[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getSponsorProjects(userId));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getSponsorProjects(userId);
  }

  const { data: accessRows } = await client
    .from("sponsor_project_access")
    .select("project_id")
    .eq("sponsor_user_id", userId)
    .throwOnError();

  const projectIds = (accessRows || []).map((row) => row.project_id as string);
  if (projectIds.length === 0) {
    return [];
  }

  const { data } = await client
    .from("projects")
    .select("*")
    .in("id", projectIds)
    .order("created_at", { ascending: false })
    .throwOnError();

  return (data as ProjectRow[]).map(mapProject);
}

export async function getPartnerPermissionKeys(
  userId: string
): Promise<string[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getPartnerPermissionKeys(userId));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getPartnerPermissionKeys(userId);
  }

  const { data } = await client
    .from("partner_permissions")
    .select("permission_key")
    .eq("partner_user_id", userId)
    .order("granted_at", { ascending: false })
    .throwOnError();

  return (data || []).map((row) => row.permission_key as string);
}

export async function listChatRoomsForUser(
  userId: string
): Promise<ChatRoom[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.listChatRoomsForUser(userId));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.listChatRoomsForUser(userId);
  }

  const { data: memberships } = await client
    .from("chat_members")
    .select("room_id")
    .eq("user_id", userId)
    .throwOnError();

  const roomIds = (memberships || []).map((row) => row.room_id as string);
  if (roomIds.length === 0) {
    return [];
  }

  const { data } = await client
    .from("chat_rooms")
    .select("*")
    .in("id", roomIds)
    .order("created_at", { ascending: false })
    .throwOnError();

  return (data as ChatRoomRow[]).map(mapChatRoom);
}

export async function getChatRoomById(roomId: string): Promise<ChatRoom | null> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getChatRoomById(roomId));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getChatRoomById(roomId);
  }

  const { data } = await client
    .from("chat_rooms")
    .select("*")
    .eq("id", roomId)
    .maybeSingle()
    .throwOnError();

  return data ? mapChatRoom(data as ChatRoomRow) : null;
}

export async function listChatMembersForRoom(
  roomId: string
): Promise<ChatMember[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.listChatMembersForRoom(roomId));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.listChatMembersForRoom(roomId);
  }

  const { data } = await client
    .from("chat_members")
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true })
    .throwOnError();

  return (data as ChatMemberRow[]).map(mapChatMember);
}

export async function isChatRoomMember(
  roomId: string,
  userId: string
): Promise<boolean> {
  const mock = maybeUseMock(() => mockStore.isChatRoomMember(roomId, userId));
  if (mock !== MOCK_UNSET) {
    return Boolean(mock);
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.isChatRoomMember(roomId, userId);
  }

  const { data } = await client
    .from("chat_members")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle()
    .throwOnError();

  return Boolean(data);
}

export async function getMessagesForRoom(
  roomId: string,
  userId?: string
): Promise<ChatMessage[]> {
  noStore();

  const mock = maybeUseMock(() => mockStore.getMessagesForRoom(roomId, userId));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.getMessagesForRoom(roomId, userId);
  }

  if (userId) {
    const hasAccess = await isChatRoomMember(roomId, userId);
    if (!hasAccess) {
      return [];
    }
  }

  const { data } = await client
    .from("chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .throwOnError();

  return (data as ChatMessageRow[]).map(mapChatMessage);
}

export async function createChatRoom(input: Omit<ChatRoom, "id" | "createdAt">) {
  const mock = maybeUseMock(() => mockStore.createChatRoom(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.createChatRoom(input);
  }

  const { data } = await client
    .from("chat_rooms")
    .insert({
      name: input.name,
      type: input.type,
      linked_user_id: input.linkedUserId,
      allow_join_requests: input.allowJoinRequests,
      created_by: input.createdBy,
    })
    .select("*")
    .single()
    .throwOnError();

  const room = data as ChatRoomRow;

  await client.from("chat_members").insert([
    {
      room_id: room.id,
      user_id: input.createdBy,
      role: "owner",
    },
    {
      room_id: room.id,
      user_id: input.linkedUserId,
      role: "member",
    },
  ]).throwOnError();

  return mapChatRoom(room);
}

export async function deleteChatRoom(roomId: string) {
  const mock = maybeUseMock(() => mockStore.deleteChatRoom(roomId));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.deleteChatRoom(roomId);
  }

  await client.from("chat_rooms").delete().eq("id", roomId).throwOnError();
}

export async function addChatMessage(input: {
  roomId: string;
  senderId: string;
  message: string;
}) {
  const mock = maybeUseMock(() => mockStore.addChatMessage(input));
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const client = getAdminClient();
  if (!client) {
    return mockStore.addChatMessage(input);
  }

  const hasAccess = await isChatRoomMember(input.roomId, input.senderId);
  if (!hasAccess) {
    throw new Error("You do not have access to this chat room.");
  }

  const { data } = await client
    .from("chat_messages")
    .insert({
      room_id: input.roomId,
      sender_id: input.senderId,
      message: input.message,
    })
    .select("*")
    .single()
    .throwOnError();

  return mapChatMessage(data as ChatMessageRow);
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const mock = maybeUseMock(() => mockStore.getDashboardSnapshot());
  if (mock !== MOCK_UNSET) {
    return mock;
  }

  const store = await getStore();

  return {
    totalPosts: store.posts.length,
    newApplications: store.applications.filter((item) => item.status === "new")
      .length,
    pendingComments: store.comments.filter((item) => item.status === "pending")
      .length,
    galleryImages: store.gallery.length,
    activeSponsors: store.users.filter(
      (user) => user.role === "sponsor" && user.status === "active"
    ).length,
    activePartners: store.users.filter(
      (user) => user.role === "partner" && user.status === "active"
    ).length,
  };
}

export function getFileInput(
  formData: FormData,
  fieldName: string
) {
  return getFormFile(formData.get(fieldName));
}

export function getFileInputs(
  formData: FormData,
  fieldName: string
) {
  return getFormFiles(formData.getAll(fieldName));
}

export const storeAssets = mockStore.storeAssets;


