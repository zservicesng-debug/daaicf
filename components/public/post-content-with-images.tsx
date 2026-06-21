"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export function PostContentWithImages({
  title,
  contentSegments,
  imageUrls,
}: {
  title: string;
  contentSegments: string[];
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
      <div className="prose-daaicf mt-8 max-w-none">
        {contentSegments.map((segment, index) => (
          <div key={`post-content-segment-${index + 1}`}>
            <div dangerouslySetInnerHTML={{ __html: segment }} />
            {imageUrls[index] ? (
              <button
                type="button"
                className="group my-8 block w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] text-left"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open ${title} photo ${index + 1} in full view`}
              >
                <Image
                  src={imageUrls[index]}
                  alt={`${title} photo ${index + 1}`}
                  width={1200}
                  height={900}
                  unoptimized
                  className="max-h-[640px] w-full object-cover transition duration-300 group-hover:scale-[1.01]"
                />
              </button>
            ) : null}
          </div>
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
