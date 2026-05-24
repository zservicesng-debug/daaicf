import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { deleteTeamMemberAction } from "@/app/_actions/admin";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listTeamMembers } from "@/lib/store";

export default async function AdminTeamPage() {
  const teamMembers = await listTeamMembers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
            Team
          </h1>
          <p className="mt-2 max-w-2xl muted-copy">
            Add, update, and reorder the people shown on the public team page.
            Each member can have a role, short bio, and photo from upload or link.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href="/about/team"
            variant="surface"
            className="rounded-[var(--radius-card)]"
          >
            <Eye className="h-4 w-4" />
            View Public Page
          </ButtonLink>
          <ButtonLink href="/admin/team/new" className="rounded-[var(--radius-card)]">
            + New Team Member
          </ButtonLink>
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            No team members yet
          </h2>
          <p className="mt-2 max-w-2xl muted-copy">
            Create the first profile to power the new team page on the public site.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {teamMembers.map((member) => {
            const deleteMember = deleteTeamMemberAction.bind(null, member.id);

            return (
              <Card key={member.id} className="p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-[var(--color-primary)] text-xl font-semibold text-white">
                      {member.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        member.initials
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                            {member.name}
                          </h2>
                          <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[var(--color-primary)] uppercase">
                            Order {member.sortOrder}
                          </span>
                          {member.isFeatured ? (
                            <span className="rounded-full bg-[rgba(26,92,42,0.1)] px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[var(--color-primary)] uppercase">
                              Featured
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm font-semibold tracking-[0.04em] text-[var(--color-accent)] uppercase">
                          {member.role}
                        </p>
                      </div>
                      <p className="max-w-3xl text-sm leading-7 muted-copy">
                        {member.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/team/${member.id}/edit`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[rgba(26,92,42,0.2)] hover:text-[var(--color-primary)]"
                      aria-label={`Edit ${member.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={deleteMember}>
                      <button
                        type="submit"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#efb3b3] bg-white text-[#a12626] hover:bg-[#fff5f5]"
                        aria-label={`Delete ${member.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
