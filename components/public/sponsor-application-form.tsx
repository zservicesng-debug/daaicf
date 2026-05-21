"use client";

import { useMemo, useState } from "react";
import { submitSponsorApplication } from "@/app/_actions/public";
import { SubmitButton } from "@/components/ui/submit-button";
import { SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { type Project, type SponsorSector } from "@/types";

const sponsorSectorOptions: SponsorSector[] = [
  "Health",
  "Education",
  "Empowerment",
  "Events",
  "Infrastructure",
  "Relief",
];

const preferenceOptions = [
  {
    value: "General Support" as const,
    title: "General support",
    description:
      "I want the foundation to direct my sponsorship where it is most needed.",
  },
  {
    value: "Specific Sector(s)" as const,
    title: "Specific sector",
    description:
      "I want to support one or more focus areas like Health, Education, or Relief.",
  },
  {
    value: "Specific Project(s)" as const,
    title: "Specific project",
    description: "I already know the exact active project(s) I want to sponsor.",
  },
];

export function SponsorApplicationForm({ projects }: { projects: Project[] }) {
  const [applicantType, setApplicantType] = useState<"Individual" | "Corporate">(
    "Individual"
  );
  const [preference, setPreference] = useState<
    "General Support" | "Specific Sector(s)" | "Specific Project(s)"
  >("General Support");

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status === "active"),
    [projects]
  );

  return (
    <form
      action={submitSponsorApplication}
      className="space-y-5"
      data-submit-toast-title="Submitting sponsorship request"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold">
          Full Name / Organisation Name
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput name="name" placeholder="Primary contact" required />
          <TextInput name="orgName" placeholder="Organisation name" required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">Email Address</label>
          <TextInput name="email" type="email" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Phone Number</label>
          <TextInput name="phone" required />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Applicant Type</label>
        <div className="flex flex-wrap gap-3">
          {(["Individual", "Corporate"] as const).map((item) => (
            <label
              key={item}
              className={`cursor-pointer rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium ${
                applicantType === item
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)]"
              }`}
            >
              <input
                type="radio"
                name="applicantType"
                value={item}
                checked={applicantType === item}
                onChange={() => setApplicantType(item)}
                className="sr-only"
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Sponsorship Preference</p>
        {preferenceOptions.map((item) => (
          <label
            key={item.value}
            className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-muted)]"
          >
            <input
              type="radio"
              name="sponsorshipPreference"
              value={item.value}
              checked={preference === item.value}
              onChange={() => setPreference(item.value)}
              className="mt-1"
            />
            <span>
              <span className="block font-medium text-[var(--color-text)]">
                {item.title}
              </span>
              {item.description}
            </span>
          </label>
        ))}
      </div>

      {preference === "Specific Sector(s)" ? (
        <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            Select preferred sectors
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {sponsorSectorOptions.map((sector) => (
              <label
                key={sector}
                className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]"
              >
                <input
                  type="checkbox"
                  name="sectorInterests"
                  value={sector}
                  className="mt-1"
                />
                <span className="font-medium text-[var(--color-text)]">{sector}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {preference === "Specific Project(s)" ? (
        <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            Select active projects
          </p>
          <div className="grid gap-3">
            {activeProjects.map((project) => (
              <label
                key={project.id}
                className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]"
              >
                <input
                  type="checkbox"
                  name="projectIds"
                  value={project.id}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium text-[var(--color-text)]">
                    {project.title}
                  </span>
                  {project.description}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold">Budget Range</label>
        <SelectInput name="budgetRange" required defaultValue="">
          <option value="" disabled>
            Select a range
          </option>
          <option value="Below NGN 1m">Below NGN 1m</option>
          <option value="NGN 1m - NGN 5m">NGN 1m - NGN 5m</option>
          <option value="NGN 5m - NGN 10m">NGN 5m - NGN 10m</option>
          <option value="NGN 10m - NGN 25m">NGN 10m - NGN 25m</option>
          <option value="Above NGN 25m">Above NGN 25m</option>
        </SelectInput>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Message</label>
        <TextArea name="message" placeholder="Optional notes or expectations" />
      </div>

      <div className="rounded-[var(--radius-card)] border border-[#cde5d2] bg-[#eef8f0] p-4 text-sm text-[var(--color-text-muted)]">
        Your information will be handled with care and used only for sponsorship
        review.
      </div>

      <SubmitButton>Submit Sponsorship Interest</SubmitButton>
    </form>
  );
}
