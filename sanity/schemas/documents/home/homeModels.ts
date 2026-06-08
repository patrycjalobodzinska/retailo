import { defineField, defineType } from "sanity";

export const homeModels = defineType({
  name: "homeModels",
  title: "Strona główna · Modele PickUpWall",
  type: "document",
  fields: [
    defineField({
      name: "modelsVisible",
      title: "Pokaż sekcję modeli",
      type: "boolean",
      description:
        "Wyłącz, aby ukryć całą sekcję „Modele PickUpWall” na stronie głównej.",
      initialValue: true,
    }),
    defineField({
      name: "modelsHeadline",
      title: "Modele - nagłówek sekcji",
      type: "localizedString",
    }),
    defineField({
      name: "models",
      title: "Modele (karty)",
      type: "array",
      description:
        "Karty modeli na stronie głównej. Zaznacz jeden jako „wyróżniony” - wyświetli się jako większa, środkowa karta.",
      of: [
        {
          type: "object",
          name: "model",
          fields: [
            {
              name: "name",
              title: "Nazwa",
              type: "localizedString",
              validation: (rule) => rule.required(),
            },
            {
              name: "description",
              title: "Opis",
              type: "localizedText",
            },
            {
              name: "image",
              title: "Zdjęcie modelu",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "featured",
              title: "Wyróżniony (większa, środkowa karta)",
              type: "boolean",
              initialValue: false,
            },
          ],
          preview: {
            select: {
              t: "name.translations",
              media: "image",
              featured: "featured",
            },
            prepare: ({ t, media, featured }) => {
              const name =
                (Array.isArray(t)
                  ? (t as { value?: string }[]).find((x) => x?.value)?.value
                  : "") ?? "";
              return {
                title: name || "(model bez nazwy)",
                subtitle: featured ? "Wyróżniony" : undefined,
                media,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Modele PickUpWall" }) },
});
