import { defineField, defineType } from "sanity";

export const homeProduct = defineType({
  name: "homeProduct",
  title: "Strona główna · PickUpWall (specs + cechy)",
  type: "document",
  fields: [
    defineField({
      name: "productPhoto",
      title: "Zdjęcie produktu (Phase 2 - foto)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "productSketch",
      title: "Szkic produktu (Phase 2 - rysunek techniczny)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "productEyebrow",
      title: "Eyebrow (Nasze rozwiązanie - Phase 1)",
      type: "localizedString",
    }),
    defineField({
      name: "productHeadline",
      title: "Nagłówek (PickUpWall)",
      type: "localizedString",
    }),
    defineField({
      name: "productFeatures",
      title: "Cechy (Phase 1, lista)",
      type: "array",
      of: [
        {
          type: "object",
          name: "productFeature",
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
              return { title: first ?? "(cecha)" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "productBrandLabel",
      title: "Etykieta retailo. (Phase 2)",
      type: "localizedString",
    }),
    defineField({
      name: "productBrandName",
      title: "Nazwa produktu (PickUpWall)",
      type: "localizedString",
    }),
    defineField({
      name: "productBenefitsHeadline",
      title: "Phase 2 - nagłówek prawej kolumny (Korzyści)",
      type: "localizedString",
    }),
    defineField({
      name: "productBenefits",
      title: "Korzyści (Eliminacja, Wydatne skrócenie, Bezpieczeństwo, Magazyn)",
      type: "array",
      of: [
        {
          type: "object",
          name: "benefit",
          fields: [
            defineField({
              name: "title",
              type: "localizedString",
              title: "Tytuł (np. Eliminacja)",
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
              return { title: first ?? "(korzyść)" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "productStepsLabel",
      title: "Phase 1 - etykieta listy kroków (Wdrożenie krok po kroku)",
      type: "localizedString",
    }),
    defineField({
      name: "productSpecsHeadline",
      title: "Phase 2 - nagłówek (Specyfikacja techniczna)",
      type: "localizedString",
    }),
    defineField({
      name: "productPersonalizationKicker",
      title: "Personalizacja - etykieta (np. Personalizacja)",
      type: "localizedString",
    }),
    defineField({
      name: "productPersonalizationHeadline",
      title: "Personalizacja - nagłówek (np. Każdy PickUpWall budujemy pod Ciebie.)",
      type: "localizedString",
    }),
    defineField({
      name: "productPersonalizationText",
      title: "Personalizacja - opis pod nagłówkiem",
      type: "localizedText",
    }),
    defineField({
      name: "productHardwareLabel",
      title: "Phase 2 - etykieta tabeli (Hardware)",
      type: "localizedString",
    }),
    defineField({
      name: "productHardwareRows",
      title: "Phase 2 - wiersze tabeli Hardware (nazwa + wartość)",
      description:
        "Lista parametrów, np. „Liczba skrytek / od 3 do 320”, „Ekran / od 10\" do 21.5\"”, „Kolory urządzeń / dowolne z palety RAL”, „Rozwiązania / indoor i outdoor”.",
      type: "array",
      of: [
        {
          type: "object",
          name: "hwRow",
          fields: [
            defineField({
              name: "label",
              type: "localizedString",
              title: "Nazwa (np. Liczba skrytek)",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "value",
              type: "localizedString",
              title: "Wartość (np. od 3 do 320)",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              items: "label.translations",
              values: "value.translations",
            },
            prepare: ({ items, values }) => {
              const first = (t: unknown) =>
                (Array.isArray(t)
                  ? (t as { value?: string }[]).find((x) => x?.value)?.value
                  : "") ?? "";
              return {
                title: first(items) || "(wiersz)",
                subtitle: first(values),
              };
            },
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "PickUpWall (specs + cechy)" }) },
});
