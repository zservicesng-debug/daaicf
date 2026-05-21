import type { SettingsBundle, SocialLinks } from "@/types";

type SocialLinkSource =
  | SocialLinks
  | Pick<
      SettingsBundle["contact"],
      "facebookUrl" | "twitterUrl" | "instagramUrl"
    >;

export function getSocialLinks(links: SocialLinkSource) {
  return [
    { label: "Facebook", href: links.facebookUrl?.trim() || "" },
    { label: "Twitter", href: links.twitterUrl?.trim() || "" },
    { label: "Instagram", href: links.instagramUrl?.trim() || "" },
  ].filter((item) => item.href);
}
