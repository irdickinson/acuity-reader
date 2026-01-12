export type ReaderArticle = {
  title: string;
  byline?: string;
  excerpt?: string;
  contentHtml: string;
  textContent?: string;
  length?: number;
  siteName?: string;
  lang?: string;
};

export type ExtractOptions = {
  url?: string;         // optional, used for relative links context if you add it later
  minTextLength?: number;
};