function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeAbsoluteUrl(value: string) {
  const trimmed = trimTrailingSlash(value.trim());

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function getAppBaseUrl() {
  return normalizeAbsoluteUrl(
    process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.PORTAL_INVITE_REDIRECT_TO?.replace(/\/auth\/invite.*$/, "") ||
      "https://daaicf.org"
  );
}

export function appUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${getAppBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function appendSearchParam(url: string, key: string, value: string) {
  const parsed = new URL(url);
  parsed.searchParams.set(key, value);
  return parsed.toString();
}
