const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const MAX_INLINE_POST_IMAGES = 1;

function getTopLevelParagraphEnds(html: string) {
  const ends: number[] = [];
  const openElements: string[] = [];
  const tagPattern = /<!--[\s\S]*?-->|<![^>]*>|<\/?([a-zA-Z][\w:-]*)\b[^>]*>/g;

  for (const match of html.matchAll(tagPattern)) {
    const tag = match[0];
    const name = match[1]?.toLowerCase();

    if (!name || tag.startsWith("<!")) {
      continue;
    }

    if (tag.startsWith("</")) {
      const matchingIndex = openElements.lastIndexOf(name);

      if (name === "p" && matchingIndex === 0) {
        ends.push((match.index ?? 0) + tag.length);
      }

      if (matchingIndex >= 0) {
        openElements.splice(matchingIndex);
      }

      continue;
    }

    if (!tag.endsWith("/>") && !VOID_ELEMENTS.has(name)) {
      openElements.push(name);
    }
  }

  return ends;
}

function isAlreadyInContent(content: string, imageUrl: string) {
  return (
    content.includes(imageUrl) ||
    content.includes(imageUrl.replaceAll("&", "&amp;"))
  );
}

export function distributePostGalleryImages(
  content: string,
  galleryImageUrls: string[]
) {
  const availableImageUrls = galleryImageUrls.filter(
    (imageUrl) => !isAlreadyInContent(content, imageUrl)
  );
  const paragraphEnds = getTopLevelParagraphEnds(content);
  const inlineImageCount = Math.min(
    MAX_INLINE_POST_IMAGES,
    availableImageUrls.length,
    Math.max(0, paragraphEnds.length - 1)
  );
  const contentSegments: string[] = [];
  let segmentStart = 0;

  for (const paragraphEnd of paragraphEnds.slice(0, inlineImageCount)) {
    contentSegments.push(content.slice(segmentStart, paragraphEnd));
    segmentStart = paragraphEnd;
  }

  contentSegments.push(content.slice(segmentStart));

  return {
    contentSegments,
    inlineImageUrls: availableImageUrls.slice(0, inlineImageCount),
    remainingImageUrls: availableImageUrls.slice(inlineImageCount),
  };
}
