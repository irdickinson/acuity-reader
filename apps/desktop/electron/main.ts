import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url"; // make sure both are present
import { JsonArticleStore } from "./library/jsonStore";
import type { SaveArticleInput } from "../src/shared/ipc";



const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let articleStore: JsonArticleStore | null = null;

// const IPC_CHANNELS = {
//   extractFromHtml: "reader:extractFromHtml",
//   extractFromUrl: "reader:extractFromUrl",
// } as const;


function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}



async function runExtractionSelfTest() {
  // Opt-in only. Normal dev should not run this.
  if (process.env.ACUITY_RUN_EXTRACTION_TEST !== "1") return;

  try {
    // Build path to the compiled extraction-core entry.
    // IMPORTANT: @vite-ignore prevents Vite from turning this into a data: URL.


    const repoRoot = path.resolve(process.env.APP_ROOT!, "../..");
    const entryAbs = path.join(repoRoot, "packages/extraction-core/dist/src/index.js");

    if (!existsSync(entryAbs)) {
      throw new Error(
        `[ExtractionSelfTest] Missing build output:\n${entryAbs}\n` +
        `Run: pnpm --filter @acuity/extraction-core build`
      );
    }

    const mod = await import(/* @vite-ignore */ pathToFileURL(entryAbs).href);
    const extractReadable = mod.extractReadable as (html: string, opts?: any) => any;

    const fixtureAbs = path.join(repoRoot, "packages/extraction-core/test-pages/sample-ugly.html");

    const html = readFileSync(fixtureAbs, "utf8");

    const article = extractReadable(html, { minTextLength: 200 });

    console.log("[Acuity][ExtractionSelfTest] OK", {
      title: article.title,
      lang: article.lang,
      length: article.length,
      excerpt: article.excerpt?.slice(0, 120),
      contentHtmlChars: article.contentHtml?.length ?? 0,
      usedFallback: typeof article.contentHtml === "string" && article.contentHtml.startsWith("<pre>")
    });
  } catch (err) {
    console.error("[Acuity][ExtractionSelfTest] FAILED", err);
    console.error(
      "[Acuity][ExtractionSelfTest] Tip: run `pnpm --filter @acuity/extraction-core build` and try again."
    );
  }
}


async function fetchHtml(url: string): Promise<string> {
  // Basic validation
  const u = new URL(url);
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http/https URLs are allowed.");
  }

  const res = await fetch(u.href, {
    redirect: "follow",
    headers: {
      // Some sites serve different HTML without a UA
      "User-Agent": "AcuityReader/0.0 (Electron)",
      "Accept": "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/html") && !ct.includes("application/xhtml+xml")) {
    // still allow, but warn by failing fast for now
    throw new Error(`Unexpected content-type: ${ct}`);
  }

  return await res.text();
}


// function registerReaderIpc() {
//   console.log("[Acuity][IPC] Registering handlers...");

//   ipcMain.handle(IPC_CHANNELS.extractFromHtml, async (_event, html: string) => {

//     return {
//       title: "IPC OK",
//       excerpt: html.slice(0, 60),
//       contentHtml: `<p>IPC OK</p><pre>${escapeHtml(html.slice(0, 200))}</pre>`,
//     };
//   });

//   console.log("[Acuity][IPC] Handler ready:", IPC_CHANNELS.extractFromHtml);
// }

// function escapeHtml(s: string): string {
//   return s
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#039;");
// }

function registerReaderIpc() {
  async function loadExtractor() {
    const repoRoot = path.resolve(process.env.APP_ROOT!, "../..");
    const entryAbs = path.join(repoRoot, "packages/extraction-core/dist/src/index.js");

    const mod = await import(/* @vite-ignore */ pathToFileURL(entryAbs).href);
    const extractReadable = mod.extractReadable as (h: string, opts?: any) => any;

    if (!extractReadable) {
      throw new Error("extractReadable export not found in extraction-core.");
    }

    return extractReadable;
  }

  function shapeArticle(article: any) {
    return {
      title: article.title,
      byline: article.byline,
      excerpt: article.excerpt,
      contentHtml: article.contentHtml,
      textContent: article.textContent,
      length: article.length,
      siteName: article.siteName,
      lang: article.lang,
    };
  }

  ipcMain.handle("reader:extractFromHtml", async (_event, html: string) => {
    const extractReadable = await loadExtractor();
    const article = extractReadable(html, { minTextLength: 200 });
    return shapeArticle(article);
  });

  ipcMain.handle("reader:extractFromUrl", async (_event, url: string) => {
    const html = await fetchHtml(url);
    const extractReadable = await loadExtractor();
    const article = extractReadable(html, { minTextLength: 200 });
    return shapeArticle(article);
  });
}


function registerLibraryIpc() {
  if (!articleStore) throw new Error("articleStore not initialized");

  ipcMain.handle("library:save", async (_event, input: SaveArticleInput) => {
    return await articleStore!.save(input);
  });

  ipcMain.handle("library:list", async () => {
    return await articleStore!.list();
  });

  ipcMain.handle("library:get", async (_event, id: string) => {
    return await articleStore!.get(id);
  });

  ipcMain.handle("library:delete", async (_event, id: string) => {
    await articleStore!.delete(id);
    return { ok: true as const };
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})


app.whenReady().then(async () => {
  registerReaderIpc();
  try { await runExtractionSelfTest(); } catch {}
  articleStore = new JsonArticleStore(app.getPath("userData"));
  registerLibraryIpc();
  createWindow();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

