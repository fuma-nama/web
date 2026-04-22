import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { openapiPlugin } from "fumadocs-openapi/server";
import { localMd, type MDXProcessorOptions } from "@fumadocs/local-md";
import { pageSchema } from "fumadocs-core/source/schema";
import z from "zod";
import remarkDirective from "remark-directive";
import {
  remarkDirectiveAdmonition,
  remarkImage,
  remarkMdxFiles,
} from "fumadocs-core/mdx-plugins";
import { dynamicLoader } from "fumadocs-core/source/dynamic";
import remarkConsoleUtm from "@/lib/remark-console-utm";

const mdxOptions: MDXProcessorOptions = {
  remarkPlugins: [
    remarkDirective,
    [remarkImage, { useImport: false }],
    [
      remarkDirectiveAdmonition,
      {
        types: {
          note: "info",
          tip: "info",
          info: "info",
          warn: "warning",
          warning: "warning",
          danger: "error",
          success: "success",
          ppg: "ppg",
          error: "error",
        },
      },
    ],
    remarkMdxFiles,
    remarkConsoleUtm,
  ],
  remarkCodeTabOptions: {
    parseMdx: true,
  },
  remarkNpmOptions: {
    persist: {
      id: "package-manager",
    },
  },
};

const docs = localMd({
  dir: "content/docs",
  frontmatterSchema: pageSchema.extend({
    image: z.string().optional(),
    badge: z.enum(["early-access", "deprecated", "preview"]).optional(),
    url: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    aiPrompt: z.string().optional(),
  }),
  mdxOptions,
});

// v6 docs collection
const docsV6 = localMd({
  dir: "content/docs.v6",
  frontmatterSchema: pageSchema.extend({
    image: z.string().optional(),
    badge: z.enum(["early-access", "deprecated", "preview"]).optional(),
    url: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    aiPrompt: z.string().optional(),
  }),
  mdxOptions,
});

if (process.env.NODE_ENV === "development") {
  void docs.devServer();
  void docsV6.devServer();
}

// See https://fumadocs.dev/docs/headless/source-api for more info
const source = dynamicLoader(docs.dynamicSource(), {
  baseUrl: "/",
  plugins: [lucideIconsPlugin(), openapiPlugin()],
});

// v6 source - URLs with /v6/ prefix
const sourceV6 = dynamicLoader(docsV6.dynamicSource(), {
  baseUrl: "/v6",
  plugins: [lucideIconsPlugin()],
});

export async function getSource(
  version: "v6" | "latest" = "latest",
): ReturnType<(typeof source)["get"]> {
  return version === "latest"
    ? source.get()
    : (sourceV6.get() as ReturnType<(typeof source)["get"]>);
}

export function getPageImage(
  page: (typeof source)["$inferPage"] | (typeof sourceV6)["$inferPage"],
) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `/og/${segments.join("/")}`,
  };
}

export async function getLLMText(
  page: (typeof source)["$inferPage"] | (typeof sourceV6)["$inferPage"],
) {
  return `# ${page.data.title}

${page.data.content}`;
}

export type DocsPage = (typeof source)["$inferPage"];
export type DocsPageV6 = (typeof sourceV6)["$inferPage"];
