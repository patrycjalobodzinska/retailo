import { useCallback } from "react";
import { set, unset, type StringInputProps } from "sanity";
import { Flex, TextInput } from "@sanity/ui";

/**
 * Input pola koloru akcentu — natywny color picker + pole HEX obok.
 * Wartość pozostaje zwykłym stringiem HEX (#rrggbb), więc GROQ/fetch i
 * frontend (m.accent jako kolor CSS) działają bez zmian.
 */
const DEFAULT = "#0086b0";
const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

export function ColorHexInput(props: StringInputProps) {
  const { value, onChange } = props;
  const current = value ?? "";
  const swatch = isHex(current) ? current : DEFAULT;

  const commit = useCallback(
    (next: string) => onChange(next ? set(next) : unset()),
    [onChange],
  );

  return (
    <Flex gap={2} align="center">
      <input
        type="color"
        value={swatch}
        onChange={(e) => commit(e.currentTarget.value)}
        aria-label="Wybierz kolor akcentu"
        style={{
          width: 46,
          height: 35,
          padding: 2,
          border: "1px solid var(--card-border-color, #ccc)",
          borderRadius: 4,
          background: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      />
      <TextInput
        value={current}
        placeholder={DEFAULT}
        onChange={(e) => commit(e.currentTarget.value)}
      />
    </Flex>
  );
}

export default ColorHexInput;
