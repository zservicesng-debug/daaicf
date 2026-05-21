import type { SettingsBundle } from "@/types";

type ConfiguredSocialLinks = Pick<
  SettingsBundle["contact"],
  "facebookUrl" | "twitterUrl" | "instagramUrl"
>;

const DEFAULT_FACEBOOK_URL = "https://facebook.com/daaicf";

function readEnvValue(name: string) {
  return process.env[name]?.trim() || "";
}

export function getConfiguredSocialLinks(): ConfiguredSocialLinks {
  return {
    facebookUrl: readEnvValue("FACEBOOK_URL") || DEFAULT_FACEBOOK_URL,
    twitterUrl: readEnvValue("TWITTER_URL"),
    instagramUrl: readEnvValue("INSTAGRAM_URL"),
  };
}

export function resolveConfiguredSocialLinks(
  links?: Partial<ConfiguredSocialLinks>
): ConfiguredSocialLinks {
  const configured = getConfiguredSocialLinks();

  return {
    facebookUrl: links?.facebookUrl?.trim() || configured.facebookUrl,
    twitterUrl: links?.twitterUrl?.trim() || configured.twitterUrl,
    instagramUrl: links?.instagramUrl?.trim() || configured.instagramUrl,
  };
}
