import { redirect } from "next/navigation";

export default async function LegacyGalleryCollectionPage(
  props: PageProps<"/admin/gallery/[id]">
) {
  await props.params;
  redirect("/admin/gallery");
}
