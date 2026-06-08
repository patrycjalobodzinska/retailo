import { useCallback } from "react";
import { set, unset, type StringInputProps } from "sanity";
import { Card, Stack, Flex, Box, Button, Text, TextInput } from "@sanity/ui";
import {
  parseLockerMatrix,
  matrixWidthUnits,
  matrixHeightUnits,
  screenRect,
  mergeOuterSides,
  type LockerMatrix,
  type LockerRow,
  type LockerCellKind,
} from "../../src/lib/lockerMatrix";

const DOOR = 1.5;
const R = 3;

const ACCENT = "#0086b0";
const NEXT_KIND: Record<LockerCellKind, LockerCellKind> = {
  locker: "joined",
  joined: "screen",
  screen: "empty",
  empty: "locker",
};

export function LockerMatrixInput(props: StringInputProps) {
  const { value, onChange } = props;
  const matrix = parseLockerMatrix(value);

  const commit = useCallback(
    (next: LockerMatrix) => onChange(set(JSON.stringify(next))),
    [onChange],
  );
  const setRows = (rows: LockerRow[]) => commit({ rows });

  const mapRow = (ri: number, fn: (r: LockerRow) => LockerRow) =>
    setRows(matrix.rows.map((r, i) => (i === ri ? fn(r) : r)));

  const setRowH = (ri: number, h: number) =>
    mapRow(ri, (r) => ({ ...r, h: Math.max(0.1, h) }));
  const addCell = (ri: number) =>
    mapRow(ri, (r) => ({ ...r, cells: [...r.cells, { w: 1, k: "locker" }] }));
  const removeCell = (ri: number) =>
    mapRow(ri, (r) =>
      r.cells.length > 1 ? { ...r, cells: r.cells.slice(0, -1) } : r,
    );
  const setCellW = (ri: number, ci: number, w: number) =>
    mapRow(ri, (r) => ({
      ...r,
      cells: r.cells.map((c, i) =>
        i === ci ? { ...c, w: Math.max(0.1, w) } : c,
      ),
    }));
  const cycleCell = (ri: number, ci: number) =>
    mapRow(ri, (r) => ({
      ...r,
      cells: r.cells.map((c, i) =>
        i === ci ? { ...c, k: NEXT_KIND[c.k] } : c,
      ),
    }));

  const addRow = () =>
    setRows([
      ...matrix.rows,
      { h: 1, cells: Array.from({ length: 4 }, () => ({ w: 1, k: "locker" })) },
    ]);
  const removeRow = (ri: number) =>
    matrix.rows.length > 1 &&
    setRows(matrix.rows.filter((_, i) => i !== ri));
  const duplicateRow = (ri: number) =>
    setRows([
      ...matrix.rows.slice(0, ri + 1),
      {
        h: matrix.rows[ri].h,
        cells: matrix.rows[ri].cells.map((c) => ({ ...c })),
      },
      ...matrix.rows.slice(ri + 1),
    ]);

  const ratio = matrixWidthUnits(matrix) / matrixHeightUnits(matrix);
  const previewH = 280;
  const rect = screenRect(matrix);

  return (
    <Stack space={4}>
      <Card padding={3} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Text size={1} muted>
            Klik w komórkę: skrytka → skrytka łączona (↥ = scala z komórką
            POWYŻEJ; np. wysoka na 2 = oznacz dolną komórkę) → ekran → puste.
          </Text>
          <Flex justify="center">
            <div
              style={{
                width: previewH * ratio,
                height: previewH,
                padding: 5,
                background: "#f5f7f9",
                border: `1.5px solid ${ACCENT}`,
                borderRadius: 6,
              }}>
              <div
                style={{
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}>
                {matrix.rows.map((row, ri) => (
                  <div
                    key={ri}
                    style={{
                      flex: `${row.h} 1 0`,
                      display: "flex",
                      minHeight: 0,
                    }}>
                    {row.cells.map((cell, ci) => (
                      <div
                        key={ci}
                        onClick={() => cycleCell(ri, ci)}
                        title={`Wiersz ${ri + 1}, komórka ${ci + 1} (${cell.k})`}
                        style={{
                          flex: `${cell.w} 1 0`,
                          minWidth: 0,
                          position: "relative",
                          cursor: "pointer",
                        }}>
                        {(cell.k === "locker" || cell.k === "joined") &&
                          (() => {
                            const s = mergeOuterSides(matrix.rows, ri, ci);
                            const joined = cell.k === "joined";
                            return (
                              <div
                                style={{
                                  position: "absolute",
                                  top: s.top ? DOOR : 0,
                                  right: s.right ? DOOR : 0,
                                  bottom: s.bottom ? DOOR : 0,
                                  left: s.left ? DOOR : 0,
                                  boxSizing: "border-box",
                                  background: joined ? `${ACCENT}33` : `${ACCENT}22`,
                                  borderStyle: "solid",
                                  borderColor: joined ? ACCENT : `${ACCENT}66`,
                                  borderTopWidth: s.top ? (joined ? 1 : 0.5) : 0,
                                  borderRightWidth: s.right
                                    ? joined
                                      ? 1
                                      : 0.5
                                    : 0,
                                  borderBottomWidth: s.bottom
                                    ? joined
                                      ? 1
                                      : 0.5
                                    : 0,
                                  borderLeftWidth: s.left ? (joined ? 1 : 0.5) : 0,
                                  borderTopLeftRadius: s.top && s.left ? 2 : 0,
                                  borderTopRightRadius: s.top && s.right ? 2 : 0,
                                  borderBottomLeftRadius:
                                    s.bottom && s.left ? 2 : 0,
                                  borderBottomRightRadius:
                                    s.bottom && s.right ? 2 : 0,
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "center",
                                  color: ACCENT,
                                  fontSize: 10,
                                  lineHeight: 1,
                                  paddingTop: 1,
                                }}>
                                {joined ? "↥" : ""}
                              </div>
                            );
                          })()}
                        {cell.k === "screen" &&
                          (() => {
                            const s = mergeOuterSides(matrix.rows, ri, ci);
                            return (
                              <div
                                style={{
                                  position: "absolute",
                                  top: s.top ? DOOR : 0,
                                  right: s.right ? DOOR : 0,
                                  bottom: s.bottom ? DOOR : 0,
                                  left: s.left ? DOOR : 0,
                                  boxSizing: "border-box",
                                  background: ACCENT,
                                  borderTopLeftRadius: s.top && s.left ? R : 0,
                                  borderTopRightRadius: s.top && s.right ? R : 0,
                                  borderBottomLeftRadius:
                                    s.bottom && s.left ? R : 0,
                                  borderBottomRightRadius:
                                    s.bottom && s.right ? R : 0,
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
          </Flex>
        </Stack>
      </Card>

      <Stack space={2}>
        {matrix.rows.map((row, ri) => (
          <Card key={ri} padding={3} radius={2} border>
            <Stack space={3}>
              <Flex align="center" justify="space-between" gap={2} wrap="wrap">
                <Flex align="center" gap={3}>
                  <Text size={1} weight="semibold">
                    Wiersz {ri + 1}
                  </Text>
                  <Flex align="center" gap={2}>
                    <Text size={0} muted>
                      wys.
                    </Text>
                    <Box style={{ width: 64 }}>
                      <TextInput
                        type="number"
                        fontSize={1}
                        padding={2}
                        step={0.1}
                        value={String(row.h)}
                        onChange={(e) =>
                          setRowH(ri, Number(e.currentTarget.value))
                        }
                      />
                    </Box>
                  </Flex>
                  <Flex align="center" gap={1}>
                    <Text size={0} muted>
                      komórki: {row.cells.length}
                    </Text>
                    <Button
                      mode="ghost"
                      text="−"
                      fontSize={1}
                      padding={2}
                      onClick={() => removeCell(ri)}
                      disabled={row.cells.length <= 1}
                    />
                    <Button
                      mode="ghost"
                      text="+"
                      fontSize={1}
                      padding={2}
                      onClick={() => addCell(ri)}
                    />
                  </Flex>
                </Flex>
                <Flex gap={2}>
                  <Button
                    mode="ghost"
                    text="Duplikuj"
                    fontSize={1}
                    padding={2}
                    onClick={() => duplicateRow(ri)}
                  />
                  <Button
                    mode="ghost"
                    tone="critical"
                    text="Usuń"
                    fontSize={1}
                    padding={2}
                    onClick={() => removeRow(ri)}
                    disabled={matrix.rows.length <= 1}
                  />
                </Flex>
              </Flex>

              <Flex align="center" gap={2} wrap="wrap">
                <Text size={0} muted>
                  szer. komórek:
                </Text>
                {row.cells.map((cell, ci) => (
                  <Box key={ci} style={{ width: 58 }}>
                    <TextInput
                      type="number"
                      fontSize={1}
                      padding={2}
                      step={0.1}
                      value={String(cell.w)}
                      onChange={(e) =>
                        setCellW(ri, ci, Number(e.currentTarget.value))
                      }
                    />
                  </Box>
                ))}
              </Flex>
            </Stack>
          </Card>
        ))}
      </Stack>

      <Flex justify="space-between">
        <Button
          mode="default"
          tone="primary"
          text="+ Dodaj wiersz"
          fontSize={1}
          padding={3}
          onClick={addRow}
        />
        <Button
          mode="bleed"
          tone="critical"
          text="Resetuj macierz"
          fontSize={1}
          padding={2}
          onClick={() => onChange(unset())}
        />
      </Flex>
    </Stack>
  );
}

export default LockerMatrixInput;
