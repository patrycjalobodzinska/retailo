import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Ustawienia strony",
  type: "document",
  fields: [
    defineField({
      name: "logoText",
      title: "Logo (tekst)",
      type: "string",
      initialValue: "retailo.",
    }),
    defineField({
      name: "metaTitle",
      title: "Tytuł karty przeglądarki (domyślny)",
      type: "string",
      initialValue: "Retailo",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description (SEO / OG / Google snippet)",
      type: "text",
      rows: 3,
      description:
        "Opis strony pokazywany w wynikach Google i przy udostępnianiu linku (Facebook, Slack, Twitter).",
    }),
    defineField({
      name: "ogImage",
      title: "Obrazek OG (1200×630 px, do udostępniania linku)",
      type: "image",
      options: { hotspot: true },
      description:
        "Obrazek pokazywany przy udostępnianiu strony na Facebooku, Slacku, LinkedIn, Twitterze.",
    }),
    defineField({
      name: "siteUrl",
      title: "URL strony (np. https://retailo.pl)",
      type: "string",
      description: "Używany do absolutnych URL-i w OG tagach.",
    }),
    defineField({
      name: "navigation",
      title: "Nawigacja",
      type: "array",
      of: [
        {
          type: "object",
          name: "navItem",
          fields: [
            defineField({
              name: "label",
              title: "Etykieta",
              type: "localizedString",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              description: "Anchor (#kontakt) lub ścieżka (/realizacje).",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              translations: "label.translations",
              href: "href",
            },
            prepare: ({ translations, href }) => {
              const list = (translations as { value?: string }[] | undefined) ?? [];
              const first = list.find((i) => i?.value)?.value;
              return {
                title: first ?? "(brak etykiety)",
                subtitle: href,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "ctaLabel",
      title: "Tekst przycisku CTA (Zapytaj o ofertę)",
      type: "localizedString",
    }),
    defineField({
      name: "ctaHref",
      title: "Link CTA",
      type: "string",
      initialValue: "#kontakt",
    }),

    /* Footer */
    defineField({
      name: "footerTagline",
      title: "Footer – podtytuł pod logo",
      type: "localizedString",
    }),
    defineField({
      name: "footerEmail",
      title: "Footer – e-mail kontaktowy",
      type: "string",
    }),
    defineField({
      name: "footerPhone",
      title: "Footer – telefon kontaktowy",
      type: "string",
    }),
    defineField({
      name: "footerAddress",
      title: "Footer – adres",
      type: "localizedString",
    }),
    defineField({
      name: "footerCopyright",
      title: "Footer – copyright",
      type: "localizedString",
    }),
    defineField({
      name: "footerPrivacyLabel",
      title: "Footer – etykieta linku „Polityka prywatnosci”",
      type: "localizedString",
    }),
    defineField({
      name: "footerTermsLabel",
      title: "Footer – etykieta linku „Regulamin”",
      type: "localizedString",
    }),
    // ── Baner cookies ────────────────────────────────────────────────
    defineField({
      name: "cookieTitle",
      title: "Cookies – tytuł banera",
      type: "localizedString",
    }),
    defineField({
      name: "cookieText",
      title: "Cookies – treść banera",
      type: "localizedText",
    }),
    defineField({
      name: "cookieAcceptLabel",
      title: "Cookies – przycisk „Akceptuję wszystkie”",
      type: "localizedString",
    }),
    defineField({
      name: "cookieRejectLabel",
      title: "Cookies – przycisk „Odrzucam”",
      type: "localizedString",
    }),
    defineField({
      name: "cookieCustomizeLabel",
      title: "Cookies – przycisk „Dostosuj”",
      type: "localizedString",
    }),
    defineField({
      name: "cookieSaveLabel",
      title: "Cookies – przycisk „Zapisz wybór”",
      type: "localizedString",
    }),
    defineField({
      name: "cookieSettingsTitle",
      title: "Cookies – tytuł panelu ustawień",
      type: "localizedString",
    }),
    defineField({
      name: "cookieNecessaryTitle",
      title: "Cookies – kategoria niezbędne (tytuł)",
      type: "localizedString",
    }),
    defineField({
      name: "cookieNecessaryDesc",
      title: "Cookies – kategoria niezbędne (opis)",
      type: "localizedText",
    }),
    defineField({
      name: "cookieAnalyticsTitle",
      title: "Cookies – kategoria analityczne (tytuł)",
      type: "localizedString",
    }),
    defineField({
      name: "cookieAnalyticsDesc",
      title: "Cookies – kategoria analityczne (opis)",
      type: "localizedText",
    }),
    defineField({
      name: "cookieSettingsLinkLabel",
      title: "Cookies – etykieta linku „Ustawienia cookies” (stopka)",
      type: "localizedString",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Ustawienia strony" }),
  },
});
