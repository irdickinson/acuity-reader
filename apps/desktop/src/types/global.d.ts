import type { ReaderArticle, SavedArticle, SaveArticleInput } from "./shared/ipc";

declare global {
  interface Window {
    acuity: {
      reader: {
        extractFromHtml(html: string): Promise<ReaderArticle>;
        extractFromUrl(url: string): Promise<ReaderArticle>;
      };
      library: {
        save(input: SaveArticleInput): Promise<SavedArticle>;
        list(): Promise<SavedArticle[]>;
        get(id: string): Promise<SavedArticle | null>;
        delete(id: string): Promise<{ ok: true }>;
      };
    };

    acuityDebug?: {
      onMessage(cb: (msg: string) => void): () => void;
    };
  }
}

export {};