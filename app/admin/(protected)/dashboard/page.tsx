import Link from "next/link";
import {
  FileText,
  FolderKanban,
  ImageIcon,
  MessageSquareText,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Card } from "@/components/ui/card";
import { getDashboardSnapshot, getStore } from "@/lib/store";
import { statusTone } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const snapshot = await getDashboardSnapshot();
  const { applications, comments, posts } = await getStore();
  const recentApplications = applications.slice(0, 4);
  const pendingComments = comments.filter((item) => item.status === "pending").slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Dashboard
        </h1>
        <p className="mt-2 muted-copy">
          Welcome back. Here&apos;s what&apos;s happening.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        <StatCard
          label="Total Posts"
          value={snapshot.totalPosts}
          icon={<FileText className="h-6 w-6 text-[var(--color-primary)]" />}
          tone="bg-[#E8F6EC]"
          href="/admin/posts"
        />
        <StatCard
          label="New Applications"
          value={snapshot.newApplications}
          icon={<FolderKanban className="h-6 w-6 text-[#C41E1E]" />}
          tone="bg-[#FDECEC]"
          href="/admin/applications"
        />
        <StatCard
          label="Pending Comments"
          value={snapshot.pendingComments}
          icon={<MessageSquareText className="h-6 w-6 text-[#A35C22]" />}
          tone="bg-[#FFF5E7]"
          href="/admin/comments"
        />
        <StatCard
          label="Gallery Media"
          value={snapshot.galleryImages}
          icon={<ImageIcon className="h-6 w-6 text-[#1E4F8E]" />}
          tone="bg-[#EAF1FF]"
          href="/admin/gallery"
        />
        <StatCard
          label="Active Sponsors"
          value={snapshot.activeSponsors}
          icon={<Users className="h-6 w-6 text-[var(--color-primary)]" />}
          tone="bg-[#E8F6EC]"
          href="/admin/sponsors"
        />
        <StatCard
          label="Active Partners"
          value={snapshot.activePartners}
          icon={<Users className="h-6 w-6 text-[#1E4F8E]" />}
          tone="bg-[#EAF1FF]"
          href="/admin/partners"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Recent Applications
            </h2>
            <Link
              href="/admin/applications"
              className="text-sm font-semibold text-[var(--color-primary)]"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {recentApplications.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{item.name}</p>
                  <p className="text-sm muted-copy">
                    {item.helpType} - {item.location}
                  </p>
                </div>
                <span
                  className={`rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold ${statusTone(item.status)}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Pending Comments
            </h2>
            <Link
              href="/admin/comments"
              className="text-sm font-semibold text-[var(--color-primary)]"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {pendingComments.map((item) => {
              const post = posts.find((postItem) => postItem.id === item.postId);
              return (
                <div key={item.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-[var(--color-text)]">
                      {item.authorName}
                    </p>
                    <p className="text-sm muted-copy">{item.createdAt.slice(0, 10)}</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 muted-copy">{item.message}</p>
                  <p className="mt-2 text-sm muted-copy">On: {post?.title}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
