"use client";

import Image from "next/image";
import { Film, Images, Play } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { useState } from "react";
import { guessMimeTypeFromUrl } from "@/lib/utils";
import { type GalleryImage } from "@/types";

export function GalleryLightbox({
  items,
  category,
  year,
}: {
  items: GalleryImage[];
  category: string;
  year: number;
}) {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  const images = items.filter((item) => item.mediaType === "image");
  const videos = items.filter((item) => item.mediaType === "video");

  const slides = items.map((item) =>
    item.mediaType === "video"
      ? {
          type: "video" as const,
          width: 1280,
          height: 720,
          controls: true,
          playsInline: true,
          sources: [
            {
              src: item.imageUrl,
              type: guessMimeTypeFromUrl(item.imageUrl, "video"),
            },
          ],
        }
      : {
          src: item.imageUrl,
          alt: `${category} gallery image from ${year}`,
        }
  );

  function openItem(item: GalleryImage) {
    setActiveSlideIndex(items.findIndex((candidate) => candidate.id === item.id));
  }

  return (
    <>
      <div className="space-y-8">
        {videos.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-[var(--color-accent)]" />
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Videos</h3>
              <span className="text-sm muted-copy">({videos.length})</span>
            </div>
            <div data-reveal-group className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((item) => (
                <div key={item.id} data-reveal="zoom" className="space-y-2">
                  <button
                    type="button"
                    className="group relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] bg-black"
                    onClick={() => openItem(item)}
                    aria-label={`Play ${item.collectionTitle || category} gallery video from ${year}`}
                  >
                    <video
                      src={item.imageUrl}
                      className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.02]"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <span className="absolute inset-0 grid place-items-center bg-black/15">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-[var(--color-primary)] shadow-lg transition group-hover:scale-105">
                        <Play className="ml-1 h-6 w-6 fill-current" />
                      </span>
                    </span>
                  </button>
                  <p className="line-clamp-2 text-sm font-semibold text-[var(--color-text)]">
                    {item.collectionTitle || `${category} video`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {images.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Images className="h-5 w-5 text-[var(--color-primary)]" />
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Photos</h3>
              <span className="text-sm muted-copy">({images.length})</span>
            </div>
            <div data-reveal-group className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {images.map((item) => (
                <div key={item.id} data-reveal="zoom" className="space-y-2">
                  <button
                    type="button"
                    className="group relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-muted)]"
                    onClick={() => openItem(item)}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.collectionTitle || `${category} gallery image from ${year}`}
                      fill
                      unoptimized
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </button>
                  <p className="line-clamp-2 text-sm font-semibold text-[var(--color-text)]">
                    {item.collectionTitle || `${category} photo`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <Lightbox
        open={activeSlideIndex !== null}
        close={() => setActiveSlideIndex(null)}
        index={activeSlideIndex ?? 0}
        plugins={[Video]}
        slides={slides}
      />
    </>
  );
}
