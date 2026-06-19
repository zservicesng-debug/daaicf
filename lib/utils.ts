import { clsx, type ClassValue } from "clsx";
import {
  type ApplicationStatus,
  type GalleryAlbum,
  type GalleryMediaType,
  type HelpType,
  type PostCategory,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function excerpt(value: string, length = 140) {
  const plain = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= length) {
    return plain;
  }

  return `${plain.slice(0, length).trim()}...`;
}

export function numberLabel(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function categoryTone(category: PostCategory | GalleryAlbum | HelpType) {
  switch (category) {
    case "Health":
    case "Medical":
      return "bg-[#C41E1E] text-white";
    case "Education":
      return "bg-[#1A5C2A] text-white";
    case "Empowerment":
      return "bg-[#A35C22] text-white";
    case "Events":
      return "bg-[#1E4F8E] text-white";
    case "Community Service":
      return "bg-[#2E7D61] text-white";
    case "Awards/Recognition":
      return "bg-[#7B5A14] text-white";
    case "Partnership":
      return "bg-[#5A4FA3] text-white";
    case "Scholarship":
      return "bg-[#1B6C8D] text-white";
    case "Infrastructure":
      return "bg-[#4D6B73] text-white";
    case "Food/Relief":
      return "bg-[#4A6650] text-white";
    default:
      return "bg-[var(--color-primary)] text-white";
  }
}

export function statusTone(status: ApplicationStatus | "pending" | "approved") {
  switch (status) {
    case "new":
      return "bg-[#E8F1FF] text-[#2553B8]";
    case "reviewed":
    case "pending":
      return "bg-[#FFF5E7] text-[#A35C22]";
    case "approved":
      return "bg-[#E8F6EC] text-[#1A5C2A]";
    case "rejected":
      return "bg-[#FDECEC] text-[#A12626]";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function encodeSvg(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function createPlaceholderImage(options: {
  title: string;
  subtitle?: string;
  accent?: string;
  background?: string;
  textColor?: string;
}) {
  const {
    title,
    subtitle = "",
    accent = "#C41E1E",
    background = "#1A5C2A",
    textColor = "#FFFFFF",
  } = options;

  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${safeTitle}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#123D1C" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" rx="36" fill="url(#bg)" />
      <circle cx="890" cy="250" r="250" fill="rgba(255,255,255,0.08)" />
      <circle cx="890" cy="250" r="320" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
      <circle cx="250" cy="700" r="210" fill="rgba(255,255,255,0.06)" />
      <rect x="80" y="110" width="228" height="58" rx="29" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)" />
      <circle cx="120" cy="139" r="8" fill="${accent}" />
      <text x="145" y="148" fill="white" font-size="24" font-weight="700" font-family="Arial, Helvetica, sans-serif">DAAICF</text>
      <circle cx="980" cy="680" r="68" fill="${accent}" fill-opacity="0.96" />
      <path d="M962 679 l18 -30 l18 30 l-18 18 z" fill="white" />
      <text x="80" y="560" fill="${textColor}" font-size="96" font-weight="700" font-family="Georgia, serif">${safeTitle}</text>
      <text x="84" y="636" fill="rgba(255,255,255,0.78)" font-size="34" font-family="Arial, Helvetica, sans-serif">${safeSubtitle}</text>
    </svg>
  `);
}

export function guessGalleryMediaTypeFromUrl(url: string): GalleryMediaType {
  const normalized = url.split("?")[0]?.split("#")[0]?.toLowerCase() || "";

  if (
    normalized.endsWith(".mp4") ||
    normalized.endsWith(".webm") ||
    normalized.endsWith(".ogg") ||
    normalized.endsWith(".mov") ||
    normalized.endsWith(".m4v")
  ) {
    return "video";
  }

  return "image";
}

export function guessMimeTypeFromUrl(url: string, mediaType?: GalleryMediaType) {
  const normalized = url.split("?")[0]?.split("#")[0]?.toLowerCase() || "";

  if (normalized.endsWith(".mp4")) {
    return "video/mp4";
  }
  if (normalized.endsWith(".webm")) {
    return "video/webm";
  }
  if (normalized.endsWith(".ogg") || normalized.endsWith(".ogv")) {
    return "video/ogg";
  }
  if (normalized.endsWith(".mov")) {
    return "video/quicktime";
  }
  if (normalized.endsWith(".m4v")) {
    return "video/x-m4v";
  }
  if (normalized.endsWith(".png")) {
    return "image/png";
  }
  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }
  if (normalized.endsWith(".gif")) {
    return "image/gif";
  }
  if (normalized.endsWith(".svg")) {
    return "image/svg+xml";
  }
  if (normalized.endsWith(".avif")) {
    return "image/avif";
  }

  if (mediaType === "video") {
    return "video/mp4";
  }

  return "image/jpeg";
}

export function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
