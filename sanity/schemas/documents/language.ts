import { defineField, defineType } from "sanity";

export const language = defineType({
  name: "language",
  title: "Język",
  type: "document",
  fields: [
    defineField({
      name: "code",
      title: "Kod (np. pl, en, de)",
      type: "string",
      description: "Dwuliterowy kod ISO 639-1. Używany w URL-ach.",
      validation: (rule) =>
        rule
          .required()
          .lowercase()
          .min(2)
          .max(5)
          .regex(/^[a-z]{2}(-[a-z]{2})?$/, {
            name: "lowercase ISO code",
          }),
    }),
    defineField({
      name: "name",
      title: "Nazwa",
      type: "string",
      description: "Nazwa wyświetlana w przełączniku, np. Polski, English.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isDefault",
      title: "Język domyślny",
      type: "boolean",
      description:
        "Tylko jeden język może być domyślny. Treści w nim są fallbackiem.",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Kolejność w przełączniku",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { code: "code", name: "name", isDefault: "isDefault" },
    prepare: ({ code, name, isDefault }) => ({
      title: name,
      subtitle: `${code?.toUpperCase()}${isDefault ? " · domyślny" : ""}`,
    }),
  },
  orderings: [
    {
      title: "Kolejność",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
