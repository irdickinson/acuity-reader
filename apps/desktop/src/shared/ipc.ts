

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

  librarySave: "library:save",
  libraryList: "library:list",
  libraryGet: "library:get",
  libraryDelete: "library:delete",
} as const;

export type IpcChannels = typeof IPC[keyof typeof IPC];


export type SavedArticle = ReaderArticle & {
  id: string;
  url?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type SaveArticleInput = {
  url?: string;
  article: ReaderArticle;
};