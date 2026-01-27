import { contextBridge, ipcRenderer } from "electron";
import type { ReaderArticle, SavedArticle, SaveArticleInput } from "../src/shared/ipc";

contextBridge.exposeInMainWorld("acuity", {
  reader: {
    extractFromHtml: (html: string): Promise<ReaderArticle> =>
      ipcRenderer.invoke("reader:extractFromHtml", html),
    extractFromUrl: (url: string): Promise<ReaderArticle> =>
      ipcRenderer.invoke("reader:extractFromUrl", url),
  },
  library: {
    save: (input: SaveArticleInput): Promise<SavedArticle> =>
      ipcRenderer.invoke("library:save", input),
    list: (): Promise<SavedArticle[]> => ipcRenderer.invoke("library:list"),
    get: (id: string): Promise<SavedArticle | null> => ipcRenderer.invoke("library:get", id),
    delete: (id: string): Promise<{ ok: true }> => ipcRenderer.invoke("library:delete", id),
  },
});

// Optional: keep a tiny debug channel, but don't expose raw ipcRenderer.
contextBridge.exposeInMainWorld("acuityDebug", {
  onMessage: (cb: (msg: string) => void) => {
    const listener = (_event: unknown, msg: string) => cb(msg);
    ipcRenderer.on("main-process-message", listener);
    return () => ipcRenderer.off("main-process-message", listener);
  },
});

