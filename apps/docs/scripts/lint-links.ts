import {
  type FileObject,
  printErrors,
  scanURLs,
  validateFiles,
} from "next-validate-link";

import { register } from "node:module";
register("fumadocs-mdx/node/loader", import.meta.url);

const { getSource } = await import("@/lib/source");
const source = await getSource();
const sourceV6 = await getSource("v6");
const v7Pages = await Promise.all(
  source.getPages().map(async (page) => {
    return {
      value: { slug: page.slugs },
      hashes: await getHeadings(page),
    };
  }),
);
const v6Pages = await Promise.all(
  sourceV6.getPages().map(async (page) => {
    return {
      value: { slug: page.slugs },
      hashes: await getHeadings(page),
    };
  }),
);

console.log(`Found ${v7Pages.length} v7 files and ${v6Pages.length} v6 files`);

async function checkLinks() {
  const scanned = await scanURLs({
    preset: "next",
    populate: {
      "(docs)/(default)/[[...slug]]": v7Pages,
      "(docs)/v6/[[...slug]]": v6Pages,
    },
  });

  printErrors(
    await validateFiles(await getFiles(), {
      scanned,
      markdown: {
        components: {
          Card: { attributes: ["href"] },
          Cards: { attributes: ["href"] },
        },
      },
      checkRelativePaths: "as-url",
    }),
    true,
  );
}

async function getHeadings({
  data,
}: (typeof source)["$inferPage"] | (typeof sourceV6)["$inferPage"]): Promise<
  string[]
> {
  const { structuredData } = await data.load();
  return structuredData.headings.map((heading) => heading.id);
}

function getFiles() {
  console.log("Validating Files");
  const out: FileObject[] = [];

  for (const page of source.getPages()) {
    out.push({
      path: page.absolutePath ?? "",
      content: page.data.content,
      url: page.url,
      data: page.data,
    });
  }

  for (const page of sourceV6.getPages()) {
    out.push({
      path: page.absolutePath ?? "",
      content: page.data.content,
      url: page.url,
      data: page.data,
    });
  }

  return out;
}

void checkLinks();
