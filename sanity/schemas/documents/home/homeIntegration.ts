import { defineField, defineType } from "sanity";

export const homeIntegration = defineType({
  name: "homeIntegration",
  title: "Strona główna · Integracja, instalacja, wsparcie",
  type: "document",
  fields: [
    defineField({
      name: "integrationEyebrow",
      title: "Eyebrow (Nasza oferta)",
      type: "localizedString",
    }),
    defineField({
      name: "integrationHeadline",
      title: "Nagłówek (Integracja, instalacja, wsparcie)",
      type: "localizedString",
    }),
    defineField({
      name: "integrationIntro",
      title: "Wstęp pod nagłówkiem",
      type: "localizedText",
    }),
    defineField({
      name: "integrationItems",
      title: "Punkty (Integracja, RODO, Instalacja, Wsparcie)",
      type: "array",
      of: [
        {
          type: "object",
          name: "integrationItem",
          fields: [
            defineField({
              name: "title",
              type: "localizedString",
              title: "Tytuł",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              type: "localizedText",
              title: "Opis",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { items: "title.translations" },
            prepare: ({ items }) => {
              const list = (items as { value?: string }[] | undefined) ?? [];
              const first = list.find((i) => i?.value)?.value;
              return { title: first ?? "(punkt)" };
            },
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Integracja, instalacja, wsparcie" }) },
});
