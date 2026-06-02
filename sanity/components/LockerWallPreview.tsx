import { useEffect, useState } from "react";
import { useClient, type ArrayOfObjectsInputProps, type Reference } from "sanity";
import { Card, Stack, Flex, Text, Spinner, Box } from "@sanity/ui";
import {
  parseLockerMatrix,
  matrixWidthUnits,
  matrixHeightUnits,
  screenRect,
  mergeOuterSides,
  type LockerMatrix,
} from "../../src/lib/lockerMatrix";

const DOOR = 1.5;
const R = 3;
const API_VERSION = "2024-10-01";

type ResolvedModule = {
  id: string;
  title: string;
  accent: string;
  lockers?: number;
  matrix: LockerMatrix;
};

/**
 * Podgląd złożonej ściany PickUpWall pod polem „Konfiguracja ściany". Czyta
 * referencje do modeli (lockerModule) z wartości pola, dociąga ich dane
 * (nazwa, kolor, macierz) i rysuje moduły obok siebie w wybranej kolejności —
 * dokładnie tak, jak wyświetlą się na stronie realizacji. Renderuje też
 * domyślny edytor referencji (renderDefault), więc dodaje podgląd, a nie
 * zastępuje standardowej obsługi pola.
 */
export function LockerWallPreview(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const value = props.value as Array<Reference> | undefined;

  // Stabilna lista _ref w kolejności wybranej w polu.
  const refIds = (value ?? [])
    .map((item) => item?._ref)
    .filter((id): id is string => typeof id === "string");
  const refKey = refIds.join(",");

  const [modules, setModules] = useState<ResolvedModule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (refIds.length === 0) {
      setModules([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    // Dociągamy też wersje robocze (drafts.*), żeby podgląd działał zanim
    // model zostanie opublikowany. Mapę budujemy po „czystym" _id.
    const draftIds = refIds.map((id) => `drafts.${id}`);
    client
      .fetch<
        Array<{
          _id: string;
          title?: string;
          accent?: string;
          lockers?: number;
          matrix?: string;
        }>
      >(
        `*[_id in $ids]{ _id, title, accent, lockers, matrix }`,
        { ids: [...refIds, ...draftIds] },
      )
      .then((docs) => {
        if (cancelled) return;
        const byId = new Map<string, (typeof docs)[number]>();
        for (const d of docs) {
          const baseId = d._id.replace(/^drafts\./, "");
          // Draft ma pierwszeństwo (świeższe dane podczas edycji).
          if (d._id.startsWith("drafts.") || !byId.has(baseId)) {
            byId.set(baseId, d);
          }
        }
        // Zachowujemy kolejność z pola.
        const resolved: ResolvedModule[] = refIds
          .map((id) => byId.get(id))
          .filter((d): d is (typeof docs)[number] => Boolean(d))
          .map((d, i) => ({
            id: d._id.replace(/^drafts\./, "") || `module-${i}`,
            title: d.title ?? "Model",
            accent: d.accent || "#0086b0",
            lockers: d.lockers,
            matrix: parseLockerMatrix(d.matrix),
          }));
        setModules(resolved);
      })
      .catch(() => {
        if (!cancelled) setModules([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refKey]);

  return (
    <Stack space={4}>
      {props.renderDefault(props)}

      <Card padding={3} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Flex align="center" justify="space-between" gap={2}>
            <Text size={1} weight="semibold">
              Podgląd ściany
            </Text>
            {loading && <Spinner muted size={1} />}
          </Flex>

          {refIds.length === 0 ? (
            <Text size={1} muted>
              Dodaj modele powyżej, aby zobaczyć podgląd złożonej ściany.
            </Text>
          ) : modules.length === 0 && !loading ? (
            <Text size={1} muted>
              Nie udało się wczytać podglądu wybranych modeli.
            </Text>
          ) : (
            <Stack space={3}>
              <Box style={{ overflowX: "auto" }}>
                <Flex justify="center" align="stretch">
                  {modules.map((m, i) => (
                    <ModuleGrid
                      key={`${m.id}-${i}`}
                      module={m}
                      first={i === 0}
                      last={i === modules.length - 1}
                    />
                  ))}
                </Flex>
              </Box>
              <ModuleLegend modules={modules} />
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

/** Legenda — swatch + nazwa (unikalne po nazwie). */
function ModuleLegend({ modules }: { modules: ResolvedModule[] }) {
  const legend = modules.filter(
    (m, i) => modules.findIndex((x) => x.title === m.title) === i,
  );
  return (
    <Flex gap={3} wrap="wrap">
      {legend.map((m) => (
        <Flex key={m.title} align="center" gap={2}>
          <span
            style={{
              width: 14,
              height: 14,
              background: m.accent,
              borderRadius: 3,
              display: "block",
              flexShrink: 0,
            }}
          />
          <Text size={1}>
            {m.title}
            {typeof m.lockers === "number" ? ` · ${m.lockers} skrytek` : ""}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

const PREVIEW_H = 240;

/** Jeden moduł — siatka per-wiersz, identyczna logika jak LockerWallDiagram. */
function ModuleGrid({
  module: m,
  first,
  last,
}: {
  module: ResolvedModule;
  first: boolean;
  last: boolean;
}) {
  const { rows } = m.matrix;
  const ratio = matrixWidthUnits(m.matrix) / matrixHeightUnits(m.matrix);
  const accent = m.accent;
  const rect = screenRect(m.matrix);
  const radius = 6;

  return (
    <div
      aria-label={m.title}
      title={m.title}
      style={{
        height: PREVIEW_H,
        width: PREVIEW_H * ratio,
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
        flexShrink: 0,
      }}>
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
                style={{
                  flex: `${cell.w} 1 0`,
                  minWidth: 0,
                  position: "relative",
                }}>
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

export default LockerWallPreview;
