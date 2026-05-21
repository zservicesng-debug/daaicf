import { saveProfileAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";
import { getUserById } from "@/lib/store";

export default async function SponsorProfilePage() {
  const session = await requireAuthorizedPortalPageSession("sponsor");
  const profile = await getUserById(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Profile
        </h1>
        <p className="mt-2 muted-copy">Update your sponsor contact details.</p>
      </div>
      <Card className="max-w-2xl p-6 md:p-8">
        <form action={saveProfileAction} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">Display Name</label>
            <TextInput name="displayName" defaultValue={profile?.displayName} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Organisation</label>
            <TextInput name="orgName" defaultValue={profile?.orgName} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Email</label>
            <TextInput name="email" type="email" defaultValue={profile?.email} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Phone</label>
            <TextInput name="phone" defaultValue={profile?.phone} />
          </div>
          <SubmitButton>Save Profile</SubmitButton>
        </form>
      </Card>
    </div>
  );
}

