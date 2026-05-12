import { defineField, defineType } from "sanity";

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
      name: "category",
      title: "Kategoria",
      type: "localizedString",
      description: "np. Galeria handlowa, Stacja paliw…",
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
    }),
    defineField({
      name: "year",
      title: "Rok wdrożenia",
      type: "number",
    }),
    defineField({
      name: "lockerCount",
      title: "Liczba skrytek",
      type: "number",
    }),
    defineField({
      name: "integration",
      title: "Integracja",
      type: "localizedString",
    }),
    defineField({
      name: "rolloutTime",
      title: "Czas wdrożenia",
      type: "localizedString",
    }),
    defineField({
      name: "summary",
      title: "Krótki opis (na liście / kafelek)",
      type: "localizedText",
    }),
    defineField({
      name: "story",
      title: "Pełny opis wdrożenia",
      type: "localizedText",
    }),
    defineField({
      name: "coverImage",
      title: "Zdjęcie główne",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Galeria",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "publishedAt",
      title: "Data publikacji",
      type: "datetime",
    }),
  ],
  orderings: [
    {
      title: "Data publikacji (najnowsze)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
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
