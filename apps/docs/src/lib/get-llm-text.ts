import type { DocsPage, DocsPageV6 } from "@/lib/source";
import { withDocsBasePath } from "@/lib/urls";

export async function getLLMText(page: DocsPage | DocsPageV6) {
  const processed = await page.data.content;

  return `# ${page.data.title} (${withDocsBasePath(page.url)})

${processed}`;
}
