"use client";

import { useEffect, useState } from "react";
import { saveTeamMemberAction } from "@/app/_actions/admin";
import { FieldLabel, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialsFromName } from "@/lib/utils";
import { type TeamMember } from "@/types";

function isPreviewableImageUrl(url: string) {
  return /^https?:\/\//i.test(url.trim()) || url.startsWith("data:image/");
}

export function TeamMemberForm({ member }: { member?: TeamMember | null }) {
  const [name, setName] = useState(member?.name || "");
  const [role, setRole] = useState(member?.role || "");
  const [description, setDescription] = useState(member?.description || "");
  const [isFeatured, setIsFeatured] = useState(member?.isFeatured || false);
  const [imageLink, setImageLink] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [clearImage, setClearImage] = useState(false);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const previewImage =
    filePreview ||
    (isPreviewableImageUrl(imageLink) ? imageLink.trim() : "") ||
    (!clearImage ? member?.imageUrl || "" : "");
  const initials = initialsFromName(name || member?.name || "Team Member") || "TM";

  return (
    <form action={saveTeamMemberAction} className="space-y-8">
      <input type="hidden" name="id" value={member?.id || ""} />

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <TextInput
                id="name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Dr. Andrew A. Igwe"
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <TextInput
                id="role"
                name="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Executive Director"
                required
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="sortOrder">Display Order</FieldLabel>
            <TextInput
              id="sortOrder"
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={member?.sortOrder ?? 1}
              required
            />
            <p className="mt-2 text-sm muted-copy">
              Lower numbers appear first on the public team page.
            </p>
          </div>

          <label className="inline-flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-4 py-4 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              name="isFeatured"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
              className="mt-1"
            />
            <span>
              Mark as featured
              <span className="mt-1 block muted-copy">
                Only one member can be featured at a time. Saving this will move the
                spotlight to this profile on the public team page.
              </span>
            </span>
          </label>

          <div>
            <FieldLabel htmlFor="description">Short Bio</FieldLabel>
            <TextArea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Share a concise introduction for this team member."
              className="min-h-40"
              required
            />
          </div>

          <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Member Photo
              </p>
              <p className="mt-1 text-sm muted-copy">
                Upload an image file or paste a direct image link. If both are
                provided, the uploaded file will be used.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <FieldLabel htmlFor="imageFile">Upload Photo</FieldLabel>
                <TextInput
                  id="imageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] || null;
                    setFilePreview((current) => {
                      if (current) {
                        URL.revokeObjectURL(current);
                      }

                      return nextFile ? URL.createObjectURL(nextFile) : null;
                    });
                  }}
                />
              </div>

              <div>
                <FieldLabel htmlFor="imageUrl" optional>
                  Or Use an Image Link
                </FieldLabel>
                <TextInput
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={imageLink}
                  onChange={(event) => setImageLink(event.target.value)}
                  placeholder="https://example.com/team-member.jpg"
                />
              </div>

              {member?.imageUrl ? (
                <label className="inline-flex items-center gap-3 text-sm text-[var(--color-text)]">
                  <input
                    type="checkbox"
                    name="clearImage"
                    checked={clearImage}
                    onChange={(event) => setClearImage(event.target.checked)}
                  />
                  Remove the current photo if you save without uploading or pasting a
                  replacement.
                </label>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,#fdfefd_0%,#edf3ea_100%)] p-5 shadow-soft xl:sticky xl:top-8">
            <p className="section-eyebrow">Preview</p>
            <div className="mt-4 overflow-hidden rounded-[22px] border border-white/70 bg-white">
              <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_top,rgba(26,92,42,0.16),transparent_45%),linear-gradient(180deg,#f5f7f2_0%,#dde9da_100%)]">
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt={name || member?.name || "Team member preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--color-primary)] text-3xl font-semibold text-white shadow-[0_16px_40px_rgba(18,61,28,0.22)]">
                      {initials}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <h2 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                    {name || "Team member name"}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold tracking-[0.04em] text-[var(--color-accent)] uppercase">
                      {role || "Role"}
                    </p>
                    {isFeatured ? (
                      <span className="rounded-full bg-[rgba(26,92,42,0.1)] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--color-primary)] uppercase">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm leading-7 muted-copy">
                  {description ||
                    "The short bio will appear here to help visitors understand this person's contribution to the foundation."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubmitButton>{member ? "Save Team Member" : "Add Team Member"}</SubmitButton>
    </form>
  );
}
