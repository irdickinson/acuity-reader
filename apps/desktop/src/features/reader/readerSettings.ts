export type ReaderTheme = "light" | "dark";

export type ReaderSettings = {
  fontSize: number;     // px
  lineHeight: number;   // unitless multiplier
  maxWidth: number;     // px
  theme: ReaderTheme;
};

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.6,
  maxWidth: 760,
  theme: "light",
};

const STORAGE_KEY = "acuity.reader.settings.v1";

export function loadReaderSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_READER_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;

    return {
      fontSize: clampNum(parsed.fontSize ?? DEFAULT_READER_SETTINGS.fontSize, 14, 28),
      lineHeight: clampNum(parsed.lineHeight ?? DEFAULT_READER_SETTINGS.lineHeight, 1.2, 2.2),
      maxWidth: clampNum(parsed.maxWidth ?? DEFAULT_READER_SETTINGS.maxWidth, 520, 980),
      theme: parsed.theme === "dark" ? "dark" : "light",
    };
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

export function saveReaderSettings(s: ReaderSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function clampNum(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}