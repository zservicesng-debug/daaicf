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

const MAX_INLINE_POST_IMAGES = 3;

function getInlineImageCount(paragraphCount: number, availableImageCount: number) {
  const paragraphGapCount = Math.max(0, paragraphCount - 1);
  let desiredImageCount = 0;

  if (paragraphGapCount >= 6) {
    desiredImageCount = 3;
  } else if (paragraphGapCount >= 3) {
    desiredImageCount = 2;
  } else if (paragraphGapCount >= 1) {
    desiredImageCount = 1;
  }

  return Math.min(
    MAX_INLINE_POST_IMAGES,
    desiredImageCount,
    availableImageCount
  );
}

function getImageParagraphIndexes(paragraphCount: number, imageCount: number) {
  const paragraphGapCount = Math.max(0, paragraphCount - 1);

  if (imageCount === 1) {
    return [0];
  }

  if (imageCount === 2) {
    return [0, Math.floor(paragraphGapCount / 2)];
  }

  if (imageCount === 3) {
    return [0, Math.floor(paragraphGapCount / 2), paragraphGapCount - 1];
  }

  return [];
}

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
  const inlineImageCount = getInlineImageCount(
    paragraphEnds.length,
    availableImageUrls.length
  );
  const imageParagraphEnds = getImageParagraphIndexes(
    paragraphEnds.length,
    inlineImageCount
  ).map((paragraphIndex) => paragraphEnds[paragraphIndex]);
  const contentSegments: string[] = [];
  let segmentStart = 0;

  for (const paragraphEnd of imageParagraphEnds) {
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
