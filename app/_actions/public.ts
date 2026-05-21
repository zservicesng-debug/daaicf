"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { setFlashToast } from "@/lib/flash-toast.server";
import {
  addComment,
  addContactMessage,
  addHelpApplication,
  addPartnerApplication,
  addSponsorApplication,
  getFileInputs,
} from "@/lib/store";
import { sendTransactionalEmail } from "@/lib/resend";
import { type SponsorSector } from "@/types";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

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

const commentSchema = z.object({
  postId: z.string().min(1),
  postSlug: z.string().min(1),
  authorName: z.string().min(2, "Please enter your name."),
  message: z.string().optional(),
});

export async function submitComment(
  _prevState: ActionState,
  formData: FormData
) {
  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    postSlug: formData.get("postSlug"),
    authorName: formData.get("authorName"),
    message: formData.get("message") || "Interested in this activity.",
  });

  if (!parsed.success) {
    return {
      status: "error" as const,
      message: parsed.error.issues[0]?.message || "Please check the form.",
    };
  }

  await addComment({
    postId: parsed.data.postId,
    authorName: parsed.data.authorName,
    message: parsed.data.message || "Interested in this activity.",
  });

  revalidatePath("/activities");
  revalidatePath(`/activities/${parsed.data.postSlug}`);

  return {
    status: "success" as const,
    message: "Your comment is awaiting review.",
  };
}

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Please tell us a little more."),
});

export async function submitContactMessage(
  _prevState: ActionState,
  formData: FormData
) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error" as const,
      message: parsed.error.issues[0]?.message || "Unable to send your message.",
    };
  }

  await addContactMessage(parsed.data);

  await sendTransactionalEmail({
    to: process.env.ADMIN_EMAIL || "admin@daaicf.org",
    subject: `New Message from ${parsed.data.name}`,
    html: `<p><strong>${parsed.data.name}</strong> sent a new message.</p><p>${parsed.data.message}</p><p>${parsed.data.email}</p>`,
  });

  return {
    status: "success" as const,
    message: "Your message has been sent successfully.",
  };
}

const helpSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  location: z.string().min(2),
  helpType: z.enum([
    "Education",
    "Medical",
    "Food/Relief",
    "Empowerment",
    "Other",
  ]),
  description: z.string().min(12),
  howHeard: z.string().optional(),
});

export async function submitHelpApplication(formData: FormData) {
  const parsed = helpSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    helpType: formData.get("helpType"),
    description: formData.get("description"),
    howHeard: formData.get("howHeard"),
  });

  const data = parsed.success ? parsed.data : null;

  if (!data) {
    return flashAndRedirect("/apply", {
      type: "error",
      title: "Application not submitted",
      description: "Please complete all required help application fields correctly.",
    });
  }

  const evidenceImageFiles = getFileInputs(formData, "evidenceImages");

  await addHelpApplication({
    ...data,
    evidenceImageFiles,
  });
  revalidatePath("/admin/applications");

  await sendTransactionalEmail({
    to: process.env.ADMIN_EMAIL || "admin@daaicf.org",
    subject: `New Help Application from ${data.name}`,
    html: `<p>A new help application was submitted by <strong>${data.name}</strong>.</p><p>Type: ${data.helpType}</p><p>Location: ${data.location}</p><p>Evidence images: ${evidenceImageFiles.length}</p>`,
  });

  await flashAndRedirect(
    `/apply/success?name=${encodeURIComponent(data.name)}`,
    {
      type: "success",
      title: "Application received",
      description: "Your request has been submitted successfully.",
    }
  );
}

const sponsorSchema = z.object({
  name: z.string().min(2),
  orgName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  applicantType: z.enum(["Individual", "Corporate"]),
  sponsorshipPreference: z.enum([
    "General Support",
    "Specific Sector(s)",
    "Specific Project(s)",
  ]),
  sectorInterests: z
    .enum([
      "Health",
      "Education",
      "Empowerment",
      "Events",
      "Infrastructure",
      "Relief",
    ])
    .array()
    .default([]),
  budgetRange: z.string().min(2),
  message: z.string().optional(),
  projectIds: z.array(z.string()).default([]),
});

export async function submitSponsorApplication(formData: FormData) {
  const parsed = sponsorSchema.safeParse({
    name: formData.get("name"),
    orgName: formData.get("orgName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    applicantType: formData.get("applicantType"),
    sponsorshipPreference: formData.get("sponsorshipPreference"),
    sectorInterests: formData.getAll("sectorInterests"),
    budgetRange: formData.get("budgetRange"),
    message: formData.get("message"),
    projectIds: formData.getAll("projectIds"),
  });

  const data = parsed.success ? parsed.data : null;

  if (!data) {
    return flashAndRedirect("/apply/sponsor", {
      type: "error",
      title: "Application not submitted",
      description:
        "Please complete the sponsorship form before sending your request.",
    });
  }

  const sectorInterests =
    data.sponsorshipPreference === "Specific Sector(s)"
      ? Array.from(new Set(data.sectorInterests)) as SponsorSector[]
      : [];
  const projectIds =
    data.sponsorshipPreference === "Specific Project(s)"
      ? Array.from(new Set(data.projectIds))
      : [];

  if (
    data.sponsorshipPreference === "Specific Sector(s)" &&
    sectorInterests.length === 0
  ) {
    return flashAndRedirect("/apply/sponsor", {
      type: "error",
      title: "Sector selection required",
      description:
        "Choose at least one sector when you select sector-based sponsorship.",
    });
  }

  if (
    data.sponsorshipPreference === "Specific Project(s)" &&
    projectIds.length === 0
  ) {
    return flashAndRedirect("/apply/sponsor", {
      type: "error",
      title: "Project selection required",
      description:
        "Choose at least one active project when you select specific project sponsorship.",
    });
  }

  await addSponsorApplication({
    ...data,
    sectorInterests,
    projectIds,
  });
  revalidatePath("/admin/applications/sponsors");

  await sendTransactionalEmail({
    to: process.env.ADMIN_EMAIL || "admin@daaicf.org",
    subject: `New Sponsor Application from ${data.orgName || data.name}`,
    html: `<p><strong>${data.name}</strong> submitted a sponsor application.</p><p>Preference: ${data.sponsorshipPreference}</p><p>Sectors: ${sectorInterests.length > 0 ? sectorInterests.join(", ") : "General"}</p><p>Requested projects: ${projectIds.length}</p>`,
  });

  await flashAndRedirect("/apply/sponsor", {
    type: "success",
    title: "Sponsorship interest submitted",
    description: "Our team will review your request and follow up shortly.",
  });
}

const partnerSchema = z.object({
  orgName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  orgType: z.string().min(2),
  website: z
    .string()
    .trim()
    .url("Enter a valid website URL.")
    .refine(
      (value) => value === "" || /^https?:\/\//i.test(value),
      "Use a website link that starts with http:// or https://."
    )
    .or(z.literal("")),
  description: z.string().min(12),
  partnershipInterests: z
    .enum([
      "Health Outreach",
      "Education",
      "Food Relief",
      "Empowerment",
      "Events",
      "General",
    ])
    .array()
    .min(1),
});

export async function submitPartnerApplication(formData: FormData) {
  const parsed = partnerSchema.safeParse({
    orgName: formData.get("orgName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    orgType: formData.get("orgType"),
    website: formData.get("website"),
    description: formData.get("description"),
    partnershipInterests: formData.getAll("partnershipInterests"),
  });

  const data = parsed.success ? parsed.data : null;

  if (!data) {
    return flashAndRedirect("/apply/partner", {
      type: "error",
      title: "Request not submitted",
      description:
        "Please complete the partnership form and select at least one interest.",
    });
  }

  await addPartnerApplication({
    ...data,
    website: data.website || undefined,
    partnershipInterests: Array.from(new Set(data.partnershipInterests)),
  });
  revalidatePath("/admin/applications/partners");

  await sendTransactionalEmail({
    to: process.env.ADMIN_EMAIL || "admin@daaicf.org",
    subject: `New Partner Application from ${data.orgName}`,
    html: `<p><strong>${data.orgName}</strong> submitted a partnership request.</p><p>Interests: ${data.partnershipInterests.join(", ")}</p>`,
  });

  await flashAndRedirect("/apply/partner", {
    type: "success",
    title: "Partnership request submitted",
    description: "We have received your proposal and will be in touch after review.",
  });
}

