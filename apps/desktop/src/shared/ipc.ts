

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

export const IPC = {
  readerExtractFromHtml: "reader:extractFromHtml",
  readerExtractFromUrl: "reader:extractFromUrl",
} as const;

export type IpcChannels = typeof IPC[keyof typeof IPC];