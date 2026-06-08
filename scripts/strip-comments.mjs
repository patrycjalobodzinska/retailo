import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

// Pliki .ts/.tsx w src/ i sanity/, z wyjątkiem krytycznych.
const EXCLUDE = new Set([
  "src/app/layout.tsx", // krytyczne komentarze inline-skryptów (cookie/scroll)
]);

const files = execSync(
  `find src sanity -type f \\( -name '*.ts' -o -name '*.tsx' \\)`,
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean)
  .filter((f) => !EXCLUDE.has(f));

// Komentarze-dyrektywy do zachowania (funkcjonalne, nie opisowe).
const KEEP = /^\s*\/\/\/?\s*(eslint|@ts-|@jsx|prettier|biome|<reference|noinspection|webpackChunkName)/i;
const KEEP_INLINE = /(eslint-disable|@ts-|prettier-ignore)/;

function strip(src) {
  const lines = src.split("\n");
  const out = [];
  let inBlock = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (inBlock) {
      const close = line.indexOf("*/");
      if (close !== -1) {
        inBlock = false;
        // co zostaje po zamknięciu (z opcjonalnym "}" dla {/* */})
        const rest = line.slice(close + 2).replace(/^\s*\}/, "").trim();
        if (rest) out.push(line.slice(close + 2)); // realny kod po komentarzu
      }
      continue; // linia komentarza — pomiń
    }
    if (trimmed === "") {
      out.push(line);
      continue;
    }
    // pełnoliniowy // komentarz (zachowaj dyrektywy)
    if (trimmed.startsWith("//")) {
      if (KEEP.test(trimmed) || KEEP_INLINE.test(trimmed)) out.push(line);
      continue;
    }
    // linia będąca tylko komentarzem blokowym {/* */} lub /* */
    if (trimmed.startsWith("{/*") || trimmed.startsWith("/*")) {
      if (KEEP_INLINE.test(trimmed)) {
        out.push(line);
        continue;
      }
      const close = trimmed.indexOf("*/");
      if (close !== -1) {
        // zamyka się w tej samej linii — komentarz-only, pomiń całą linię
        continue;
      }
      inBlock = true;
      continue;
    }
    out.push(line);
  }
  // zwiń 3+ pustych linii do jednej pustej
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

let changed = 0;
for (const f of files) {
  const s = readFileSync(f, "utf8");
  const out = strip(s);
  if (out !== s) {
    writeFileSync(f, out);
    changed++;
  }
}
console.log(`Usunięto komentarze opisowe w ${changed} plikach (z ${files.length}).`);
