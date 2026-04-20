import type { MetadataRoute } from "next";
import { getBaseUrl, withDocsBasePath } from "@/lib/urls";
import { getSource } from "@/lib/source";

export const revalidate = 3600;

function getPriority(slugCount: number) {
  if (slugCount === 0) return 1.0;
  if (slugCount === 1) return 0.8;
  return 0.5;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const source = await getSource();
  const sourceV6 = await getSource("v6");
  const url = (path: string): string =>
    new URL(withDocsBasePath(path), baseUrl).toString();

  // v7 pages (default)
  const items = source.getPages().map((page) => {
    const lastModified = (page.data as { lastModified?: Date }).lastModified;

    return {
      url: url(page.url),
      lastModified: lastModified ? new Date(lastModified) : undefined,
      changeFrequency: "weekly",
      priority: getPriority(page.slugs.length),
    } as MetadataRoute.Sitemap[number];
  });

  // v6 pages
  const v6Items = sourceV6.getPages().map((page) => {
    const lastModified = (page.data as { lastModified?: Date }).lastModified;

    return {
      url: url(page.url),
      lastModified: lastModified ? new Date(lastModified) : undefined,
      changeFrequency: "weekly",
      priority: 0.4, // Lower priority than v7
    } as MetadataRoute.Sitemap[number];
  });

  return [
    ...items.filter((v) => v !== undefined),
    ...v6Items.filter((v) => v !== undefined),
  ];
}
