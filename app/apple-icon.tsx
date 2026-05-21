import { readFile } from "node:fs/promises";
import { join } from "node:path";
import logoImage from "@/assets/logo.png";

export const size = {
  width: logoImage.width,
  height: logoImage.height,
};

export const contentType = "image/png";

export default async function AppleIcon() {
  const buffer = await readFile(join(process.cwd(), "assets", "logo.png"));

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
