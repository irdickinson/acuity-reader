export function sanitizeDocument(document: Document) {
  // Remove heavy/unsafe nodes
  document.querySelectorAll("script,noscript,iframe,style,link,meta").forEach(n => n.remove());

  // Strip inline event handlers and javascript: URLs
  const all = document.querySelectorAll("*");
  for (const el of all) {
    // remove on* handlers
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value?.toLowerCase() ?? "";

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