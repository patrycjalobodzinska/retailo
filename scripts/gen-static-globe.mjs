// Generuje statyczny glob (SVG paths) z public/countries.geojson przez
// projekcję ortograficzną wyśrodkowaną jak desktopowy MapLibre (center [14,30]).
// Wynik (ścieżki lądów + podświetlonych krajów) zapisujemy do
// src/lib/staticGlobeData.ts, żeby na mobile rysować glob bez WebGL i bez
// pobierania 488 KB geojsona w runtime.
//
// Uruchom: node scripts/gen-static-globe.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { geoOrthographic, geoPath } from "d3-geo";

const SELECTED = ["PL", "DE", "FR", "ES", "IT", "GB", "CZ", "SK", "AT", "RO", "SE", "NL"];
// Natural Earth ustawia ISO_A2 = "-99" dla części krajów — łapiemy po nazwie.
const NAME_TO_ISO = { France: "FR", Norway: "NO", Kosovo: "XK" };

const geo = JSON.parse(readFileSync("public/countries.geojson", "utf8"));

const SIZE = 300;
const PAD = 6;
// rotate = [-lng, -lat, roll]. NIŻSZA szerokość centralna (24) „obraca" glob
// do przodu — Europa wędruje wyżej, a górna czapa (Arktyka nad Europą) jest
// mniejsza. To daje efekt „widać mniej górnej części". Roll 0 = bez przechyłu.
const projection = geoOrthographic()
  .rotate([-14, -12, 0])
  .fitExtent(
    [
      [PAD, PAD],
      [SIZE - PAD, SIZE - PAD],
    ],
    { type: "Sphere" },
  );
const path = geoPath(projection);

// Zaokrąglamy do liczb całkowitych — przy SIZE 300 to wystarczająca precyzja
// dla małego globu na mobile, a mocno tnie rozmiar embedowanych ścieżek.
const round = (d) => d.replace(/-?\d+\.\d+/g, (m) => String(Math.round(+m)));

const isSelected = (p) =>
  SELECTED.includes(p.ISO_A2) ||
  (NAME_TO_ISO[p.ADMIN] && SELECTED.includes(NAME_TO_ISO[p.ADMIN]));

let land = "";
let highlight = "";
for (const f of geo.features) {
  const d = path(f);
  if (!d) continue; // klipnięte (tylna półkula) — pomijamy
  land += d;
  if (isSelected(f.properties)) highlight += d;
}

const [cx, cy] = projection.translate();
const r = projection.scale();

const out = `// AUTOGENEROWANE przez scripts/gen-static-globe.mjs — nie edytuj ręcznie.
// Statyczny glob (ortograficzny, wyśrodkowany na Europie) do wariantu mobile.
export const STATIC_GLOBE = {
  size: ${SIZE},
  cx: ${cx.toFixed(1)},
  cy: ${cy.toFixed(1)},
  r: ${r.toFixed(1)},
  land: ${JSON.stringify(round(land))},
  highlight: ${JSON.stringify(round(highlight))},
} as const;
`;

writeFileSync("src/lib/staticGlobeData.ts", out);
console.log(
  `OK → src/lib/staticGlobeData.ts (land ${land.length}B, highlight ${highlight.length}B, after round embedded)`,
);
