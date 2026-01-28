export function sanitizeDocument(document: Document) {
  document.querySelectorAll("script,noscript,iframe,style,link,meta").forEach(n => n.remove());

  const all = document.querySelectorAll("*");
  for (const el of all) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = (attr.value ?? "").toLowerCase();

      if (name.startsWith("on")) el.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    }
  }
}

export function clampString(s: string, maxChars: number) {
  return s.length > maxChars ? s.slice(0, maxChars) : s;
}