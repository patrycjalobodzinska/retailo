import { defineField, defineType } from "sanity";

export const homeRealizations = defineType({
  name: "homeRealizations",
  title: "Strona główna · Realizacje (karuzela)",
  type: "document",
  fields: [
    defineField({
      name: "realizationsEyebrow",
      title: "Eyebrow (Realizacje)",
      type: "localizedString",
    }),
    defineField({
      name: "realizationsHeadline",
      title: "Nagłówek (PickUpWall w akcji.)",
      type: "localizedString",
    }),
    defineField({
      name: "realizationsIntro",
      title: "Krótki opis pod nagłówkiem",
      type: "localizedText",
    }),
    defineField({
      name: "realizationsCtaLabel",
      title: 'CTA - etykieta ("Zobacz wszystkie realizacje")',
      type: "localizedString",
    }),
    defineField({
      name: "realizationsCtaHref",
      title: "CTA - link",
      type: "string",
      initialValue: "/realizacje",
    }),
    defineField({
      name: "realizationsSystemEyebrow",
      title: "Eyebrow systemu obsługi zamówień",
      type: "localizedString",
    }),
    defineField({
      name: "realizationsSystemHeadline",
      title: "Nagłówek systemu (PickUpWall)",
      type: "localizedString",
    }),
    defineField({
      name: "realizationsSystemItems",
      title: "Punkty systemu (PickUpWall, Łatwość obsługi, Zamówienia 360)",
      type: "array",
      of: [
        {
          type: "object",
          name: "systemItem",
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
  preview: { prepare: () => ({ title: "Realizacje (karuzela)" }) },
});
