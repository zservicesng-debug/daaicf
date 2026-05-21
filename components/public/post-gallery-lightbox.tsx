"use client";

import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useMemo, useState } from "react";

export function PostGalleryLightbox({
  title,
  imageUrls,
}: {
  title: string;
  imageUrls: string[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const slides = useMemo(
    () =>
      imageUrls.map((imageUrl, index) => ({
        src: imageUrl,
        alt: `${title} photo ${index + 1}`,
      })),
    [imageUrls, title]
  );

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {imageUrls.map((imageUrl, index) => (
          <button
            key={`${title}-gallery-${index + 1}`}
            type="button"
            className="group overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] text-left"
            onClick={() => setActiveIndex(index)}
            aria-label={`Open ${title} photo ${index + 1} in full view`}
          >
            <div className="relative">
              <Image
                src={imageUrl}
                alt={`${title} photo ${index + 1}`}
                width={1200}
                height={900}
                unoptimized
                className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent px-4 py-3">
                <p className="text-sm font-medium text-white">
                  Photo {index + 1}
                </p>
                <p className="mt-1 text-xs text-white/72">
                  Click to view full size
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
        slides={slides}
      />
    </>
  );
}
