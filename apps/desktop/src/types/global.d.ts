import type { ReaderArticle } from "../shared/ipc";

declare global {
  interface Window {
    acuity: {
      reader: {
        extractFromHtml(html: string): Promise<ReaderArticle>;
        extractFromUrl(url: string): Promise<ReaderArticle>;
      };
    };
    acuityDebug?: {
      onMessage(cb: (msg: string) => void): () => void;
    };
  }
}

export {};