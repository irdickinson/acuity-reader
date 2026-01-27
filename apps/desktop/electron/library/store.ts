import type { ReaderArticle } from "../../src/shared/ipc";

export type SavedArticle = ReaderArticle & {
  id: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
};

export type SaveArticleInput = {
  url?: string;
  article: ReaderArticle;
};

export interface ArticleStore {
  save(input: SaveArticleInput): Promise<SavedArticle>;
  list(): Promise<SavedArticle[]>;
  get(id: string): Promise<SavedArticle | null>;
  delete(id: string): Promise<void>;
}