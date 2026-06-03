import { defineField, defineType } from "sanity";

/**
 * Localized rich text (Portable Text). Same translations-array structure as
 * localizedString/localizedText, but the value is an array of blocks so the
 * editor gets full formatting (headings, lists, bold, links).
 */
export const localizedBlockContent = defineType({
  name: "localizedBlockContent",
  title: "Tekst sformatowany (tłumaczenia)",
  type: "object",
  fields: [
    defineField({
      name: "translations",
      title: "Tłumaczenia",
      type: "array",
      of: [
        {
          type: "object",
          name: "translation",
          fields: [
            defineField({
              name: "language",
              title: "Język",
              type: "reference",
              to: [{ type: "language" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "value",
              title: "Treść",
              type: "array",
              of: [
                {
                  type: "block",
                  styles: [
                    { title: "Akapit", value: "normal" },
                    { title: "Nagłówek 2", value: "h2" },
                    { title: "Nagłówek 3", value: "h3" },
                    { title: "Nagłówek 4", value: "h4" },
                    { title: "Cytat", value: "blockquote" },
                  ],
                },
              ],
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { lang: "language.code" },
            prepare: ({ lang }) => ({
              title: lang ? `Treść (${String(lang).toUpperCase()})` : "Treść",
            }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { items: "translations" },
    prepare: ({ items }) => ({
      title: "Tekst sformatowany",
      subtitle: `${((items as unknown[]) ?? []).length} tłumaczeń`,
    }),
  },
});
