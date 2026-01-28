import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { GUARDRAILS } from "./guardrails";
import { clampString, sanitizeDocument } from "./sanitize";
import type { ExtractOptions, ReaderArticle } from "./types";

export function extractReadable(html: string, opts: ExtractOptions = {}): ReaderArticle {
  const minTextLength = opts.minTextLength ?? GUARDRAILS.minTextLength;

  const safeHtml = clampString(html ?? "", GUARDRAILS.maxHtmlChars);

  const { window } = parseHTML(safeHtml);
  const document = window.document;

  sanitizeDocument(document);

  const reader = new Readability(document, { charThreshold: minTextLength });
  const article = reader.parse();

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
  return {
    title,
    excerpt: bodyText.slice(0, 240),
    contentHtml: `<pre>${escapeHtml(bodyText.slice(0, 5000))}</pre>`,
    textContent: bodyText,
    length: bodyText.length,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}