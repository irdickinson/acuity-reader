import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { extractReadable } from "../src/extractReadable.js";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: acuity-extract <path-to-html-file>");
  process.exit(1);
}

const abs = path.resolve(process.cwd(), inputPath);
const html = fs.readFileSync(abs, "utf8");

const article = extractReadable(html, { minTextLength: 200 });

console.log(JSON.stringify({
  title: article.title,
  byline: article.byline,
  excerpt: article.excerpt,
  length: article.length,
  lang: article.lang,
  siteName: article.siteName,

  // health / guardrail proof
  contentHtmlChars: article.contentHtml.length,
  textContentChars: article.textContent?.length ?? 0,
  usedFallback: article.contentHtml.startsWith("<pre>")
}, null, 2));