import { readFileSync, writeFileSync } from "node:fs";
import { makeReplacer, fixString } from "./polish-map.mjs";

const plReplace = makeReplacer(); // pełny słownik diakrytyki
const replacePL = (s) => fixString(plReplace(s)); // diakrytyka + pauzy + 15->10
const replaceEN = (s) => fixString(s); // tylko pauzy + 15->10

// Przetwarza TYLKO wartości stringów; klucze (np. "rozwiazanie") zostają.
function walk(node, fix) {
  if (typeof node === "string") return fix(node);
  if (Array.isArray(node)) return node.map((v) => walk(v, fix));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = walk(v, fix);
    return out;
  }
  return node;
}

for (const [file, fix] of [
  ["messages/pl.json", replacePL],
  ["messages/en.json", replaceEN],
]) {
  const obj = JSON.parse(readFileSync(file, "utf8"));
  const out = walk(obj, fix);
  writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  console.log("✓ " + file);
}
console.log("Done.");
