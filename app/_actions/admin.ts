"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuthorizedPortalSession } from "@/lib/auth/portal";
import { setFlashToast } from "@/lib/flash-toast.server";
import {
  addGalleryYear,
  addGalleryCollectionMedia,
  addChatMessage,
  createGalleryCollection,
  createChatRoom,
  createPortalUser,
  createProject,
  createPost,
  createTeamMember,
  deleteHelpApplication,
  deletePartnerApplication,
  deleteChatRoom,
  deleteComment,
  deletePost,
  deleteSponsorApplication,
  deleteTeamMember,
  ensurePartnerPermissions,
  ensureSponsorAccess,
  findUserByEmail,
  getFileInput,
  getFileInputs,
  getGalleryCollectionById,
  getChatRoomById,
  getPartnerApplicationById,
  getSponsorApplicationById,
  getUserById,
  isChatRoomMember,
  listProjects,
  removeGalleryCollection,
  removeGalleryYear,
  removeGalleryItem,
  updateGalleryCollection,
  updateApplicationStatus,
  updateCommentStatus,
  updatePartnerApplication,
  updatePost,
  updateProject,
  updateSettings,
  updateSponsorApplication,
  updateTeamMember,
  updateUserProfile,
} from "@/lib/store";
import { type GalleryMediaType, type PortalRole } from "@/types";

async function requireRole(role: PortalRole) {
  return requireAuthorizedPortalSession(role);
}

async function flashAndRedirect(
  path: string,
  toast: {
    type: "success" | "error" | "info";
    title: string;
    description?: string;
  }
): Promise<never> {
  await setFlashToast(toast);
  redirect(path);
}

const postSchema = z.object({
  existingSlug: z.string().optional(),
  title: z.string().min(3),
  category: z.enum([
    "Health",
    "Education",
    "Empowerment",
    "Events",
    "Infrastructure",
    "Community Service",
    "Awards/Recognition",
    "Partnership",
    "Scholarship",
  ]),
  content: z.string().min(20),
  published: z.enum(["draft", "published"]),
});

const galleryYearSchema = z.coerce.number().int().min(1900).max(2100);

const allowedPartnerPermissionKeys = new Set([
  "public.posts",
  "reports.projects",
  "gallery.highlights",
  "events.calendar",
]);

const galleryCollectionSchema = z.object({
  title: z.string().trim().min(2).max(120),
  album: z.enum([
    "Health Outreach",
    "Education",
    "Empowerment",
    "Events",
    "Relief",
  ]),
  year: galleryYearSchema,
});

const galleryMediaLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Enter a valid media link.")
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "Use a media link that starts with http:// or https://."
    ),
  type: z.enum(["image", "video"]),
});

const imageLinkSchema = z
  .string()
  .trim()
  .url("Enter a valid image link.")
  .refine(
    (value) => /^https?:\/\//i.test(value),
    "Use an image link that starts with http:// or https://."
  );

const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3).max(120),
  role: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(600),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

function getActionErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function parseGalleryMediaLinks(formData: FormData) {
  const urls = formData.getAll("mediaLinks").map((value) => String(value || "").trim());
  const types = formData.getAll("mediaLinkTypes").map((value) => String(value || ""));
  const parsedLinks: Array<{ url: string; type: GalleryMediaType }> = [];

  for (const [index, url] of urls.entries()) {
    if (!url) {
      continue;
    }

    const parsed = galleryMediaLinkSchema.safeParse({
      url,
      type: types[index] || "image",
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Enter valid media links.");
    }

    parsedLinks.push(parsed.data);
  }

  return parsedLinks;
}

function parseImageLinks(rawValues: string[]) {
  const parsedLinks: string[] = [];

  for (const rawValue of rawValues) {
    const value = rawValue.trim();
    if (!value) {
      continue;
    }

    const parsed = imageLinkSchema.safeParse(value);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Enter valid image links.");
    }

    parsedLinks.push(parsed.data);
  }

  return parsedLinks;
}

export async function savePostAction(formData: FormData) {
  await requireRole("admin");
  const existingSlug = String(formData.get("existingSlug") || "");
  const postEditorPath = existingSlug
    ? `/admin/posts/${existingSlug}/edit`
    : "/admin/posts/new";

  const parsed = postSchema.safeParse({
    existingSlug: existingSlug || undefined,
    title: formData.get("title"),
    category: formData.get("category"),
    content: formData.get("content"),
    published: formData.get("published"),
  });

  const data = parsed.success ? parsed.data : null;

  if (!data) {
    return flashAndRedirect(
      postEditorPath,
      {
        type: "error",
        title: "Post not saved",
        description: "Please complete the required post fields before saving.",
      }
    );
  }

  const coverImageFile = getFileInput(formData, "coverImageFile");
  const galleryImageFiles = getFileInputs(formData, "galleryImageFiles");

  let coverImageLink: string | undefined;
  if (!coverImageFile) {
    const rawCoverImageLink = String(formData.get("coverImageUrl") || "").trim();
    if (rawCoverImageLink) {
      const parsedCoverImageLink = imageLinkSchema.safeParse(rawCoverImageLink);
      if (!parsedCoverImageLink.success) {
        return flashAndRedirect(postEditorPath, {
          type: "error",
          title: "Post not saved",
          description:
            parsedCoverImageLink.error.issues[0]?.message ||
            "Enter a valid cover image link before saving.",
        });
      }

      coverImageLink = parsedCoverImageLink.data;
    }
  }

  let galleryImageLinks: string[] = [];
  try {
    galleryImageLinks = parseImageLinks(
      formData.getAll("galleryImageLinks").map((value) => String(value || ""))
    );
  } catch (error) {
    return flashAndRedirect(postEditorPath, {
      type: "error",
      title: "Post not saved",
      description: getActionErrorMessage(
        error,
        "Enter valid extra photo links before saving the post."
      ),
    });
  }

  const payload = {
    title: data.title,
    category: data.category,
    partnerName:
      data.category === "Partnership"
        ? String(formData.get("partnerName") || "").trim() || null
        : null,
    content: data.content,
    socialLinks: {
      facebookUrl: String(formData.get("facebookUrl") || ""),
      twitterUrl: String(formData.get("twitterUrl") || ""),
      instagramUrl: String(formData.get("instagramUrl") || ""),
    },
    coverImageFile,
    coverImageLink,
    galleryImageFiles,
    galleryImageLinks,
    clearGalleryImages: formData.get("clearGalleryImages") === "on",
    published: data.published === "published",
    showOnHome: false,
  };

  if (data.existingSlug) {
    await updatePost(data.existingSlug, payload);
  } else {
    await createPost(payload);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/activities");
  revalidatePath("/");
  await flashAndRedirect("/admin/posts", {
    type: "success",
    title: "Post saved",
    description: `${data.title} has been saved successfully.`,
  });
}

export async function deletePostAction(slug: string, _formData: FormData) {
  await requireRole("admin");
  void _formData;

  if (!slug) {
    await flashAndRedirect("/admin/posts", {
      type: "error",
      title: "Post not deleted",
      description: "We could not identify the post you wanted to remove.",
    });
  }

  try {
    await deletePost(slug);
    revalidatePath("/admin/posts");
    revalidatePath("/activities");
    revalidatePath(`/activities/${slug}`);
    revalidatePath("/");
  } catch (error) {
    await flashAndRedirect("/admin/posts", {
      type: "error",
      title: "Post not deleted",
      description: getActionErrorMessage(
        error,
        "We could not remove that post right now."
      ),
    });
  }

  await flashAndRedirect("/admin/posts", {
    type: "success",
    title: "Post deleted",
    description: "The post has been removed successfully.",
  });
}

export async function updateCommentAction(
  id: string,
  mode: "approve" | "delete",
  _formData: FormData
) {
  await requireRole("admin");
  void _formData;

  if (!id) {
    await flashAndRedirect("/admin/comments", {
      type: "error",
      title: mode === "delete" ? "Comment not deleted" : "Comment not approved",
      description: "We could not identify the comment you wanted to update.",
    });
  }

  try {
    if (mode === "approve") {
      await updateCommentStatus(id, "approved");
    } else {
      await deleteComment(id);
    }
  } catch (error) {
    await flashAndRedirect("/admin/comments", {
      type: "error",
      title: mode === "delete" ? "Comment not deleted" : "Comment not approved",
      description: getActionErrorMessage(
        error,
        mode === "delete"
          ? "We could not remove that comment right now."
          : "We could not approve that comment right now."
      ),
    });
  }

  revalidatePath("/admin/comments");
  revalidatePath("/activities");
  await flashAndRedirect("/admin/comments", {
    type: "success",
    title: mode === "delete" ? "Comment deleted" : "Comment approved",
    description:
      mode === "delete"
        ? "The comment has been removed."
        : "The comment is now visible on the public site.",
  });
}

export async function updateHelpApplicationAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const status = formData.get("status") as
    | "new"
    | "reviewed"
    | "approved"
    | "rejected";
  if (id && status) {
    await updateApplicationStatus(id, status);
    revalidatePath("/admin/applications");
  }
  await flashAndRedirect(`/admin/applications/${id}`, {
    type: "success",
    title: "Application updated",
    description: `The help application status is now ${status}.`,
  });
}

export async function deleteHelpApplicationAction(id: string, _formData: FormData) {
  await requireRole("admin");
  void _formData;

  if (!id) {
    await flashAndRedirect("/admin/applications", {
      type: "error",
      title: "Application not deleted",
      description: "We could not identify the help application you wanted to remove.",
    });
  }

  try {
    await deleteHelpApplication(id);
    revalidatePath("/admin/applications");
    revalidatePath("/admin/dashboard");
  } catch (error) {
    await flashAndRedirect("/admin/applications", {
      type: "error",
      title: "Application not deleted",
      description: getActionErrorMessage(
        error,
        "We could not delete that help application right now."
      ),
    });
  }

  await flashAndRedirect("/admin/applications", {
    type: "success",
    title: "Application deleted",
    description: "The help application has been removed.",
  });
}

export async function updateSponsorApplicationAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending") as
    | "pending"
    | "approved"
    | "rejected";
  const activeProjects = await listProjects("active");
  const allowedProjectIds = new Set(activeProjects.map((project) => project.id));
  const projectIds = Array.from(
    new Set(
      formData
        .getAll("projectIds")
        .map(String)
        .filter((projectId) => allowedProjectIds.has(projectId))
    )
  );

  if (status === "approved" && projectIds.length === 0) {
    await flashAndRedirect(`/admin/applications/sponsors/${id}`, {
      type: "error",
      title: "Projects required",
      description:
        "Assign at least one active project before approving a sponsor application.",
    });
  }

  await updateSponsorApplication(id, { status, projectIds });

  const sponsorApplication = await getSponsorApplicationById(id);
  if (!sponsorApplication) {
    await flashAndRedirect("/admin/applications/sponsors", {
      type: "error",
      title: "Sponsor application not found",
      description: "We could not load that sponsor application after saving it.",
    });
  }
  const application = sponsorApplication!;

  const existingUser = await findUserByEmail("sponsor", application.email);

  if (status === "approved") {
    const sponsorUser = await createPortalUser({
      role: "sponsor",
      displayName: application.name,
      orgName: application.orgName,
      email: application.email,
      phone: application.phone,
      status: "active",
    });

    await ensureSponsorAccess(sponsorUser.id, projectIds);
  } else if (existingUser) {
    await ensureSponsorAccess(existingUser.id, []);
    await updateUserProfile(existingUser.id, { status: "inactive" });
  }

  revalidatePath("/admin/applications/sponsors");
  revalidatePath(`/admin/applications/sponsors/${id}`);
  revalidatePath("/admin/sponsors");
  revalidatePath("/sponsor/dashboard");
  revalidatePath("/sponsor/projects");
  await flashAndRedirect(`/admin/applications/sponsors/${id}`, {
    type: "success",
    title: "Sponsor application updated",
    description: `The sponsor application is now ${status}.`,
  });
}

export async function deleteSponsorApplicationAction(
  id: string,
  _formData: FormData
) {
  await requireRole("admin");
  void _formData;

  if (!id) {
    await flashAndRedirect("/admin/applications/sponsors", {
      type: "error",
      title: "Sponsor application not deleted",
      description: "We could not identify the sponsor application you wanted to remove.",
    });
  }

  const sponsorApplication = await getSponsorApplicationById(id);
  if (!sponsorApplication) {
    await flashAndRedirect("/admin/applications/sponsors", {
      type: "error",
      title: "Sponsor application not found",
      description: "That sponsor application no longer exists.",
    });
  }
  const application = sponsorApplication!;

  try {
    const existingUser = await findUserByEmail("sponsor", application.email);
    if (existingUser) {
      await ensureSponsorAccess(existingUser.id, []);
      await updateUserProfile(existingUser.id, { status: "inactive" });
    }

    await deleteSponsorApplication(id);
    revalidatePath("/admin/applications/sponsors");
    revalidatePath("/admin/sponsors");
    revalidatePath("/admin/dashboard");
    revalidatePath("/sponsor/dashboard");
    revalidatePath("/sponsor/projects");
    revalidatePath("/sponsor/chat");
    revalidatePath("/sponsor/profile");
  } catch (error) {
    await flashAndRedirect("/admin/applications/sponsors", {
      type: "error",
      title: "Sponsor application not deleted",
      description: getActionErrorMessage(
        error,
        "We could not delete that sponsor application right now."
      ),
    });
  }

  await flashAndRedirect("/admin/applications/sponsors", {
    type: "success",
    title: "Sponsor application deleted",
    description: "The sponsor application has been removed and any portal access has been disabled.",
  });
}

export async function updatePartnerApplicationAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending") as
    | "pending"
    | "approved"
    | "rejected";
  const permissionKeys = Array.from(
    new Set(
      formData
        .getAll("permissionKeys")
        .map(String)
        .filter((permissionKey) =>
          allowedPartnerPermissionKeys.has(permissionKey)
        )
    )
  );

  await updatePartnerApplication(id, { status });

  const partnerApplication = await getPartnerApplicationById(id);
  if (!partnerApplication) {
    await flashAndRedirect("/admin/applications/partners", {
      type: "error",
      title: "Partner application not found",
      description: "We could not load that partner application after saving it.",
    });
  }
  const application = partnerApplication!;

  const existingUser = await findUserByEmail("partner", application.email);

  if (status === "approved") {
    const partnerUser = await createPortalUser({
      role: "partner",
      displayName: application.contactName,
      orgName: application.orgName,
      email: application.email,
      phone: application.phone,
      status: "active",
    });

    await ensurePartnerPermissions(partnerUser.id, permissionKeys);
  } else if (existingUser) {
    await ensurePartnerPermissions(existingUser.id, []);
    await updateUserProfile(existingUser.id, { status: "inactive" });
  }

  revalidatePath("/admin/applications/partners");
  revalidatePath(`/admin/applications/partners/${id}`);
  revalidatePath("/admin/partners");
  revalidatePath("/partner/dashboard");
  revalidatePath("/partner/content");
  await flashAndRedirect(`/admin/applications/partners/${id}`, {
    type: "success",
    title: "Partner application updated",
    description: `The partner application is now ${status}.`,
  });
}

export async function deletePartnerApplicationAction(
  id: string,
  _formData: FormData
) {
  await requireRole("admin");
  void _formData;

  if (!id) {
    await flashAndRedirect("/admin/applications/partners", {
      type: "error",
      title: "Partner application not deleted",
      description: "We could not identify the partner application you wanted to remove.",
    });
  }

  const partnerApplication = await getPartnerApplicationById(id);
  if (!partnerApplication) {
    await flashAndRedirect("/admin/applications/partners", {
      type: "error",
      title: "Partner application not found",
      description: "That partner application no longer exists.",
    });
  }
  const application = partnerApplication!;

  try {
    const existingUser = await findUserByEmail("partner", application.email);
    if (existingUser) {
      await ensurePartnerPermissions(existingUser.id, []);
      await updateUserProfile(existingUser.id, { status: "inactive" });
    }

    await deletePartnerApplication(id);
    revalidatePath("/admin/applications/partners");
    revalidatePath("/admin/partners");
    revalidatePath("/admin/dashboard");
    revalidatePath("/partner/dashboard");
    revalidatePath("/partner/content");
    revalidatePath("/partner/chat");
    revalidatePath("/partner/profile");
  } catch (error) {
    await flashAndRedirect("/admin/applications/partners", {
      type: "error",
      title: "Partner application not deleted",
      description: getActionErrorMessage(
        error,
        "We could not delete that partner application right now."
      ),
    });
  }

  await flashAndRedirect("/admin/applications/partners", {
    type: "success",
    title: "Partner application deleted",
    description: "The partner application has been removed and any portal access has been disabled.",
  });
}

export async function saveSettingsAction(formData: FormData) {
  await requireRole("admin");
  await updateSettings({
    impact: {
      communitiesReached: Number(formData.get("communitiesReached") || 0),
      beneficiariesSupported: Number(formData.get("beneficiariesSupported") || 0),
      eventsHeld: Number(formData.get("eventsHeld") || 0),
      yearsOfService: Number(formData.get("yearsOfService") || 0),
    },
    contact: {
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      facebookUrl: String(formData.get("facebookUrl") || ""),
      twitterUrl: String(formData.get("twitterUrl") || ""),
      instagramUrl: String(formData.get("instagramUrl") || ""),
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/contact");
  await flashAndRedirect("/admin/settings", {
    type: "success",
    title: "Settings saved",
    description: "Foundation settings have been updated.",
  });
}

export async function saveTeamMemberAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const teamEditorPath = id ? `/admin/team/${id}/edit` : "/admin/team/new";

  const parsed = teamMemberSchema.safeParse({
    id: id || undefined,
    name: formData.get("name"),
    role: formData.get("role"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
  });
  const data = parsed.success ? parsed.data : null;

  if (!data) {
    return flashAndRedirect(teamEditorPath, {
      type: "error",
      title: "Team member not saved",
      description: "Please complete the member details before saving.",
    });
  }

  const imageFile = getFileInput(formData, "imageFile");
  let imageLink: string | undefined;

  if (!imageFile) {
    const rawImageLink = String(formData.get("imageUrl") || "").trim();
    if (rawImageLink) {
      const parsedImageLink = imageLinkSchema.safeParse(rawImageLink);
      if (!parsedImageLink.success) {
        return flashAndRedirect(teamEditorPath, {
          type: "error",
          title: "Team member not saved",
          description:
            parsedImageLink.error.issues[0]?.message ||
            "Enter a valid image link before saving this team member.",
        });
      }

      imageLink = parsedImageLink.data;
    }
  }

  try {
    const savedMember = data.id
      ? await updateTeamMember(data.id, {
          name: data.name,
          role: data.role,
          description: data.description,
          isFeatured: formData.get("isFeatured") === "on",
          sortOrder: data.sortOrder,
          imageFile,
          imageLink,
          clearImage: formData.get("clearImage") === "on",
        })
      : await createTeamMember({
          name: data.name,
          role: data.role,
          description: data.description,
          isFeatured: formData.get("isFeatured") === "on",
          sortOrder: data.sortOrder,
          imageFile,
          imageLink,
        });

    if (!savedMember) {
      throw new Error("We could not find that team member anymore.");
    }
  } catch (error) {
    await flashAndRedirect(teamEditorPath, {
      type: "error",
      title: "Team member not saved",
      description: getActionErrorMessage(
        error,
        "We could not save that team member right now."
      ),
    });
  }

  revalidatePath("/admin/team");
  if (data.id) {
    revalidatePath(`/admin/team/${data.id}/edit`);
  }
  revalidatePath("/about");
  revalidatePath("/about/team");
  await flashAndRedirect("/admin/team", {
    type: "success",
    title: data.id ? "Team member updated" : "Team member created",
    description: `${data.name} has been saved successfully.`,
  });
}

export async function deleteTeamMemberAction(id: string, _formData: FormData) {
  await requireRole("admin");
  void _formData;

  if (!id) {
    await flashAndRedirect("/admin/team", {
      type: "error",
      title: "Team member not deleted",
      description: "We could not identify the team member you wanted to remove.",
    });
  }

  try {
    await deleteTeamMember(id);
  } catch (error) {
    await flashAndRedirect("/admin/team", {
      type: "error",
      title: "Team member not deleted",
      description: getActionErrorMessage(
        error,
        "We could not remove that team member right now."
      ),
    });
  }

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${id}/edit`);
  revalidatePath("/about");
  revalidatePath("/about/team");
  await flashAndRedirect("/admin/team", {
    type: "success",
    title: "Team member deleted",
    description: "The member has been removed from the public team page.",
  });
}

export async function createGalleryCollectionAction(formData: FormData) {
  await requireRole("admin");
  const mediaFiles = getFileInputs(formData, "mediaFiles");
  const parsed = galleryCollectionSchema.safeParse({
    title: formData.get("title"),
    album: formData.get("album"),
    year: formData.get("year"),
  });
  const data = parsed.success ? parsed.data : null;

  if (!data) {
    return flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Gallery not updated",
      description:
        parsed.error?.issues[0]?.message ||
        "Add a valid collection title, category, year, and media before uploading.",
    });
  }

  let mediaLinks: Array<{ url: string; type: GalleryMediaType }> = [];
  try {
    mediaLinks = parseGalleryMediaLinks(formData);
  } catch (error) {
    await flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Gallery not updated",
      description: getActionErrorMessage(error, "Enter valid media links before uploading."),
    });
  }

  if (mediaFiles.length === 0 && mediaLinks.length === 0) {
    await flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Media required",
      description:
        "Choose at least one image/video file or paste at least one media link before creating a collection.",
    });
  }

  try {
    const collection = await createGalleryCollection({
      title: data.title,
      album: data.album,
      year: data.year,
      mediaFiles,
      mediaLinks,
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    await flashAndRedirect(`/admin/gallery/${collection.id}`, {
      type: "success",
      title: "Collection created",
      description: "The gallery collection has been created and the media has been added.",
    });
  } catch (error) {
    await flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Gallery not updated",
      description:
        error instanceof Error
          ? error.message
          : "We could not create that gallery collection right now.",
    });
  }
}

export async function deleteGalleryItemAction(
  id: string,
  returnToCollectionId: string | null,
  _formData: FormData
) {
  await requireRole("admin");
  void _formData;

  if (!id) {
    await flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Gallery media not deleted",
      description: "We could not identify the gallery media item you wanted to remove.",
    });
  }

  try {
    await removeGalleryItem(id);
  } catch (error) {
    await flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Gallery media not deleted",
      description: getActionErrorMessage(
        error,
        "We could not remove that gallery media item right now."
      ),
    });
  }

  revalidatePath("/admin/gallery");
  if (returnToCollectionId) {
    revalidatePath(`/admin/gallery/${returnToCollectionId}`);
  }
  revalidatePath("/gallery");
  const remainingCollection = returnToCollectionId
    ? await getGalleryCollectionById(returnToCollectionId)
    : null;
  const redirectPath = remainingCollection
    ? `/admin/gallery/${returnToCollectionId}`
    : "/admin/gallery";

  await flashAndRedirect(redirectPath, {
    type: "success",
    title: "Gallery media deleted",
    description: "The media item has been removed from the gallery.",
  });
}

export async function updateGalleryCollectionAction(
  collectionId: string,
  formData: FormData
) {
  await requireRole("admin");
  const parsed = galleryCollectionSchema.safeParse({
    title: formData.get("title"),
    album: formData.get("album"),
    year: formData.get("year"),
  });
  const data = parsed.success ? parsed.data : null;

  if (!data) {
    return await flashAndRedirect(`/admin/gallery/${collectionId}`, {
      type: "error",
      title: "Collection not updated",
      description:
        parsed.error?.issues[0]?.message ||
        "Enter a valid collection title, category, and year before saving.",
    });
  }

  try {
    await updateGalleryCollection(collectionId, data);
  } catch (error) {
    await flashAndRedirect(`/admin/gallery/${collectionId}`, {
      type: "error",
      title: "Collection not updated",
      description: getActionErrorMessage(
        error,
        "We could not update that gallery collection right now."
      ),
    });
  }

  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${collectionId}`);
  revalidatePath("/gallery");
  await flashAndRedirect(`/admin/gallery/${collectionId}`, {
    type: "success",
    title: "Collection updated",
    description: "The gallery collection details have been saved.",
  });
}

export async function addGalleryCollectionMediaAction(
  collectionId: string,
  formData: FormData
) {
  await requireRole("admin");
  const mediaFiles = getFileInputs(formData, "mediaFiles");

  let mediaLinks: Array<{ url: string; type: GalleryMediaType }> = [];
  try {
    mediaLinks = parseGalleryMediaLinks(formData);
  } catch (error) {
    await flashAndRedirect(`/admin/gallery/${collectionId}`, {
      type: "error",
      title: "Media not added",
      description: getActionErrorMessage(error, "Enter valid media links before uploading."),
    });
  }

  if (mediaFiles.length === 0 && mediaLinks.length === 0) {
    await flashAndRedirect(`/admin/gallery/${collectionId}`, {
      type: "error",
      title: "Media required",
      description:
        "Choose at least one image/video file or paste at least one media link before updating the collection.",
    });
  }

  try {
    await addGalleryCollectionMedia(collectionId, {
      mediaFiles,
      mediaLinks,
    });
  } catch (error) {
    await flashAndRedirect(`/admin/gallery/${collectionId}`, {
      type: "error",
      title: "Media not added",
      description: getActionErrorMessage(
        error,
        "We could not add media to that collection right now."
      ),
    });
  }

  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${collectionId}`);
  revalidatePath("/gallery");
  await flashAndRedirect(`/admin/gallery/${collectionId}`, {
    type: "success",
    title: "Collection updated",
    description: "The new media has been added to the collection.",
  });
}

export async function deleteGalleryCollectionAction(
  collectionId: string,
  _formData: FormData
) {
  await requireRole("admin");
  void _formData;

  if (!collectionId) {
    await flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Collection not deleted",
      description: "We could not identify the gallery collection you wanted to remove.",
    });
  }

  try {
    await removeGalleryCollection(collectionId);
  } catch (error) {
    await flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Collection not deleted",
      description: getActionErrorMessage(
        error,
        "We could not remove that gallery collection right now."
      ),
    });
  }

  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${collectionId}`);
  revalidatePath("/gallery");
  await flashAndRedirect("/admin/gallery", {
    type: "success",
    title: "Collection deleted",
    description: "The gallery collection and all its media items have been removed.",
  });
}

export async function addGalleryYearAction(formData: FormData) {
  await requireRole("admin");
  const parsed = galleryYearSchema.safeParse(formData.get("year"));

  if (!parsed.success) {
    return flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Year not added",
      description: "Enter a valid year between 1900 and 2100.",
    });
  }

  const year = parsed.data;

  try {
    await addGalleryYear(year);
  } catch (error) {
    await flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Year not added",
      description:
        error instanceof Error
          ? error.message
          : "We could not add that gallery year right now.",
    });
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  await flashAndRedirect("/admin/gallery", {
    type: "success",
    title: "Year added",
    description: `${year} is now available for gallery collections.`,
  });
}

export async function deleteGalleryYearAction(
  yearValue: number,
  _formData: FormData
) {
  await requireRole("admin");
  void _formData;
  const parsed = galleryYearSchema.safeParse(yearValue);

  if (!parsed.success) {
    return flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Year not removed",
      description: "We could not identify the gallery year you wanted to remove.",
    });
  }

  const year = parsed.data;

  try {
    await removeGalleryYear(year);
  } catch (error) {
    await flashAndRedirect("/admin/gallery", {
      type: "error",
      title: "Year not removed",
      description:
        error instanceof Error
          ? error.message
          : "We could not remove that gallery year right now.",
    });
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  await flashAndRedirect("/admin/gallery", {
    type: "success",
    title: "Year removed",
    description: `${year} has been removed from the gallery year list.`,
  });
}

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(12),
  category: z.enum([
    "Health",
    "Education",
    "Empowerment",
    "Events",
    "Infrastructure",
    "Relief",
  ]),
  status: z.enum(["active", "completed"]),
  budgetGoal: z.coerce.number().min(0),
});

export async function saveProjectAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const parsed = projectSchema.safeParse({
    id: id || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    status: formData.get("status"),
    budgetGoal: formData.get("budgetGoal"),
  });

  const data = parsed.success ? parsed.data : null;

  if (!data) {
    return flashAndRedirect(
      id ? `/admin/projects/${id}/edit` : "/admin/projects/new",
      {
        type: "error",
        title: "Project not saved",
        description: "Please complete the project form before saving.",
      }
    );
  }

  if (data.id) {
    await updateProject(data.id, data);
  } else {
    await createProject(data);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/sponsor/projects");
  await flashAndRedirect("/admin/projects", {
    type: "success",
    title: "Project saved",
    description: `${data.title} has been saved successfully.`,
  });
}

export async function createChatRoomAction(formData: FormData) {
  const session = await requireRole("admin");
  const name = String(formData.get("name") || "").trim();
  const type = formData.get("type") as "sponsor" | "partner";
  const linkedUserId = String(formData.get("linkedUserId") || "");

  if (name.length < 2) {
    await flashAndRedirect("/admin/chat", {
      type: "error",
      title: "Room not created",
      description: "Give the room a clear name before creating it.",
    });
  }

  const linkedUser = linkedUserId ? await getUserById(linkedUserId) : null;
  if (!linkedUser || linkedUser.status !== "active" || linkedUser.role !== type) {
    await flashAndRedirect("/admin/chat", {
      type: "error",
      title: "Room not created",
      description: `Select an active ${type} account for this private room.`,
    });
  }

  await createChatRoom({
    name,
    type,
    linkedUserId,
    allowJoinRequests: false,
    createdBy: session.userId,
  });
  revalidatePath("/admin/chat");
  revalidatePath("/sponsor/chat");
  revalidatePath("/partner/chat");
  await flashAndRedirect("/admin/chat", {
    type: "success",
    title: "Chat room created",
    description: "The new chat room is ready for conversation.",
  });
}

export async function deleteChatRoomAction(formData: FormData) {
  await requireRole("admin");
  const roomId = String(formData.get("roomId") || "");
  if (!roomId) {
    await flashAndRedirect("/admin/chat", {
      type: "error",
      title: "Delete failed",
      description: "We could not find the room you wanted to delete.",
    });
  }

  const room = await getChatRoomById(roomId);
  if (!room) {
    await flashAndRedirect("/admin/chat", {
      type: "error",
      title: "Delete failed",
      description: "That room no longer exists.",
    });
  }

  await deleteChatRoom(roomId);
  revalidatePath("/admin/chat");
  revalidatePath("/sponsor/chat");
  revalidatePath("/partner/chat");

  await flashAndRedirect("/admin/chat", {
    type: "success",
    title: "Chat room deleted",
    description: "The chat room has been removed.",
  });
}

export async function sendChatMessageAction(formData: FormData) {
  const session = await requireAuthorizedPortalSession();
  const roomId = String(formData.get("roomId") || "");
  const message = String(formData.get("message") || "").trim();

  if (!roomId || !message) {
    await setFlashToast({
      type: "error",
      title: "Message not sent",
      description: "Write a message before sending it.",
    });
    return;
  }

  const hasAccess = await isChatRoomMember(roomId, session.userId);
  if (!hasAccess) {
    await setFlashToast({
      type: "error",
      title: "Access denied",
      description: "You do not have permission to send messages to that room.",
    });
    return;
  }

  await addChatMessage({ roomId, senderId: session.userId, message });

  await setFlashToast({
    type: "success",
    title: "Message sent",
    description: "Your message has been delivered to the room.",
  });
  if (session.role === "admin") {
    revalidatePath("/admin/chat");
  }
  if (session.role === "sponsor") {
    revalidatePath("/sponsor/chat");
  }
  if (session.role === "partner") {
    revalidatePath("/partner/chat");
  }
}

export async function saveProfileAction(formData: FormData) {
  const session = await requireAuthorizedPortalSession();

  await updateUserProfile(session.userId, {
    displayName: String(formData.get("displayName") || session.displayName),
    orgName: String(formData.get("orgName") || session.orgName || ""),
    email: String(formData.get("email") || session.email),
    phone: String(formData.get("phone") || ""),
  });

  if (session.role === "sponsor") {
    await flashAndRedirect("/sponsor/profile", {
      type: "success",
      title: "Profile saved",
      description: "Your sponsor profile has been updated.",
    });
  }

  await flashAndRedirect("/partner/profile", {
    type: "success",
    title: "Profile saved",
    description: "Your partner profile has been updated.",
  });
}

