type EmailDetail = {
  label: string;
  value?: string | number | null;
};

type EmailCta = {
  label: string;
  href: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getAppBaseUrl() {
  return trimTrailingSlash(
    process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.PORTAL_INVITE_REDIRECT_TO?.replace(/\/auth\/invite.*$/, "") ||
      "http://localhost:3000"
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

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderDetails(details: EmailDetail[]) {
  return details
    .filter((detail) => detail.value !== undefined && detail.value !== null && detail.value !== "")
    .map(
      (detail) => `
        <tr>
          <td style="padding:10px 0;color:#5f6b62;font-size:14px;width:160px;vertical-align:top;">${escapeHtml(detail.label)}</td>
          <td style="padding:10px 0;color:#122016;font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(detail.value)}</td>
        </tr>`
    )
    .join("");
}

export function renderEmailLayout(input: {
  title: string;
  intro: string;
  details?: EmailDetail[];
  cta?: EmailCta;
  secondaryCta?: EmailCta;
  footer?: string;
}) {
  const details = input.details?.length
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-top:1px solid #dce5dd;border-bottom:1px solid #dce5dd;margin:24px 0;">${renderDetails(input.details)}</table>`
    : "";
  const cta = input.cta
    ? `<p style="margin:28px 0 0;"><a href="${escapeHtml(input.cta.href)}" style="display:inline-block;background:#1a5c2a;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:8px;">${escapeHtml(input.cta.label)}</a></p>`
    : "";
  const secondaryCta = input.secondaryCta
    ? `<p style="margin:14px 0 0;"><a href="${escapeHtml(input.secondaryCta.href)}" style="color:#1a5c2a;font-weight:700;">${escapeHtml(input.secondaryCta.label)}</a></p>`
    : "";

  return `
    <div style="margin:0;padding:0;background:#f6faf7;font-family:Arial,sans-serif;color:#122016;">
      <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
        <div style="background:#ffffff;border:1px solid #dce5dd;border-radius:10px;padding:30px;">
          <p style="margin:0 0 10px;color:#1a5c2a;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">DAAICF Portal</p>
          <h1 style="margin:0;color:#122016;font-size:26px;line-height:1.25;">${escapeHtml(input.title)}</h1>
          <p style="margin:18px 0 0;color:#46544a;font-size:16px;line-height:1.7;">${escapeHtml(input.intro)}</p>
          ${details}
          ${cta}
          ${secondaryCta}
          ${
            input.footer
              ? `<p style="margin:28px 0 0;color:#6d786f;font-size:13px;line-height:1.6;">${escapeHtml(input.footer)}</p>`
              : ""
          }
        </div>
      </div>
    </div>`;
}
