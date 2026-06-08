import { defineField, defineType } from "sanity";

export const homeQa = defineType({
  name: "homeQa",
  title: "Strona główna · Nasze rozwiązanie",
  type: "document",
  fields: [
    defineField({
      name: "qaEyebrow",
      title: "Eyebrow (Nasze rozwiązanie)",
      type: "localizedString",
    }),
    defineField({
      name: "qaHeadline",
      title: "Nagłówek (PickUpWall.)",
      type: "localizedString",
    }),
    defineField({
      name: "qaSubtitle",
      title: "Podtytuł",
      type: "localizedText",
    }),
    defineField({
      name: "qaClientLogo",
      title: "Logo klienta (np. Empik)",
      type: "image",
      description: "Logo pokazywane w kafelku referencji sekcji.",
    }),
    defineField({
      name: "qaTiles",
      title: "Kafelki cech (Modularność, Skalowalność, …)",
      type: "array",
      of: [
        {
          type: "object",
          name: "qaTile",
          fields: [
            defineField({
              name: "title",
              title: "Tytuł",
              type: "localizedString",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Opis",
              type: "localizedText",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { items: "title.translations" },
            prepare: ({ items }) => {
              const list = (items as { value?: string }[] | undefined) ?? [];
              const first = list.find((i) => i?.value)?.value;
              return { title: first ?? "(kafelek)" };
            },
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Nasze rozwiązanie" }) },
});
