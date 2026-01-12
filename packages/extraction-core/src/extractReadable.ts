import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import type { ExtractOptions, ReaderArticle } from "./types.js";

export function extractReadable(html: string, opts: ExtractOptions = {}): ReaderArticle {
  const { minTextLength = 200 } = opts;

  const { window } = parseHTML(html);
  const document = window.document;

  // remove some obvious junk (chunk 2 will harden this)
  document.querySelectorAll("script,noscript,iframe,style").forEach((n) => n.remove());

  const reader = new Readability(document, { charThreshold: minTextLength });
  const article = reader.parse();

  if (!article) {
    const title = document.querySelector("title")?.textContent?.trim() || "Untitled";
    const bodyText = document.body?.textContent?.trim() || "";
    return {
      title,
      excerpt: bodyText.slice(0, 240),
      contentHtml: `<pre>${escapeHtml(bodyText.slice(0, 5000))}</pre>`,
      textContent: bodyText,
      length: bodyText.length,
    };
  }

  return {
    title: article.title?.trim() || "Untitled",
    byline: article.byline?.trim() || undefined,
    excerpt: article.excerpt?.trim() || undefined,
    contentHtml: article.content || "",
    textContent: article.textContent || undefined,
    length: article.length,
    siteName: article.siteName || undefined,
    lang: article.lang || undefined,
  };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}