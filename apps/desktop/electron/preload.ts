import { contextBridge, ipcRenderer } from "electron";
import type { ReaderArticle } from "../src/shared/ipc";

contextBridge.exposeInMainWorld("acuity", {
  reader: {
    extractFromHtml: (html: string): Promise<ReaderArticle> =>
      ipcRenderer.invoke("reader:extractFromHtml", html),
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