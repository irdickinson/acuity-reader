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

    const createdAt = nowIso();
    const article: SavedArticle = {
      id: makeId(),
      url: input.url,
      createdAt,
      updatedAt: createdAt,
      ...input.article,
    };

    // newest first
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