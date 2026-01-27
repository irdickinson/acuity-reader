import { useEffect, useMemo, useState } from "react";
import type { ReaderArticle } from "../../shared/ipc";
import { ReaderToolbar } from "./ReaderToolbar";
import {
  DEFAULT_READER_SETTINGS,
  loadReaderSettings,
  saveReaderSettings,
  type ReaderSettings,
} from "./readerSettings";
import { LibraryView } from "../library/LibraryView";
import type { SavedArticle } from "../../shared/ipc";

// const DEFAULT_HTML = `<!doctype html>
// <html>
// <head><title>Sample</title></head>
// <body>
//   <h1>Acuity Reader</h1>
//   <p>Paste HTML here to test extraction without network.</p>
// </body>
// </html>`;

export function ReaderView() {
  const [mode, setMode] = useState<"html" | "url">("url");
  const [html, setHtml] = useState<string>("");
  const [url, setUrl] = useState<string>("https://en.wikipedia.org/wiki/Noun");
  const [status, setStatus] = useState<string>("Idle");
  const [article, setArticle] = useState<ReaderArticle | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const [settings, setSettings] = useState<ReaderSettings>(() => {
    // localStorage is available in renderer
    try { return loadReaderSettings(); } catch { return DEFAULT_READER_SETTINGS; }
  });

  useEffect(() => {
    saveReaderSettings(settings);
  }, [settings]);

  const canExtract = useMemo(() => {
    return mode === "html" ? html.trim().length > 0 : url.trim().length > 0;
  }, [mode, html, url]);

  async function onExtract() {
    setStatus("Extracting...");
    setArticle(null);

    try {
      const result =
        mode === "html"
          ? await window.acuity.reader.extractFromHtml(html)
          : await window.acuity.reader.extractFromUrl(url);

      setArticle(result);
      setStatus("OK");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(`ERROR: ${msg}`);
    }
  }

  const isDark = settings.theme === "dark";

  if (showLibrary) {
    return (
      <LibraryView
        onClose={() => setShowLibrary(false)}
        onOpen={(saved: SavedArticle) => {
          setShowLibrary(false);
          setArticle(saved);
        }}
      />
    );
  }

  if (article) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: isDark ? "#0b0d10" : "#f6f7f9",
          color: isDark ? "#e8eaf0" : "#111318",
        }}
      >
      <ReaderToolbar
        settings={settings}
        setSettings={setSettings}
        onBackToInput={() => setArticle(null)}
        onSave={async () => {
          const saved = await window.acuity.library.save({ url: mode === "url" ? url : undefined, article });
          // optional: show a tiny status
          console.log("Saved:", saved.id);
        }}
      />

        <div style={{ display: "flex", justifyContent: "center", padding: "24px 12px" }}>
          <article
            style={{
              width: "100%",
              maxWidth: settings.maxWidth,
              background: isDark ? "#0f1115" : "#ffffff",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.10)",
              borderRadius: 12,
              padding: "22px 20px",
              boxShadow: isDark ? "none" : "0 8px 24px rgba(0,0,0,0.06)",
              fontSize: settings.fontSize,
              lineHeight: settings.lineHeight,
            }}
          >
            <h1 style={{ marginTop: 0, lineHeight: 1.15 }}>{article.title}</h1>
            {article.byline && <div style={{ opacity: 0.75, marginBottom: 10 }}>{article.byline}</div>}
            {article.excerpt && <p style={{ opacity: 0.85 }}>{article.excerpt}</p>}

            <hr style={{ opacity: 0.2 }} />

            <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
          </article>
        </div>
      </div>
    );
  }







  // Input mode (existing UI; keep it simple)
  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Acuity Reader</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label>
          <input
            type="radio"
            checked={mode === "url"}
            onChange={() => setMode("url")}
          />{" "}
          URL
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "html"}
            onChange={() => setMode("html")}
          />{" "}
          HTML
        </label>
      </div>

      {mode === "url" ? (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%", padding: 8 }}
          placeholder="https://example.com/article"
        />
      ) : (
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          style={{ width: "100%", height: 180, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          placeholder="Paste HTML here"
        />
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={onExtract} disabled={!canExtract}>
          Extract
        </button>
        <button onClick={() => setShowLibrary(true)}>Library</button>
        <span><b>Status:</b> {status}</span>
      </div>
    </div>
  );
}