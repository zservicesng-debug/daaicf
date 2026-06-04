import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MessageSquareMore } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSocialLinks } from "@/lib/social";
import { categoryTone, cn, formatDate } from "@/lib/utils";
import { type Post } from "@/types";

export function PostCard({
  post,
  href,
  commentSlot,
}: {
  post: Post;
  href: string;
  commentSlot?: React.ReactNode;
}) {
  const socialLinks = getSocialLinks(post.socialLinks);

  return (
    <Card className="overflow-hidden">
      <Link
        href={href}
        aria-label={`Open ${post.title}`}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-surface-muted)]">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
          <Badge className={cn("absolute left-4 top-4", categoryTone(post.category))}>
            {post.category}
          </Badge>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <p className="flex items-center gap-2 text-sm muted-copy">
          <CalendarDays className="h-4 w-4" />
          {formatDate(post.createdAt)}
        </p>
        <div>
          <Link
            href={href}
            className="inline-flex max-w-full focus:outline-none focus-visible:underline focus-visible:underline-offset-4"
          >
            <h3 className="serif-display text-2xl font-semibold text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]">
              {post.title}
            </h3>
          </Link>
          {post.partnerName ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
              Partner: {post.partnerName}
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-7 muted-copy">{post.excerpt}</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]"
        >
          Read more <span aria-hidden>{">"}</span>
        </Link>

        {socialLinks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((item) => (
              <a
                key={`${post.id}-${item.label}`}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {item.label}
              </a>
            ))}
          </div>
        ) : null}

        {commentSlot ? (
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="mb-3 flex items-center gap-2 text-sm muted-copy">
              <MessageSquareMore className="h-4 w-4" />
              Leave a comment
            </p>
            {commentSlot}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
