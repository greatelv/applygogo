import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

export async function markdownToHtml(markdown: string): Promise<string> {
  // Pre-process to handle bold with punctuation for Korean/CJK
  // Specifically: **[text][punctuation]**[letter] which CommonMark fails to parse as bold
  // We insert a zero-width space (\u200B) before the closing ** to allow correct parsing by remark
  const preProcessed = markdown.replace(
    /\*\*([^*]+?)\*\*([가-힣\w])/g,
    "**$1\u200B**$2",
  );

  // Prefix images with /en for basePath
  const withPrefix = preProcessed.replace(
    /!\[(.*?)\]\(\/(.*?)\)/g,
    "![$1](/en/$2)",
  );

  const result = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(withPrefix);

  return result.toString();
}
