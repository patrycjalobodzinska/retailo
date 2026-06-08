import { defineField, defineType } from "sanity";

export const localizedText = defineType({
  name: "localizedText",
  title: "Akapit (tłumaczenia)",
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
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { lang: "language.code", value: "value" },
            prepare: ({ lang, value }) => ({
              title: (value ?? "").slice(0, 80),
              subtitle: lang ? lang.toUpperCase() : "-",
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
        title: (first ?? "(puste)").slice(0, 80),
        subtitle: `${list.length} tłumaczeń`,
      };
    },
  },
});
