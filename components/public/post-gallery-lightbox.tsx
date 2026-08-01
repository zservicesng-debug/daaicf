"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { useMemo, useState } from "react";
import { guessMimeTypeFromUrl } from "@/lib/utils";
import { type GalleryMediaType } from "@/types";

export type PostGalleryMedia = {
  id: string;
  url: string;
  type: GalleryMediaType;
  title?: string;
};

export function PostGalleryLightbox({
  title,
  media,
}: {
  title: string;
  media: PostGalleryMedia[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const slides = useMemo(
    () =>
      media.map((item, index) =>
        item.type === "video"
          ? {
              type: "video" as const,
              width: 1280,
              height: 720,
              controls: true,
              playsInline: true,
              sources: [
                {
                  src: item.url,
                  type: guessMimeTypeFromUrl(item.url, "video"),
                },
              ],
            }
          : {
              src: item.url,
              alt: item.title || `${title} photo ${index + 1}`,
            }
      ),
    [media, title]
  );

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="group overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] text-left"
            onClick={() => setActiveIndex(index)}
            aria-label={`Open ${item.title || title} ${item.type} ${index + 1} in full view`}
          >
            <div className="relative">
              {item.type === "video" ? (
                <>
                  <video
                    src={item.url}
                    className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/10">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[var(--color-primary)] shadow-lg">
                      <Play className="ml-1 h-5 w-5 fill-current" />
                    </span>
                  </span>
                </>
              ) : (
                <Image
                  src={item.url}
                  alt={item.title || `${title} photo ${index + 1}`}
                  width={1200}
                  height={900}
                  unoptimized
                  className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent px-4 py-3">
                <p className="text-sm font-medium text-white">
                  {item.type === "video" ? "Video" : "Photo"} {index + 1}
                </p>
                <p className="mt-1 text-xs text-white/72">
                  {item.title || "Click to view full size"}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        open={activeIndex !== null}
        close={() => setActiveIndex(null)}
        index={activeIndex ?? 0}
        plugins={[Video]}
        slides={slides}
      />
    </>
  );
}
