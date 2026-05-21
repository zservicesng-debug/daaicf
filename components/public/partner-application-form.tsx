"use client";

import { submitPartnerApplication } from "@/app/_actions/public";
import { SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const interests = [
  "Health Outreach",
  "Education",
  "Food Relief",
  "Empowerment",
  "Events",
  "General",
] as const;

export function PartnerApplicationForm() {
  return (
    <form
      action={submitPartnerApplication}
      className="space-y-5"
      data-submit-toast-title="Submitting partnership request"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">Organisation Name</label>
          <TextInput name="orgName" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Contact Person</label>
          <TextInput name="contactName" required />
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
        <label className="mb-2 block text-sm font-semibold">Type of Organisation</label>
        <SelectInput name="orgType" defaultValue="" required>
          <option value="" disabled>
            Select organisation type
          </option>
          <option value="NGO">NGO</option>
          <option value="Corporate">Corporate</option>
          <option value="Faith-Based">Faith-Based</option>
          <option value="Education">Education</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Government">Government</option>
        </SelectInput>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Partnership Interest</p>
        <div className="grid gap-3 md:grid-cols-2">
          {interests.map((interest) => (
            <label
              key={interest}
              className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 text-sm text-[var(--color-text-muted)]"
            >
              <input type="checkbox" name="partnershipInterests" value={interest} className="mt-1" />
              {interest}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Description of Proposed Partnership
        </label>
        <TextArea name="description" required />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Website</label>
        <TextInput name="website" placeholder="https://example.org" />
      </div>

      <div className="rounded-[var(--radius-card)] border border-[#cde5d2] bg-[#eef8f0] p-4 text-sm text-[var(--color-text-muted)]">
        We review every proposal carefully and follow up with the most aligned partnerships.
      </div>

      <SubmitButton>Submit Partnership Request</SubmitButton>
    </form>
  );
}
