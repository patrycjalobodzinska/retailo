import { defineField, defineType } from "sanity";

export const homeHero = defineType({
  name: "homeHero",
  title: "Strona główna · Hero",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Zdjęcie główne (render PickUpWall)",
      type: "image",
      options: { hotspot: true },
      description: "Duże zdjęcie produktu w hero (najważniejszy obraz strony).",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero - duży nagłówek (PickUpWall)",
      type: "localizedString",
    }),
    defineField({
      name: "heroDescription",
      title: "Hero - opis pod nagłówkiem",
      type: "localizedText",
    }),
    defineField({
      name: "heroScrollLabel",
      title: "Hero - etykieta SCROLL DOWN",
      type: "localizedString",
    }),
    defineField({
      name: "heroBadges",
      title: "Hero - pływające badge'e (max 3)",
      type: "array",
      of: [
        {
          type: "object",
          name: "heroBadge",
          fields: [
            defineField({
              name: "value",
              title: "Wartość (np. <10 s, Modułowy, API)",
              type: "localizedString",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Etykieta (np. Czas odbioru)",
              type: "localizedString",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { items: "value.translations" },
            prepare: ({ items }) => {
              const list = (items as { value?: string }[] | undefined) ?? [];
              const first = list.find((i) => i?.value)?.value;
              return { title: first ?? "(badge)" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "heroInstallImage",
      title: "Zdjęcie karty referencji (wdrożenie)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroInstallEyebrow",
      title: "Hero - eyebrow karty referencji (np. Zaufali nam)",
      type: "localizedString",
    }),
    defineField({
      name: "heroInstallTitle",
      title: "Hero - tytuł karty referencji",
      type: "localizedString",
    }),
    defineField({
      name: "heroInstallSubtitle",
      title: "Hero - podtytuł karty referencji",
      type: "localizedString",
    }),
  ],
  preview: { prepare: () => ({ title: "Hero" }) },
});
