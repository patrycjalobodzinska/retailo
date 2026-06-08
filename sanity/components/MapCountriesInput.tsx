import { useState } from "react";
import { set, unset, type ArrayOfPrimitivesInputProps } from "sanity";
import {
  Card,
  Stack,
  Flex,
  Box,
  Button,
  Text,
  TextInput,
  Select,
} from "@sanity/ui";

type Country = { iso: string; name: string };

const EUROPE: Country[] = [
  { iso: "AL", name: "Albania" },
  { iso: "AD", name: "Andora" },
  { iso: "AT", name: "Austria" },
  { iso: "BE", name: "Belgia" },
  { iso: "BY", name: "Białoruś" },
  { iso: "BA", name: "Bośnia i Hercegowina" },
  { iso: "BG", name: "Bułgaria" },
  { iso: "HR", name: "Chorwacja" },
  { iso: "ME", name: "Czarnogóra" },
  { iso: "CZ", name: "Czechy" },
  { iso: "CY", name: "Cypr" },
  { iso: "DK", name: "Dania" },
  { iso: "EE", name: "Estonia" },
  { iso: "FI", name: "Finlandia" },
  { iso: "FR", name: "Francja" },
  { iso: "GR", name: "Grecja" },
  { iso: "ES", name: "Hiszpania" },
  { iso: "NL", name: "Holandia" },
  { iso: "IE", name: "Irlandia" },
  { iso: "IS", name: "Islandia" },
  { iso: "LI", name: "Liechtenstein" },
  { iso: "LT", name: "Litwa" },
  { iso: "LU", name: "Luksemburg" },
  { iso: "LV", name: "Łotwa" },
  { iso: "MK", name: "Macedonia Północna" },
  { iso: "MT", name: "Malta" },
  { iso: "MD", name: "Mołdawia" },
  { iso: "MC", name: "Monako" },
  { iso: "DE", name: "Niemcy" },
  { iso: "NO", name: "Norwegia" },
  { iso: "PL", name: "Polska" },
  { iso: "PT", name: "Portugalia" },
  { iso: "RU", name: "Rosja" },
  { iso: "RO", name: "Rumunia" },
  { iso: "SM", name: "San Marino" },
  { iso: "RS", name: "Serbia" },
  { iso: "SK", name: "Słowacja" },
  { iso: "SI", name: "Słowenia" },
  { iso: "CH", name: "Szwajcaria" },
  { iso: "SE", name: "Szwecja" },
  { iso: "TR", name: "Turcja" },
  { iso: "UA", name: "Ukraina" },
  { iso: "VA", name: "Watykan" },
  { iso: "HU", name: "Węgry" },
  { iso: "GB", name: "Wielka Brytania" },
  { iso: "IT", name: "Włochy" },
  { iso: "XK", name: "Kosowo" },
];

const NAME_BY_ISO = new Map(EUROPE.map((c) => [c.iso, c.name]));

const normalizeIso = (raw: string): string =>
  raw.trim().toUpperCase().replace(/[^A-Z]/g, "");

export function MapCountriesInput(props: ArrayOfPrimitivesInputProps) {
  const { onChange } = props;
  const value = (props.value as string[] | undefined) ?? [];
  const [custom, setCustom] = useState("");

  const commit = (next: string[]) =>
    onChange(next.length ? set(next) : unset());

  const add = (code: string) => {
    const iso = normalizeIso(code);
    if (!iso || value.includes(iso)) return;
    commit([...value, iso]);
  };
  const remove = (iso: string) => commit(value.filter((c) => c !== iso));

  const addCustom = () => {
    add(custom);
    setCustom("");
  };

  const available = EUROPE.filter((c) => !value.includes(c.iso));

  return (
    <Stack space={4}>
      <Card padding={3} radius={2} border tone="transparent">
        {value.length === 0 ? (
          <Text size={1} muted>
            Brak krajów - dodaj z listy Europy lub wpisz kod ISO ręcznie.
          </Text>
        ) : (
          <Flex gap={2} wrap="wrap">
            {value.map((iso) => (
              <Flex
                key={iso}
                align="center"
                gap={2}
                style={{
                  background: "#e8f4f7",
                  border: "1px solid #b9dde6",
                  borderRadius: 999,
                  padding: "4px 6px 4px 12px",
                }}>
                <Text size={1}>
                  <strong>{iso}</strong>
                  {NAME_BY_ISO.has(iso) ? ` · ${NAME_BY_ISO.get(iso)}` : ""}
                </Text>
                <Button
                  mode="bleed"
                  tone="critical"
                  padding={1}
                  fontSize={1}
                  text="×"
                  onClick={() => remove(iso)}
                  aria-label={`Usuń ${iso}`}
                />
              </Flex>
            ))}
          </Flex>
        )}
      </Card>

      <Stack space={2}>
        <Text size={1} weight="semibold">
          Dodaj kraj Europy
        </Text>
        <Select
          fontSize={1}
          padding={3}
          value=""
          onChange={(e) => {
            const v = e.currentTarget.value;
            if (v) add(v);
          }}>
          <option value="">- wybierz kraj -</option>
          {available.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.name} ({c.iso})
            </option>
          ))}
        </Select>
      </Stack>

      <Stack space={2}>
        <Text size={1} weight="semibold">
          Albo wpisz kod ISO ręcznie (spoza Europy)
        </Text>
        <Flex gap={2}>
          <Box flex={1}>
            <TextInput
              fontSize={1}
              padding={3}
              placeholder="np. US, JP, AU"
              value={custom}
              maxLength={3}
              onChange={(e) => setCustom(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
            />
          </Box>
          <Button
            mode="default"
            tone="primary"
            fontSize={1}
            padding={3}
            text="Dodaj kod"
            onClick={addCustom}
            disabled={!normalizeIso(custom)}
          />
        </Flex>
        <Text size={0} muted>
          2-literowy kod ISO_A2 (np. US - USA, JP - Japonia). Kraj musi być w
          pliku countries.geojson, żeby się podświetlił.
        </Text>
      </Stack>
    </Stack>
  );
}

export default MapCountriesInput;
