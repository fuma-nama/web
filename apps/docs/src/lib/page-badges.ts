import { getSource } from "./source";

export type BadgeType = "early-access" | "deprecated" | "preview";

// Create a map of page URLs to their badge values
export async function getPageBadges(
  version: "v7" | "v6" = "v7",
): Promise<Map<string, BadgeType>> {
  const source = await getSource(version === "v6" ? "v6" : "latest");
  const badges = new Map<string, BadgeType>();

  // Get all pages from the source
  const pages = source.getPages();

  for (const page of pages) {
    const badge = page.data.frontmatter.badge as BadgeType | undefined;
    if (badge) {
      badges.set(page.url, badge);
    }
  }

  return badges;
}
