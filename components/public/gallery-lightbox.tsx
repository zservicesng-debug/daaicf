"use client";

import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn, categoryTone, guessMimeTypeFromUrl } from "@/lib/utils";
import { type GalleryCollection } from "@/types";

export function GalleryLightbox({ collections }: { collections: GalleryCollection[] }) {
  const [activeCollectionIndex, setActiveCollectionIndex] = useState<number | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const activeCollection =
    activeCollectionIndex === null ? null : collections[activeCollectionIndex] || null;

  const slides = useMemo(() => {
    if (!activeCollection) {
      return [];
    }

    return activeCollection.items.map((item) =>
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
            alt: `${activeCollection.title} (${item.year})`,
          }
    );
  }, [activeCollection]);

  return (
    <>
      <div data-reveal-group className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection, collectionIndex) => {
          const cover = collection.items[0];

          return (
            <button
              key={collection.id}
              type="button"
              data-reveal="zoom"
              className="group relative block overflow-hidden rounded-[var(--radius-card)] text-left"
              onClick={() => {
                setActiveCollectionIndex(collectionIndex);
                setActiveSlideIndex(0);
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-muted)]">
                {cover.mediaType === "video" ? (
                  <video
                    src={cover.imageUrl}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={cover.imageUrl}
                    alt={collection.title}
                    fill
                    unoptimized
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/55 via-black/15 to-transparent p-4">
                  <Badge
                    className={cn(
                      "border border-white/10 bg-black/35 backdrop-blur-sm",
                      categoryTone(collection.album)
                    )}
                  >
                    {collection.album}
                  </Badge>
                  <div className="max-w-[72%] text-right">
                    <p className="text-sm font-medium text-white/95">
                      {collection.title}
                    </p>
                    <p className="mt-1 text-xs text-white/72">
                      {collection.items.length} media item
                      {collection.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Lightbox
        open={activeCollectionIndex !== null}
        close={() => {
          setActiveCollectionIndex(null);
          setActiveSlideIndex(0);
        }}
        index={activeSlideIndex}
        plugins={[Video]}
        slides={slides}
      />
    </>
  );
}
