import { defineField, defineType } from "sanity";

export const realizationsPage = defineType({
  name: "realizationsPage",
  title: "Strona realizacji (lista)",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "localizedString",
    }),
    defineField({
      name: "headline",
      title: "Nagłówek (Realizacje.)",
      type: "localizedString",
    }),
    defineField({
      name: "intro",
      title: "Wstęp",
      type: "localizedText",
    }),
    defineField({
      name: "backToHomeLabel",
      title: 'Etykieta linku "Powrót na stronę główną"',
      type: "localizedString",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Strona realizacji (lista)" }),
  },
});
