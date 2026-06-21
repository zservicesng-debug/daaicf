import Image from "next/image";
import { ArrowLeft, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { FullCommentForm } from "@/components/public/comment-form";
import { PostContentWithImages } from "@/components/public/post-content-with-images";
import { PostGalleryLightbox } from "@/components/public/post-gallery-lightbox";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getSocialLinks } from "@/lib/social";
import { getPostBySlug, listComments } from "@/lib/store";
import { distributePostGalleryImages } from "@/lib/post-content";
import { categoryTone, cn, excerpt, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

function getSafeReturnHref(value: unknown) {
  if (typeof value !== "string") {
    return "/activities";
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/activities";
  }

  return trimmed;
}

export async function generateMetadata(
  props: PageProps<"/activities/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    return {
      title: "Activity not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = post.excerpt || excerpt(post.content, 160);

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/activities/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      url: `/activities/${post.slug}`,
      type: "article",
      publishedTime: post.createdAt,
      images: [
        {
          url: post.coverImageUrl,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [post.coverImageUrl],
    },
  };
}

export default async function ActivityDetailPage(
  props: PageProps<"/activities/[slug]">
) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  const returnHref = getSafeReturnHref(searchParams.from);
  const returnLabel =
    returnHref === "/"
      ? "Back to home"
      : returnHref.startsWith("/activities")
        ? "Back to activities"
        : "Go back";

  const comments = (await listComments(post.id)).filter(
    (comment) => comment.status === "approved"
  );
  const socialLinks = getSocialLinks(post.socialLinks);
  const { contentSegments, inlineImageUrls, remainingImageUrls } =
    distributePostGalleryImages(post.content, post.galleryImageUrls);

  return (
    <article className="bg-white">
      <div className="relative aspect-[16/6] min-h-[280px] overflow-hidden bg-[var(--color-surface-muted)]">
        <Image
          src={post.coverImageUrl}
          alt={post.title}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="site-container -mt-16 relative pb-20">
        <div className="card-surface mx-auto max-w-4xl p-6 md:p-10">
          <ButtonLink href={returnHref} variant="surface" className="mb-6 w-fit">
            <ArrowLeft className="h-4 w-4" />
            {returnLabel}
          </ButtonLink>
          <Badge className={cn(categoryTone(post.category))}>{post.category}</Badge>
          {post.partnerName ? (
            <p className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
              Partner: {post.partnerName}
            </p>
          ) : null}
          <p className="mt-4 flex items-center gap-2 text-sm muted-copy">
            <CalendarDays className="h-4 w-4" />
            {formatDate(post.createdAt)}
          </p>
          <h1 className="serif-display mt-5 text-4xl font-bold text-[var(--color-text)] md:text-6xl">
            {post.title}
          </h1>
          {socialLinks.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  key={`${post.id}-${item.label}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  View on {item.label}
                </a>
              ))}
            </div>
          ) : null}
          <PostContentWithImages
            title={post.title}
            contentSegments={contentSegments}
            imageUrls={inlineImageUrls}
          />
        </div>

        {remainingImageUrls.length > 0 ? (
          <section className="mx-auto mt-10 max-w-4xl">
            <div className="card-surface p-6 md:p-8">
              <h2 className="serif-display text-3xl font-semibold text-[var(--color-text)]">
                More Photos
              </h2>
              <p className="mt-2 text-sm muted-copy">
                Additional moments from this outreach and activity. Showing{" "}
                {remainingImageUrls.length} photo
                {remainingImageUrls.length === 1 ? "" : "s"}.
              </p>
              <PostGalleryLightbox
                title={post.title}
                imageUrls={remainingImageUrls}
              />
            </div>
          </section>
        ) : null}

        <section className="mx-auto mt-10 max-w-4xl space-y-6">
          <h2 className="serif-display text-3xl font-semibold text-[var(--color-text)]">
            Comments ({comments.length})
          </h2>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="card-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[var(--color-text)]">
                    {comment.authorName}
                  </p>
                  <p className="text-sm muted-copy">{formatDate(comment.createdAt)}</p>
                </div>
                <p className="mt-3 leading-8 muted-copy">{comment.message}</p>
              </div>
            ))}
          </div>

          <div className="card-surface p-6">
            <h3 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
              Leave a comment
            </h3>
            <p className="mt-2 text-sm muted-copy">
              New comments are reviewed before they appear publicly.
            </p>
            <div className="mt-5">
              <FullCommentForm postId={post.id} postSlug={post.slug} />
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
