import { saveSettingsAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { getStore } from "@/lib/store";

export default async function AdminSettingsPage() {
  const { settings } = await getStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Settings
        </h1>
        <p className="mt-2 muted-copy">Update foundation info and impact statistics.</p>
      </div>

      <form action={saveSettingsAction} className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Impact Statistics</h2>
          <div>
            <label className="mb-2 block text-sm font-semibold">Communities Reached</label>
            <TextInput name="communitiesReached" defaultValue={settings.impact.communitiesReached} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Beneficiaries Supported</label>
            <TextInput name="beneficiariesSupported" defaultValue={settings.impact.beneficiariesSupported} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Events Held</label>
            <TextInput name="eventsHeld" defaultValue={settings.impact.eventsHeld} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Years of Service</label>
            <TextInput name="yearsOfService" defaultValue={settings.impact.yearsOfService} />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Contact Information</h2>
          <div>
            <label className="mb-2 block text-sm font-semibold">Email Address</label>
            <TextInput name="email" defaultValue={settings.contact.email} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Phone Number</label>
            <TextInput name="phone" defaultValue={settings.contact.phone} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Address</label>
            <TextInput name="address" defaultValue={settings.contact.address} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Facebook URL</label>
            <TextInput name="facebookUrl" defaultValue={settings.contact.facebookUrl} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Twitter URL</label>
            <TextInput name="twitterUrl" defaultValue={settings.contact.twitterUrl} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Instagram URL</label>
            <TextInput name="instagramUrl" defaultValue={settings.contact.instagramUrl} />
          </div>
        </Card>

        <div className="xl:col-span-2">
          <SubmitButton>Save Settings</SubmitButton>
        </div>
      </form>
    </div>
  );
}

