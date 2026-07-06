import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/site-url";
import { listPosts } from "@/lib/store";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about/dr-andrew-igwe", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about/team", changeFrequency: "monthly", priority: 0.6 },
  { path: "/activities", changeFrequency: "weekly", priority: 0.9 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.7 },
  { path: "/apply", changeFrequency: "monthly", priority: 0.7 },
  { path: "/apply/sponsor", changeFrequency: "monthly", priority: 0.7 },
  { path: "/apply/partner", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppBaseUrl();
  const now = new Date();
  const { items: posts } = await listPosts({
    publishedOnly: true,
    page: 1,
    perPage: 1000,
  });

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/activities/${post.slug}`,
      lastModified: new Date(post.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
