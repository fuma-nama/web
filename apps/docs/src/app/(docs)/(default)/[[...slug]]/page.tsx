import { getPageImage, getSource } from "@/lib/source";
import { withDocsBasePath } from "@/lib/urls";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  CopyPromptButton,
  LLMCopyButton,
  ViewOptions,
} from "@/components/page-actions";
import { getPromptContent } from "@/lib/get-prompt-content";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  EditOnGitHub,
} from "@/components/layout/notebook/page";
import {
  TechArticleSchema,
  BreadcrumbSchema,
} from "@/components/structured-data";

interface PageParams {
  slug?: string[];
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const source = await getSource();
  const page = source.getPage(slug);
  if (!page) notFound();

  const { render } = await page.data.load();
  const { body, toc } = await render(
    getMDXComponents({
      a: createRelativeLink(source, page),
    }),
  );

  const aiPromptSlug = (page.data as { aiPrompt?: string }).aiPrompt;
  const promptContent = aiPromptSlug
    ? await getPromptContent(aiPromptSlug)
    : null;

  return (
    <>
      <TechArticleSchema page={page} />
      <BreadcrumbSchema page={page} />
      <DocsPage
        tableOfContent={{
          style: "normal",
        }}
        toc={toc}
        full={page.data.frontmatter.full}
      >
        <div className="flex flex-col md:flex-row items-start gap-4 pt-2 pb-1 md:justify-between">
          <DocsTitle>{page.data.title}</DocsTitle>
          <div className="flex flex-row gap-2 items-center">
            {promptContent && (
              <CopyPromptButton fullPrompt={promptContent.fullPrompt} />
            )}
            {!page.url.startsWith("/management-api/endpoints") && (
              <LLMCopyButton
                markdownUrl={`${withDocsBasePath(page.url)}.mdx`}
              />
            )}

            <ViewOptions
              markdownUrl={`${withDocsBasePath(page.url)}.mdx`}
              githubUrl={`https://github.com/prisma/docs/blob/main/apps/docs/content/docs/${page.path}`}
            />
          </div>
        </div>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>{body}</DocsBody>
        <div className="flex flex-row flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm">
          <EditOnGitHub
            href={`https://github.com/prisma/docs/edit/main/apps/docs/content/docs/${page.path}`}
          />
        </div>
      </DocsPage>
    </>
  );
}

export async function generateStaticParams() {
  const source = await getSource();
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const source = await getSource();
  const page = source.getPage(slug);
  if (!page) notFound();

  const frontmatter = page.data.frontmatter;
  const title = frontmatter.metaTitle ?? frontmatter.title;
  const description = frontmatter.metaDescription ?? frontmatter.description;

  return {
    title,
    description,
    alternates: {
      canonical: withDocsBasePath(page.url),
    },
    openGraph: {
      title,
      description,
      url: withDocsBasePath(page.url),
      images: withDocsBasePath(frontmatter.image ?? getPageImage(page).url),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
