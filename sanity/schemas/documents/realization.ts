import { defineField, defineType } from "sanity";
import { LockerWallPreview } from "../../components/LockerWallPreview";

export const realization = defineType({
  name: "realization",
  title: "Realizacja",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      description: "Generuje się z wpisanego tytułu.",
      options: {
        source: (doc) => {
          const translations = (
            doc as { title?: { translations?: { value?: string }[] } }
          ).title?.translations;
          const first = translations?.find((t) => t?.value)?.value;
          return first ?? "realizacja";
        },
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Promowane",
      type: "boolean",
      description:
        "Promowane realizacje wyświetlają się jako większe karty na górze listy realizacji.",
      initialValue: false,
    }),
    defineField({
      name: "client",
      title: "Klient",
      type: "string",
    }),
    defineField({
      name: "location",
      title: "Lokalizacja",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      title: "Rok wdrożenia",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lockerCount",
      title: "Liczba skrytek",
      type: "number",
    }),
    defineField({
      name: "specs",
      title: "Dodatkowe pola tabeli (nazwa + wartość)",
      type: "array",
      description:
        "Własne wiersze tabeli „Dane wdrożenia” - dowolne per realizacja, np. Powierzchnia / 12 m².",
      of: [
        {
          type: "object",
          name: "spec",
          fields: [
            {
              name: "label",
              title: "Nazwa",
              type: "localizedString",
              validation: (rule) => rule.required(),
            },
            {
              name: "value",
              title: "Wartość",
              type: "localizedString",
              validation: (rule) => rule.required(),
            },
          ],
          preview: {
            select: {
              label: "label.translations",
              value: "value.translations",
            },
            prepare: ({ label, value }) => {
              const first = (t: unknown) =>
                (Array.isArray(t)
                  ? (t as { value?: string }[]).find((x) => x?.value)?.value
                  : "") ?? "";
              return {
                title: first(label) || "(pole tabeli)",
                subtitle: first(value),
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "masterCount",
      title: "Liczba jednostek głównych (Master, z ekranem)",
      type: "number",
      description:
        "Ile modułów Master w instalacji. Domyślnie 1 - używane w schemacie konfiguracji.",
      initialValue: 1,
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "slaveCount",
      title: "Liczba jednostek rozszerzających (Slave)",
      type: "number",
      description:
        "Ile modułów Slave (bez ekranu). Domyślnie 1 - używane w schemacie konfiguracji (fallback, gdy nie wybrano modeli poniżej).",
      initialValue: 1,
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "modules",
      title: "Konfiguracja ściany (modele w kolejności)",
      type: "array",
      description:
        "Jedno urządzenie: złóż ścianę wybierając modele od lewej do prawej. Jeśli puste - używany jest prosty schemat Master/Slave z liczb powyżej. Pod polem widać podgląd złożonej ściany. Gdy realizacja ma kilka osobnych urządzeń, użyj pola „Urządzenia” poniżej - to pole zostanie wtedy ukryte.",
      of: [{ type: "reference", to: [{ type: "lockerModule" }] }],
      components: { input: LockerWallPreview },
      hidden: ({ document }) =>
        Array.isArray((document as { devices?: unknown[] })?.devices) &&
        ((document as { devices?: unknown[] }).devices?.length ?? 0) > 0,
    }),
    defineField({
      name: "devices",
      title: "Urządzenia (kilka osobnych ścian obok siebie)",
      type: "array",
      description:
        "Użyj, gdy realizacja ma KILKA osobnych urządzeń stojących obok siebie (np. 2 urządzenia po 2 moduły). Każde urządzenie złóż osobno z modeli. Jeśli wypełnione - ma pierwszeństwo nad pojedynczą „Konfiguracją ściany” powyżej. Na schemacie urządzenia rysują się obok siebie z przerwą.",
      of: [
        {
          type: "object",
          name: "device",
          fields: [
            defineField({
              name: "label",
              title: "Nazwa urządzenia (opcjonalnie, np. „Urządzenie A”)",
              type: "string",
            }),
            defineField({
              name: "modules",
              title: "Moduły urządzenia (w kolejności)",
              type: "array",
              of: [{ type: "reference", to: [{ type: "lockerModule" }] }],
              components: { input: LockerWallPreview },
              validation: (rule) => rule.required().min(1),
            }),
          ],
          preview: {
            select: { label: "label", modules: "modules" },
            prepare: ({ label, modules }) => ({
              title: label || "Urządzenie",
              subtitle: `${(modules as unknown[] | undefined)?.length ?? 0} modułów`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: "summary",
      title: "Krótki opis (na liście / kafelek)",
      type: "localizedText",
    }),
    defineField({
      name: "body",
      title: "Opis (opcjonalny, rich text - pod schematem i tabelą)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "coverImage",
      title: "Zdjęcie główne",
      type: "image",
      description:
        "Pokazywane w całości (bez przycinania). Kółkiem (punkt ostrości) ustaw co ma być wyśrodkowane.",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Galeria",
      type: "array",
      description: "",
      of: [
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
    }),
  ],
  preview: {
    select: {
      titleTranslations: "title.translations",
      slug: "slug.current",
      cover: "coverImage",
    },
    prepare: ({ titleTranslations, slug, cover }) => {
      const list =
        (titleTranslations as { value?: string }[] | undefined) ?? [];
      const first = list.find((i) => i?.value)?.value;
      return {
        title: first ?? "(bez tytułu)",
        subtitle: slug ? `/${slug}` : "(brak slug)",
        media: cover,
      };
    },
  },
});
