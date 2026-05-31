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

export default async function ActivitiesPage(props: PageProps<"/activities">) {
  const searchParams = await props.searchParams;
  const activeCategory = (searchParams.category as string) || "All";
  const currentPage = Number(searchParams.page || 1);
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
            <div data-reveal="fade" className="flex flex-wrap justify-center gap-3 pt-4">
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const params = new URLSearchParams();
                if (activeCategory !== "All") {
                  params.set("category", activeCategory);
                }
                if (page > 1) {
                  params.set("page", String(page));
                }
                const href = params.toString()
                  ? `/activities?${params.toString()}`
                  : "/activities";

                return (
                  <a
                    key={page}
                    href={href}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-transform motion-safe:hover:-translate-y-0.5 ${
                      page === currentPage
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)]"
                    }`}
                  >
                    {page}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
