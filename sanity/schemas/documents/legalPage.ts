import { defineField, defineType } from "sanity";

export const legalPage = defineType({
  name: "legalPage",
  title: "Strony prawne",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Adres (slug)",
      type: "slug",
      description: "np. polityka-prywatnosci",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Tytuł strony",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "effectiveDate",
      title: "Data obowiązywania (np. 3 czerwca 2026 r.)",
      type: "localizedString",
    }),
    defineField({
      name: "body",
      title: "Treść",
      type: "localizedBlockContent",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { slug: "slug.current" },
    prepare: ({ slug }) => ({ title: slug ?? "Strona prawna" }),
  },
});
