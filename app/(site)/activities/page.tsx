import Link from "next/link";
import { Search } from "lucide-react";
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

function buildActivitiesHref(category: string, page: number, search = "") {
  const params = new URLSearchParams();

  if (category !== "All") {
    params.set("category", category);
  }

  if (search.trim()) {
    params.set("q", search.trim());
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
  const searchQuery = String(searchParams.q || "").trim();
  const currentPage = Number(searchParams.page || 1);
  const currentHref = buildActivitiesHref(activeCategory, currentPage, searchQuery);
  const { items, totalPages } = await listPosts({
    category: activeCategory,
    search: searchQuery,
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

          <form action="/activities" className="flex flex-col gap-3 sm:flex-row">
            {activeCategory !== "All" ? (
              <input type="hidden" name="category" value={activeCategory} />
            ) : null}
            <label className="relative flex-1">
              <span className="sr-only">Search activities</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder="Search activities by title, category, or story"
                className="input-shell pl-11"
              />
            </label>
            <button
              type="submit"
              className="touch-target inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              Search
            </button>
            {searchQuery ? (
              <Link
                href={buildActivitiesHref(activeCategory, 1)}
                className="touch-target inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-text)]"
              >
                Clear
              </Link>
            ) : null}
          </form>

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
                {searchQuery ? "No matching activities" : "No activities published yet"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 muted-copy">
                {searchQuery
                  ? "Try a different title, category, or story search."
                  : "Activity updates will appear here once the foundation publishes its first post."}
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
                  href={buildActivitiesHref(activeCategory, currentPage - 1, searchQuery)}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] transition motion-safe:hover:-translate-y-0.5 hover:border-[rgba(26,92,42,0.22)] hover:text-[var(--color-primary)]"
                >
                  <span aria-hidden>←</span>
                  Back
                </Link>
              ) : null}

              {getVisiblePages(currentPage, totalPages).map((page) => {
                const href = buildActivitiesHref(activeCategory, page, searchQuery);

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
                  href={buildActivitiesHref(activeCategory, currentPage + 1, searchQuery)}
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
