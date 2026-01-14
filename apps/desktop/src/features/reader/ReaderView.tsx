import { useMemo, useState } from "react";
import type { ReaderArticle } from "../../shared/ipc";

const DEFAULT_HTML = `<!doctype html>
<html>
<head><title>Sample</title></head>
<body>
  <h1>Acuity Reader</h1>
  <p>Paste HTML here to test extraction without network.</p>
</body>
</html>`;

export function ReaderView() {
  const [mode, setMode] = useState<"html" | "url">("html");
  const [html, setHtml] = useState<string>(DEFAULT_HTML);
  const [url, setUrl] = useState<string>("https://en.wikipedia.org/wiki/Noun");
  const [status, setStatus] = useState<string>("Idle");
  const [article, setArticle] = useState<ReaderArticle | null>(null);

  const canExtract = useMemo(() => {
    return mode === "html" ? html.trim().length > 0 : url.trim().length > 0;
  }, [mode, html, url]);

  async function onExtract() {
    setStatus("Extracting...");
    setArticle(null);

    try {
      if (mode === "html") {
        const result = await window.acuity.reader.extractFromHtml(html);
        setArticle(result);
      } else {
        // URL mode comes in chunk 5.4 (new IPC method)
        const result = await window.acuity.reader.extractFromUrl(url);
        setArticle(result);
      }
      setStatus("OK");
    } catch (e: any) {
      setStatus(`ERROR: ${e?.message ?? String(e)}`);
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Acuity Reader</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label>
          <input
            type="radio"
            checked={mode === "html"}
            onChange={() => setMode("html")}
          />{" "}
          HTML
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "url"}
            onChange={() => setMode("url")}
          />{" "}
          URL
        </label>
      </div>

      {mode === "html" ? (
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          style={{ width: "100%", height: 180, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        />
      ) : (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%", padding: 8 }}
          placeholder="https://example.com/article"
        />
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={onExtract} disabled={!canExtract}>
          Extract
        </button>
        <span><b>Status:</b> {status}</span>
      </div>

      {article && (
        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{article.title}</div>
            {article.excerpt && <div style={{ opacity: 0.8 }}>{article.excerpt}</div>}
          </div>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: 8,
              padding: 12,
              maxHeight: 420,
              overflow: "auto",
              background: "white",
            }}
            // This is why we built sanitization guardrails.
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />
        </div>
      )}
    </div>
  );
}