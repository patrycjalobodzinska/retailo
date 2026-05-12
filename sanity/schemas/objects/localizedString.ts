import { defineField, defineType } from "sanity";

/**
 * Localized short string. Stored as an array of {language, value} entries.
 * Editor flow:
 *   1. Admin creates languages in the "Język" document type.
 *   2. For each translatable field, the editor adds one entry per language
 *      from the dropdown — no developer involvement to add a new language.
 */
export const localizedString = defineType({
  name: "localizedString",
  title: "Tekst (tłumaczenia)",
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
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { lang: "language.code", value: "value" },
            prepare: ({ lang, value }) => ({
              title: value,
              subtitle: lang ? lang.toUpperCase() : "—",
            }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { items: "translations" },
    prepare: ({ items }) => {
      const list = (items as { value?: string }[] | undefined) ?? [];
      const first = list.find((i) => i?.value)?.value;
      return {
        title: first ?? "(puste)",
        subtitle: `${list.length} tłumaczeń`,
      };
    },
  },
});
