import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import path from "node:path";
import type { ArticleStore, SaveArticleInput, SavedArticle } from "./store";

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  // Simple, good enough for local. Later SQLite will handle IDs too.
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


function normalizeUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);

    // Normalize: lowercase host, remove hash, remove common tracking params
    u.host = u.host.toLowerCase();
    u.hash = "";

    const drop = new Set([
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "gclid", "fbclid",
    ]);

    for (const key of Array.from(u.searchParams.keys())) {
      if (drop.has(key)) u.searchParams.delete(key);
    }

    // Remove trailing slash for consistency (except root)
    let s = u.toString();
    if (s.endsWith("/") && u.pathname !== "/") s = s.slice(0, -1);

    return s;
  } catch {
    return url.trim() ? url.trim() : null;
  }
}


export class JsonArticleStore implements ArticleStore {
  private filePath: string;

  constructor(userDataDir: string) {
    const dir = path.join(userDataDir, "library");
    mkdirSync(dir, { recursive: true });
    this.filePath = path.join(dir, "articles.json");
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, JSON.stringify({ articles: [] }, null, 2), "utf8");
    }
  }

  async save(input: SaveArticleInput): Promise<SavedArticle> {
    const db = this.readDb();
    const now = nowIso();

    const urlKey = normalizeUrl(input.url);

    // If there's a URL, try update-in-place
    if (urlKey) {
      const existing = db.articles.find(a => normalizeUrl(a.url) === urlKey);
      if (existing) {
        existing.url = input.url ?? existing.url;
        existing.title = input.article.title;
        existing.byline = input.article.byline;
        existing.excerpt = input.article.excerpt;
        existing.contentHtml = input.article.contentHtml;
        existing.textContent = input.article.textContent;
        existing.length = input.article.length;
        existing.siteName = input.article.siteName;
        existing.lang = input.article.lang;
        existing.updatedAt = now;

        // Move to top (most recent)
        db.articles = [existing, ...db.articles.filter(a => a.id !== existing.id)];

        this.writeDb(db);
        return existing;
      }
    }

    // Otherwise create new
    const createdAt = now;
    const article: SavedArticle = {
      id: makeId(),
      url: input.url,
      createdAt,
      updatedAt: createdAt,
      ...input.article,
    };

    db.articles.unshift(article);
    this.writeDb(db);
    return article;
  }

  async list(): Promise<SavedArticle[]> {
    return this.readDb().articles;
  }

  async get(id: string): Promise<SavedArticle | null> {
    const db = this.readDb();
    return db.articles.find(a => a.id === id) ?? null;
  }

  async delete(id: string): Promise<void> {
    const db = this.readDb();
    const next = db.articles.filter(a => a.id !== id);
    db.articles = next;
    this.writeDb(db);
  }

  // didn't implement tiny migration
  private readDb(): { articles: SavedArticle[] } {
    try {
      const raw = readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as { articles?: SavedArticle[] };
      return { articles: Array.isArray(parsed.articles) ? parsed.articles : [] };
    } catch {
      return { articles: [] };
    }
  }

  private writeDb(db: { articles: SavedArticle[] }) {
    // atomic-ish write: write temp then rename
    const tmp = `${this.filePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
    renameSync(tmp, this.filePath);
  }
}