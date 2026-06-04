import Link from "next/link";
import { CategoryFilter } from "@/components/public/category-filter";
import { QuickCommentForm } from "@/components/public/comment-form";
import { PageHero } from "@/components/public/page-hero";
import { PostCard } from "@/components/public/post-card";
import { listPosts } from "@/lib/store";

const categories = [
  "All",
  "Community Service",
  "Awards/Recognition",
  "Partnership",
  "Scholarship",
  "Education",
  "Health",
  "Empowerment",
  "Events",
  "Infrastructure",
];

function buildActivitiesHref(category: string, page: number) {
  const params = new URLSearchParams();

  if (category !== "All") {
    params.set("category", category);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/activities?${query}` : "/activities";
}

function buildDetailHref(slug: string, returnHref: string) {
  const params = new URLSearchParams();
  params.set("from", returnHref);
  return `/activities/${slug}?${params.toString()}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const maxStart = Math.max(1, totalPages - 2);
  const startPage = currentPage === 1 ? 1 : Math.min(currentPage, maxStart);
  const endPage = Math.min(totalPages, startPage + 2);

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
}

export default async function ActivitiesPage(props: PageProps<"/activities">) {
  const searchParams = await props.searchParams;
  const activeCategory = (searchParams.category as string) || "All";
  const currentPage = Number(searchParams.page || 1);
  const currentHref = buildActivitiesHref(activeCategory, currentPage);
  const { items, totalPages } = await listPosts({
    category: activeCategory,
    page: currentPage,
    perPage: 6,
    publishedOnly: true,
  });

  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Our Activities"
        description="Explore our programmes, events, and community interventions across Nigeria."
      />

      <section className="site-section bg-white">
        <div className="site-container space-y-8">
          <CategoryFilter
            pathname="/activities"
            categories={categories}
            active={activeCategory}
          />

          {items.length > 0 ? (
            <div data-reveal-group className="grid gap-6 lg:grid-cols-3">
              {items.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  href={buildDetailHref(post.slug, currentHref)}
                  commentSlot={<QuickCommentForm postId={post.id} postSlug={post.slug} />}
                />
              ))}
            </div>
          ) : (
            <div
              data-reveal="fade"
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-8"
            >
              <h2 className="serif-display text-2xl font-semibold text-[var(--color-text)]">
                No activities published yet
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 muted-copy">
                Activity updates will appear here once the foundation publishes its
                first post.
              </p>
            </div>
          )}

          {items.length > 0 && totalPages > 1 ? (
            <div
              data-reveal="fade"
              className="flex flex-wrap items-center justify-center gap-3 pt-4"
            >
              {currentPage > 1 ? (
                <Link
                  href={buildActivitiesHref(activeCategory, currentPage - 1)}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] transition motion-safe:hover:-translate-y-0.5 hover:border-[rgba(26,92,42,0.22)] hover:text-[var(--color-primary)]"
                >
                  <span aria-hidden>←</span>
                  Back
                </Link>
              ) : null}

              {getVisiblePages(currentPage, totalPages).map((page) => {
                const href = buildActivitiesHref(activeCategory, page);

                return (
                  <Link
                    key={page}
                    href={href}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-transform motion-safe:hover:-translate-y-0.5 ${
                      page === currentPage
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-soft"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[rgba(26,92,42,0.22)] hover:text-[var(--color-primary)]"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}

              {currentPage < totalPages ? (
                <Link
                  href={buildActivitiesHref(activeCategory, currentPage + 1)}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] transition motion-safe:hover:-translate-y-0.5 hover:border-[rgba(26,92,42,0.22)] hover:text-[var(--color-primary)]"
                >
                  Next
                  <span aria-hidden>→</span>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
