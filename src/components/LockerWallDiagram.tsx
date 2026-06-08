import type { CSSProperties } from "react";
import type { RealizationModule, RealizationDevice } from "@/lib/sanity/fetch";
import {
  matrixWidthUnits,
  matrixHeightUnits,
  screenRect,
  mergeOuterSides,
} from "@/lib/lockerMatrix";

const DOOR = 1.5;
const R = 3;

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
  const sumRatio = ratios.reduce((a, b) => a + b, 0) || 1;
  const wallH = modules.length === 1 ? 560 : MAX_WALL_H;

  return (
    <div>
      <div
        className="mx-auto"
        style={{
          width: `calc(${wallH}px * ${sumRatio})`,
          maxWidth: `min(100%, calc(60vh * ${sumRatio}))`,
        }}>
        <div
          className="flex items-stretch w-full"
          style={{ aspectRatio: `${sumRatio} / 1` }}>
          {modules.map((m, i) => (
            <ModuleGrid
              key={`${m.id}-${i}`}
              module={m}
              ratio={ratios[i] / sumRatio}
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

export function LockerDevicesDiagram({
  devices,
  showLegend = true,
}: {
  devices: RealizationDevice[];
  showLegend?: boolean;
}) {
  const all = devices.flatMap((d) => d.modules);
  if (!all.length) return null;

  return (
    <div>
      <div className="flex flex-row flex-wrap items-end justify-center gap-x-8 gap-y-10 lg:gap-x-12">
        {devices.map((d, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 min-w-0 max-w-full">
            <LockerWallDiagram modules={d.modules} showLegend={false} />
            {d.label && (
              <span className="text-xs uppercase tracking-wider text-[#3a5a60] text-center">
                {d.label}
              </span>
            )}
          </div>
        ))}
      </div>
      {showLegend && (
        <div className="mt-6">
          <RealizationModuleLegend modules={all} horizontal />
        </div>
      )}
    </div>
  );
}

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
