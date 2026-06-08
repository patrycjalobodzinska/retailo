
export type LockerCellKind = "locker" | "joined" | "screen" | "empty";
export type LockerCell = { w: number; k: LockerCellKind };
export type LockerRow = { h: number; cells: LockerCell[] };
export type LockerMatrix = { rows: LockerRow[] };

const mkRow = (count: number, k: LockerCellKind = "locker"): LockerRow => ({
  h: 1,
  cells: Array.from({ length: count }, () => ({ w: 1, k })),
});

export const DEFAULT_LOCKER_MATRIX: LockerMatrix = {
  rows: Array.from({ length: 8 }, () => mkRow(4)),
};

const pos = (n: unknown, min = 0.1): number => {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? Math.max(min, v) : 1;
};

const kind = (k: unknown): LockerCellKind =>
  k === "screen"
    ? "screen"
    : k === "empty"
      ? "empty"
      : k === "joined"
        ? "joined"
        : "locker";

export function parseLockerMatrix(value?: string | null): LockerMatrix {
  if (!value) return DEFAULT_LOCKER_MATRIX;
  let o: unknown;
  try {
    o = JSON.parse(value);
  } catch {
    return DEFAULT_LOCKER_MATRIX;
  }
  if (!o || typeof o !== "object") return DEFAULT_LOCKER_MATRIX;
  const obj = o as Record<string, unknown>;

  if (
    Array.isArray(obj.rows) &&
    obj.rows.length > 0 &&
    obj.rows[0] &&
    typeof obj.rows[0] === "object" &&
    Array.isArray((obj.rows[0] as Record<string, unknown>).cells)
  ) {
    const rows: LockerRow[] = (obj.rows as unknown[])
      .filter(
        (r): r is Record<string, unknown> =>
          !!r &&
          typeof r === "object" &&
          Array.isArray((r as Record<string, unknown>).cells),
      )
      .map((r) => ({
        h: pos(r.h),
        cells: (r.cells as unknown[]).map((c) => {
          const cell = (c ?? {}) as Record<string, unknown>;
          return { w: pos(cell.w), k: kind(cell.k) };
        }),
      }))
      .filter((r) => r.cells.length > 0);
    return rows.length ? { rows } : DEFAULT_LOCKER_MATRIX;
  }

  if (
    Array.isArray(obj.cols) &&
    Array.isArray(obj.rows) &&
    obj.cols.length > 0 &&
    obj.rows.length > 0
  ) {
    const cols = (obj.cols as unknown[]).map((n) => pos(n));
    const heights = (obj.rows as unknown[]).map((n) => pos(n));
    const s = (
      obj.screen && typeof obj.screen === "object" ? obj.screen : null
    ) as { c: number; cs: number; r: number; rs: number } | null;
    const inScreen = (row1: number, col1: number) =>
      !!s &&
      col1 >= s.c &&
      col1 < s.c + s.cs &&
      row1 >= s.r &&
      row1 < s.r + s.rs;
    const rows: LockerRow[] = heights.map((h, ri) => ({
      h,
      cells: cols.map((w, ci) => ({
        w,
        k: inScreen(ri + 1, ci + 1) ? ("screen" as const) : ("locker" as const),
      })),
    }));
    return { rows };
  }

  return DEFAULT_LOCKER_MATRIX;
}

export function matrixWidthUnits(m: LockerMatrix): number {
  return m.rows.reduce(
    (max, r) => Math.max(max, r.cells.reduce((a, c) => a + c.w, 0)),
    0.1,
  );
}

export function matrixHeightUnits(m: LockerMatrix): number {
  return m.rows.reduce((a, r) => a + r.h, 0) || 0.1;
}

export type ScreenRect = {
  left: number;
  top: number;
  width: number;
  height: number;
} | null;

export type OuterSides = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

export function mergeOuterSides(
  rows: LockerRow[],
  ri: number,
  ci: number,
): OuterSides {
  const row = rows[ri];
  const k = row.cells[ci].k;
  const below = rows[ri + 1]?.cells[ci]?.k;

  if (k === "screen") {
    return {
      top: rows[ri - 1]?.cells[ci]?.k !== "screen",
      bottom: below !== "screen",
      left: row.cells[ci - 1]?.k !== "screen",
      right: row.cells[ci + 1]?.k !== "screen",
    };
  }

  const mergeUp = k === "joined"; // ta komórka łączy się z górną
  const mergeDown = below === "joined"; // dolna łączy się w górę z tą
  return {
    top: !mergeUp,
    bottom: !mergeDown,
    left: true,
    right: true,
  };
}

export function screenRect(m: LockerMatrix): ScreenRect {
  const sumH = matrixHeightUnits(m);
  const rowTops: number[] = [];
  let acc = 0;
  for (const r of m.rows) {
    rowTops.push(acc);
    acc += r.h;
  }

  let firstRow = -1;
  let lastRow = -1;
  let left = Infinity;
  let right = -Infinity;

  m.rows.forEach((row, ri) => {
    const rowSumW = row.cells.reduce((a, c) => a + c.w, 0) || 0.1;
    let cum = 0;
    let rowLeft = Infinity;
    let rowRight = -Infinity;
    for (const c of row.cells) {
      const start = cum;
      const end = cum + c.w;
      if (c.k === "screen") {
        rowLeft = Math.min(rowLeft, start);
        rowRight = Math.max(rowRight, end);
      }
      cum = end;
    }
    if (rowRight > rowLeft) {
      if (firstRow === -1) firstRow = ri;
      lastRow = ri;
      left = Math.min(left, rowLeft / rowSumW);
      right = Math.max(right, rowRight / rowSumW);
    }
  });

  if (firstRow === -1) return null;
  const top = rowTops[firstRow] / sumH;
  const bottom = (rowTops[lastRow] + m.rows[lastRow].h) / sumH;
  return {
    left: left * 100,
    top: top * 100,
    width: (right - left) * 100,
    height: (bottom - top) * 100,
  };
}
