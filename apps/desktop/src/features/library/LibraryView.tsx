import { useEffect, useMemo, useState } from "react";
import type { SavedArticle } from "../../shared/ipc";

export function LibraryView({
  onOpen,
  onClose,
}: {
  onOpen: (article: SavedArticle) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<SavedArticle[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.acuity.library.list().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(a =>
      (a.title ?? "").toLowerCase().includes(q) ||
      (a.excerpt ?? "").toLowerCase().includes(q) ||
      (a.url ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  async function onDelete(id: string) {
    await window.acuity.library.delete(id);
    setItems(prev => prev.filter(x => x.id !== id));
  }

  return (
    <div style={{ padding: 16, display: "grid", gap: 12, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h2 style={{ margin: 0 }}>Library</h2>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>

      <input
        placeholder="Search saved articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, width: "100%" }}
      />

      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map((a) => (
          <div
            key={a.id}
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 10,
              padding: 10,
              display: "grid",
              gap: 6,
            }}
          >
            <div style={{ fontWeight: 700 }}>{a.title}</div>
            {a.url && <div style={{ opacity: 0.7, fontSize: 12 }}>{a.url}</div>}
            {a.excerpt && <div style={{ opacity: 0.85 }}>{a.excerpt}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onOpen(a)}>Open</button>
              <button onClick={() => onDelete(a.id)}>Delete</button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ opacity: 0.7 }}>No saved articles.</div>
        )}
      </div>
    </div>
  );
}