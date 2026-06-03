import type { CSSProperties } from "react";
import type { RealizationModule } from "@/lib/sanity/fetch";
import {
  matrixWidthUnits,
  matrixHeightUnits,
  screenRect,
  mergeOuterSides,
} from "@/lib/lockerMatrix";

// Inset „drzwiczek"/marginesu (wizualna szczelina). Komórki w layoucie są BEZ
// gapów (siatka równa co do piksela), a odstęp robimy wewnętrznym insetem:
// skrytki — ze wszystkich stron; ekran — tylko na krawędziach zewnętrznych
// bloku (styki ekran-ekran zostają bez szwu). Nic nie wchodzi na inne komórki.
const DOOR = 1.5;
const R = 3;

/**
 * Wizualizacja ściany PickUpWall złożonej z modeli (lockerModule). Każdy wiersz
 * to niezależny flex-rząd — komórki rozkładają się na pełną szerokość modułu wg
 * wag `w`, więc wiersze mogą mieć różną liczbę skrytek. Ekran scala się z komórek
 * (poziomo i pionowo), więc może być wysoki na kilka wierszy obok skrytek.
 */
// Maks. wysokość ściany na desktopie (px). Szerokość liczona jest z proporcji
// całej ściany, a wysokość spada automatycznie, gdy zabraknie miejsca w poziomie
// (mobile) — dzięki temu skrytki kurczą się proporcjonalnie zamiast wystawać.
const MAX_WALL_H = 420;

export default function LockerWallDiagram({
  modules,
  showLegend = true,
}: {
  modules: RealizationModule[];
  showLegend?: boolean;
}) {
  if (!modules.length) return null;

  const ratios = modules.map(
    (m) => matrixWidthUnits(m.matrix) / matrixHeightUnits(m.matrix),
  );
  // Proporcja całej ściany (szer:wys) = suma proporcji modułów (wspólna wys.).
  const sumRatio = ratios.reduce((a, b) => a + b, 0) || 1;
  // Pojedynczy moduł jest wąski (wysoki/cienki) → przy bazowej wysokości
  // wychodzi mały i „ściśnięty”. Dajemy mu większą wysokość, żeby się rozciągnął.
  const wallH = modules.length === 1 ? 560 : MAX_WALL_H;

  return (
    <div>
      {/* Cała ściana: szerokość docelowa = wallH·proporcja (KONKRETNA, nie
          w-full — inaczej w karcie lg:w-fit zwija się do zera, bo moduły mają
          flex-basis 0). maxWidth:100% przycina do dostępnego miejsca, więc na
          mobile wypełnia szerokość, a aspect-ratio sam obniża wysokość. */}
      <div
        className="mx-auto"
        style={{
          width: `calc(${wallH}px * ${sumRatio})`,
          maxWidth: "100%",
        }}>
        <div
          className="flex items-stretch w-full"
          style={{ aspectRatio: `${sumRatio} / 1` }}>
          {modules.map((m, i) => (
            <ModuleGrid
              key={`${m.id}-${i}`}
              module={m}
              ratio={ratios[i]}
              first={i === 0}
              last={i === modules.length - 1}
            />
          ))}
        </div>
      </div>

      {showLegend && <RealizationModuleLegend modules={modules} />}
    </div>
  );
}

/** Legenda modeli — swatch + nazwa (unikalne po nazwie). */
export function RealizationModuleLegend({
  modules,
  horizontal = false,
}: {
  modules: RealizationModule[];
  horizontal?: boolean;
}) {
  const legend = modules.filter(
    (m, i) => modules.findIndex((x) => x.title === m.title) === i,
  );
  return (
    <div
      className={`flex ${
        horizontal ? "flex-row flex-wrap gap-x-6 gap-y-2" : "flex-col gap-3"
      } text-xs uppercase tracking-wider text-[#3a5a60]`}>
      {legend.map((m) => (
        <div key={m.title} className="flex items-center gap-2.5">
          <span
            className="block shrink-0"
            style={{
              width: 14,
              height: 14,
              background: m.accent,
              borderRadius: 3,
            }}
          />
          {m.title}
        </div>
      ))}
    </div>
  );
}

function ModuleGrid({
  module: m,
  ratio,
  first,
  last,
}: {
  module: RealizationModule;
  ratio: number;
  first: boolean;
  last: boolean;
}) {
  const { rows } = m.matrix;
  const accent = m.accent;
  const rect = screenRect(m.matrix);
  const radius = 6;

  const outer: CSSProperties = {
    // Szerokość proporcjonalna do reszty ściany; wysokość = 100% wiersza flex.
    flex: `${ratio} 1 0`,
    minWidth: 0,
    height: "100%",
    padding: 5,
    background: "#f5f7f9",
    borderTop: `1.5px solid ${accent}`,
    borderBottom: `1.5px solid ${accent}`,
    borderLeft: `1.5px solid ${accent}`,
    borderRight: last ? `1.5px solid ${accent}` : "none",
    borderTopLeftRadius: first ? radius : 0,
    borderBottomLeftRadius: first ? radius : 0,
    borderTopRightRadius: last ? radius : 0,
    borderBottomRightRadius: last ? radius : 0,
  };

  return (
    <div style={outer} aria-label={m.title}>
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}>
        {rows.map((row, ri) => (
          <div
            key={ri}
            style={{ flex: `${row.h} 1 0`, display: "flex", minHeight: 0 }}>
            {row.cells.map((cell, ci) => (
              <div
                key={ci}
                style={{ flex: `${cell.w} 1 0`, minWidth: 0, position: "relative" }}>
                {(cell.k === "locker" || cell.k === "joined") &&
                  (() => {
                    const s = mergeOuterSides(rows, ri, ci);
                    return (
                      <div
                        style={{
                          position: "absolute",
                          top: s.top ? DOOR : 0,
                          right: s.right ? DOOR : 0,
                          bottom: s.bottom ? DOOR : 0,
                          left: s.left ? DOOR : 0,
                          boxSizing: "border-box",
                          background: `${accent}22`,
                          borderStyle: "solid",
                          borderColor: `${accent}66`,
                          borderTopWidth: s.top ? 0.5 : 0,
                          borderRightWidth: s.right ? 0.5 : 0,
                          borderBottomWidth: s.bottom ? 0.5 : 0,
                          borderLeftWidth: s.left ? 0.5 : 0,
                          borderTopLeftRadius: s.top && s.left ? 2 : 0,
                          borderTopRightRadius: s.top && s.right ? 2 : 0,
                          borderBottomLeftRadius: s.bottom && s.left ? 2 : 0,
                          borderBottomRightRadius: s.bottom && s.right ? 2 : 0,
                        }}
                      />
                    );
                  })()}
                {cell.k === "screen" &&
                  (() => {
                    const s = mergeOuterSides(rows, ri, ci);
                    return (
                      <div
                        style={{
                          position: "absolute",
                          top: s.top ? DOOR : 0,
                          right: s.right ? DOOR : 0,
                          bottom: s.bottom ? DOOR : 0,
                          left: s.left ? DOOR : 0,
                          boxSizing: "border-box",
                          background: accent,
                          borderTopLeftRadius: s.top && s.left ? R : 0,
                          borderTopRightRadius: s.top && s.right ? R : 0,
                          borderBottomLeftRadius: s.bottom && s.left ? R : 0,
                          borderBottomRightRadius: s.bottom && s.right ? R : 0,
                        }}
                      />
                    );
                  })()}
              </div>
            ))}
          </div>
        ))}

        {/* Tylko wyśrodkowany napis EKRAN (wypełnienie dają komórki). */}
        {rect && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: `${rect.left}%`,
              top: `${rect.top}%`,
              width: `${rect.width}%`,
              height: `${rect.height}%`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}>
            <span
              style={{
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.1em",
                whiteSpace: "nowrap",
              }}>
              EKRAN
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
