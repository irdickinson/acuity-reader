import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import type { ExtractOptions, ReaderArticle } from "./types.js";
import { GUARDRAILS } from "./guardrails.js";
import { sanitizeDocument, clampString } from "./sanitize.js";

export function extractReadable(html: string, opts: ExtractOptions = {}): ReaderArticle {
  const minTextLength = opts.minTextLength ?? GUARDRAILS.minTextLength;

  // Input clamp
  const safeHtml = clampString(html ?? "", GUARDRAILS.maxHtmlChars);

  const { window } = parseHTML(safeHtml);
  const document = window.document;

  sanitizeDocument(document);

  const reader = new Readability(document, { charThreshold: minTextLength });
  const article = reader.parse();

  // Always return something
  if (!article) return fallbackFromDocument(document);

  const contentHtml = clampString(article.content || "", GUARDRAILS.maxOutputHtmlChars);

  return {
    title: (article.title?.trim() || "Untitled"),
    byline: article.byline?.trim() || undefined,
    excerpt: article.excerpt?.trim() || undefined,
    contentHtml,
    textContent: article.textContent || undefined,
    length: article.length,
    siteName: article.siteName || undefined,
    lang: article.lang || undefined,
  };
}

function fallbackFromDocument(document: Document): ReaderArticle {
  const title = document.querySelector("title")?.textContent?.trim() || "Untitled";
  const bodyText = document.body?.textContent?.trim() || "";
  const excerpt = bodyText.slice(0, 240);

  return {
    title,
    excerpt,
    contentHtml: `<pre>${escapeHtml(bodyText.slice(0, 5000))}</pre>`,
    textContent: bodyText,
    length: bodyText.length,
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