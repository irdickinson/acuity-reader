import { app, BrowserWindow } from "electron";
import path from "node:path";
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url"; // make sure both are present

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
  try { await runExtractionSelfTest(); } catch {}
  createWindow();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

