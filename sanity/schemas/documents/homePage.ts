import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Strona główna",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "qa", title: "Nasze rozwiązanie" },
    { name: "product", title: "PickUpWall (specs + cechy)" },
    { name: "realizations", title: "Realizacje (karuzela)" },
    { name: "integration", title: "Integracja, instalacja, wsparcie" },
    { name: "global", title: "Global (mapa)" },
  ],
  fields: [
    /* Hero */
    defineField({
      name: "heroSubtitle",
      title: "Hero — duży nagłówek (PickUpWall)",
      type: "localizedString",
      group: "hero",
    }),
    defineField({
      name: "heroDescription",
      title: "Hero — opis pod nagłówkiem",
      type: "localizedText",
      group: "hero",
    }),
    defineField({
      name: "heroScrollLabel",
      title: "Hero — etykieta SCROLL DOWN",
      type: "localizedString",
      group: "hero",
    }),

    /* Nasze rozwiązanie */
    defineField({
      name: "qaEyebrow",
      title: "Eyebrow (Nasze rozwiązanie)",
      type: "localizedString",
      group: "qa",
    }),
    defineField({
      name: "qaHeadline",
      title: "Nagłówek (PickUpWall.)",
      type: "localizedString",
      group: "qa",
    }),
    defineField({
      name: "qaSubtitle",
      title: "Podtytuł",
      type: "localizedText",
      group: "qa",
    }),
    defineField({
      name: "qaTiles",
      title: "Kafelki cech (Modularność, Skalowalność, …)",
      type: "array",
      group: "qa",
      of: [
        {
          type: "object",
          name: "qaTile",
          fields: [
            defineField({
              name: "title",
              title: "Tytuł",
              type: "localizedString",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Opis",
              type: "localizedText",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { items: "title.translations" },
            prepare: ({ items }) => {
              const list = (items as { value?: string }[] | undefined) ?? [];
              const first = list.find((i) => i?.value)?.value;
              return { title: first ?? "(kafelek)" };
            },
          },
        },
      ],
    }),

    /* ProductShowcase */
    defineField({
      name: "productEyebrow",
      title: "Eyebrow (Nasze rozwiązanie — Phase 1)",
      type: "localizedString",
      group: "product",
    }),
    defineField({
      name: "productHeadline",
      title: "Nagłówek (PickUpWall)",
      type: "localizedString",
      group: "product",
    }),
    defineField({
      name: "productFeatures",
      title: "Cechy (Phase 1, lista)",
      type: "array",
      group: "product",
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
      group: "product",
    }),
    defineField({
      name: "productBrandName",
      title: "Nazwa produktu (PickUpWall)",
      type: "localizedString",
      group: "product",
    }),
    defineField({
      name: "productSpecs",
      title: "Specyfikacja (Typ, Skrytki, Ekran, Odbiór, Integracja, Serwis)",
      type: "array",
      group: "product",
      of: [
        {
          type: "object",
          name: "spec",
          fields: [
            defineField({
              name: "label",
              type: "localizedString",
              title: "Etykieta",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "value",
              type: "localizedString",
              title: "Wartość",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { items: "label.translations" },
            prepare: ({ items }) => {
              const list = (items as { value?: string }[] | undefined) ?? [];
              const first = list.find((i) => i?.value)?.value;
              return { title: first ?? "(spec)" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "productBenefitsHeadline",
      title: "Phase 2 — nagłówek prawej kolumny (Korzyści)",
      type: "localizedString",
      group: "product",
    }),
    defineField({
      name: "productBenefits",
      title: "Korzyści (Eliminacja, Wydatne skrócenie, Bezpieczeństwo, Magazyn)",
      type: "array",
      group: "product",
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
      title: "Phase 1 — etykieta listy kroków (Wdrozenie krok po kroku)",
      type: "localizedString",
      group: "product",
    }),
    defineField({
      name: "productSpecsHeadline",
      title: "Phase 2 — nagłówek (Specyfikacja techniczna)",
      type: "localizedString",
      group: "product",
    }),
    defineField({
      name: "productHardwareLabel",
      title: "Phase 2 — etykieta tabeli (Hardware)",
      type: "localizedString",
      group: "product",
    }),
    defineField({
      name: "productHardwareMinLabel",
      title: "Phase 2 — etykieta kolumny Minimum",
      type: "localizedString",
      group: "product",
    }),
    defineField({
      name: "productHardwareMaxLabel",
      title: "Phase 2 — etykieta kolumny Maximum",
      type: "localizedString",
      group: "product",
    }),
    defineField({
      name: "productHardwareRows",
      title: "Phase 2 — wiersze tabeli Hardware",
      type: "array",
      group: "product",
      of: [
        {
          type: "object",
          name: "hwRow",
          fields: [
            defineField({
              name: "label",
              type: "localizedString",
              title: "Etykieta (np. Liczba skrytek)",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "min",
              type: "string",
              title: "Minimum (np. 39 szt)",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "max",
              type: "string",
              title: "Maximum (np. 159 szt)",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { items: "label.translations" },
            prepare: ({ items }) => {
              const list = (items as { value?: string }[] | undefined) ?? [];
              const first = list.find((i) => i?.value)?.value;
              return { title: first ?? "(wiersz)" };
            },
          },
        },
      ],
    }),

    /* RealizationsSection */
    defineField({
      name: "realizationsEyebrow",
      title: "Eyebrow (Realizacje)",
      type: "localizedString",
      group: "realizations",
    }),
    defineField({
      name: "realizationsHeadline",
      title: "Nagłówek (PickUpWall w akcji.)",
      type: "localizedString",
      group: "realizations",
    }),
    defineField({
      name: "realizationsIntro",
      title: "Krótki opis pod nagłówkiem",
      type: "localizedText",
      group: "realizations",
    }),
    defineField({
      name: "realizationsCtaLabel",
      title: 'CTA — etykieta ("Zobacz wszystkie realizacje")',
      type: "localizedString",
      group: "realizations",
    }),
    defineField({
      name: "realizationsCtaHref",
      title: "CTA — link",
      type: "string",
      initialValue: "/realizacje",
      group: "realizations",
    }),
    defineField({
      name: "realizationsSystemEyebrow",
      title: "Eyebrow systemu obsługi zamówień",
      type: "localizedString",
      group: "realizations",
    }),
    defineField({
      name: "realizationsSystemHeadline",
      title: "Nagłówek systemu (PickUpWall)",
      type: "localizedString",
      group: "realizations",
    }),
    defineField({
      name: "realizationsSystemItems",
      title: "Punkty systemu (PickUpWall, Łatwość obsługi, Zamówienia 360)",
      type: "array",
      group: "realizations",
      of: [
        {
          type: "object",
          name: "systemItem",
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
              return { title: first ?? "(punkt)" };
            },
          },
        },
      ],
    }),

    /* Integration */
    defineField({
      name: "integrationEyebrow",
      title: "Eyebrow (Nasza oferta)",
      type: "localizedString",
      group: "integration",
    }),
    defineField({
      name: "integrationHeadline",
      title: "Nagłówek (Integracja, instalacja, wsparcie)",
      type: "localizedString",
      group: "integration",
    }),
    defineField({
      name: "integrationIntro",
      title: "Wstęp pod nagłówkiem",
      type: "localizedText",
      group: "integration",
    }),
    defineField({
      name: "integrationItems",
      title: "Punkty (Integracja, RODO, Instalacja, Wsparcie)",
      type: "array",
      group: "integration",
      of: [
        {
          type: "object",
          name: "integrationItem",
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
              return { title: first ?? "(punkt)" };
            },
          },
        },
      ],
    }),

    /* Global / mapa */
    defineField({
      name: "globalEyebrow",
      title: "Eyebrow",
      type: "localizedString",
      group: "global",
    }),
    defineField({
      name: "globalHeadline",
      title: "Nagłówek (np. GLOBAL)",
      type: "localizedString",
      group: "global",
    }),
    defineField({
      name: "globalIntro",
      title: "Krótki opis",
      type: "localizedText",
      group: "global",
    }),
    defineField({
      name: "globalCountriesLeft",
      title: "Kraje – kolumna lewa",
      type: "array",
      group: "global",
      of: [{ type: "localizedString" }],
    }),
    defineField({
      name: "globalCountriesRight",
      title: "Kraje – kolumna prawa",
      type: "array",
      group: "global",
      of: [{ type: "localizedString" }],
    }),
    defineField({
      name: "globalCtaToggleLabel",
      title: "Mobile CTA – tekst przycisku rozwijającego",
      type: "localizedString",
      group: "global",
    }),
    defineField({
      name: "globalCtaTitle",
      title: "Formularz – tytuł",
      type: "localizedString",
      group: "global",
    }),
    defineField({
      name: "globalCtaSubtitle",
      title: "Formularz – podtytuł",
      type: "localizedString",
      group: "global",
    }),
    defineField({
      name: "globalCtaNamePlaceholder",
      title: "Formularz – placeholder Imię i nazwisko",
      type: "localizedString",
      group: "global",
    }),
    defineField({
      name: "globalCtaEmailPlaceholder",
      title: "Formularz – placeholder E-mail",
      type: "localizedString",
      group: "global",
    }),
    defineField({
      name: "globalCtaMessagePlaceholder",
      title: "Formularz – placeholder Wiadomość",
      type: "localizedString",
      group: "global",
    }),
    defineField({
      name: "globalCtaSubmitLabel",
      title: "Formularz – tekst przycisku Wyślij",
      type: "localizedString",
      group: "global",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Strona główna" }),
  },
});
