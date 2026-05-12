import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Ustawienia strony",
  type: "document",
  fields: [
    defineField({
      name: "logoText",
      title: "Logo (tekst)",
      type: "string",
      initialValue: "retailo.",
    }),
    defineField({
      name: "metaTitle",
      title: "Tytuł karty przeglądarki (domyślny)",
      type: "string",
      initialValue: "Retailo",
    }),
    defineField({
      name: "navigation",
      title: "Nawigacja",
      type: "array",
      of: [
        {
          type: "object",
          name: "navItem",
          fields: [
            defineField({
              name: "label",
              title: "Etykieta",
              type: "localizedString",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              description: "Anchor (#kontakt) lub ścieżka (/realizacje).",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              translations: "label.translations",
              href: "href",
            },
            prepare: ({ translations, href }) => {
              const list = (translations as { value?: string }[] | undefined) ?? [];
              const first = list.find((i) => i?.value)?.value;
              return {
                title: first ?? "(brak etykiety)",
                subtitle: href,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "ctaLabel",
      title: "Tekst przycisku CTA (Zapytaj o ofertę)",
      type: "localizedString",
    }),
    defineField({
      name: "ctaHref",
      title: "Link CTA",
      type: "string",
      initialValue: "#kontakt",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Ustawienia strony" }),
  },
});
