import { generateRSS } from "@prisma-docs/ui/lib/rss";
import { getBaseUrl, withDocsBasePath } from "./urls";
import { getSource } from "./source";

export async function getRSS() {
  const source = await getSource();
  const sourceV6 = await getSource("v6");
  const baseUrl = getBaseUrl();
  // Combine v7 and v6 pages
  const allPages = [...source.getPages(), ...sourceV6.getPages()];

  return generateRSS(
    {
      title: "Prisma Documentation",
      baseUrl: baseUrl,
      description: "Latest updates to Prisma documentation",
      copyright: `All rights reserved ${new Date().getFullYear()}, Prisma Data, Inc.`,
      author: {
        name: "Prisma Data, Inc.",
      },
    },
    allPages.map((page: any) => ({
      id: `${withDocsBasePath(page.url)}`,
      url: `${withDocsBasePath(page.url)}`,
      title: page.data.title,
      description: page.data.description,
      date: page.data.lastModified
        ? new Date(page.data.lastModified)
        : new Date(),
    })),
  );
}
