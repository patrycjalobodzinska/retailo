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
        "Własne wiersze tabeli „Dane wdrożenia” — dowolne per realizacja, np. Powierzchnia / 12 m².",
      of: [
        {
          type: "object",
          name: "spec",
          fields: [
            {
              name: "label",
              title: "Nazwa",
              type: "string",
              validation: (rule) => rule.required(),
            },
            {
              name: "value",
              title: "Wartość",
              type: "string",
              validation: (rule) => rule.required(),
            },
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        },
      ],
    }),
    defineField({
      name: "masterCount",
      title: "Liczba jednostek głównych (Master, z ekranem)",
      type: "number",
      description:
        "Ile modułów Master w instalacji. Domyślnie 1 — używane w schemacie konfiguracji.",
      initialValue: 1,
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "slaveCount",
      title: "Liczba jednostek rozszerzających (Slave)",
      type: "number",
      description:
        "Ile modułów Slave (bez ekranu). Domyślnie 1 — używane w schemacie konfiguracji (fallback, gdy nie wybrano modeli poniżej).",
      initialValue: 1,
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "modules",
      title: "Konfiguracja ściany (modele w kolejności)",
      type: "array",
      description:
        "Złóż ścianę wybierając modele od lewej do prawej. Jeśli puste — używany jest prosty schemat Master/Slave z liczb powyżej. Pod polem widać podgląd złożonej ściany.",
      of: [{ type: "reference", to: [{ type: "lockerModule" }] }],
      components: { input: LockerWallPreview },
    }),
    defineField({
      name: "summary",
      title: "Krótki opis (na liście / kafelek)",
      type: "localizedText",
    }),
    defineField({
      name: "body",
      title: "Opis (opcjonalny, rich text — pod schematem i tabelą)",
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
      description:
        "Miniatury są automatycznie kadrowane do 4:3 wg punktu ostrości (kółko, które przeciągasz na zdjęciu). Domyślny cropper Sanity nie ma wyboru proporcji — kadr ustala właśnie to kółko. W podglądzie (klik) widać całe zdjęcie.",
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
      const list = (titleTranslations as { value?: string }[] | undefined) ?? [];
      const first = list.find((i) => i?.value)?.value;
      return {
        title: first ?? "(bez tytułu)",
        subtitle: slug ? `/${slug}` : "(brak slug)",
        media: cover,
      };
    },
  },
});
