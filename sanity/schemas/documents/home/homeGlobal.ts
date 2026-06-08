import { defineField, defineType } from "sanity";
import { MapCountriesInput } from "../../../components/MapCountriesInput";

export const homeGlobal = defineType({
  name: "homeGlobal",
  title: "Strona główna · Global (mapa)",
  type: "document",
  fields: [
    defineField({
      name: "globalEyebrow",
      title: "Eyebrow",
      type: "localizedString",
    }),
    defineField({
      name: "globalHeadline",
      title: "Nagłówek (np. GLOBAL)",
      type: "localizedString",
    }),
    defineField({
      name: "globalIntro",
      title: "Krótki opis",
      type: "localizedText",
    }),
    defineField({
      name: "globalCountriesLeft",
      title: "Kraje - kolumna lewa",
      type: "array",
      of: [{ type: "localizedString" }],
    }),
    defineField({
      name: "globalCountriesRight",
      title: "Kraje - kolumna prawa",
      type: "array",
      of: [{ type: "localizedString" }],
    }),
    defineField({
      name: "globalMapCountries",
      title: "Kraje podświetlane na mapie (kody ISO)",
      description:
        "Steruje podświetleniem krajów na globie. Wybierz z listy Europy lub dodaj kod ISO ręcznie (spoza Europy). Jeśli puste - używana jest domyślna lista.",
      type: "array",
      of: [{ type: "string" }],
      components: { input: MapCountriesInput },
    }),
    defineField({
      name: "globalCtaToggleLabel",
      title: "Mobile CTA - tekst przycisku rozwijającego",
      type: "localizedString",
    }),
    defineField({
      name: "globalCtaTitle",
      title: "Formularz - tytuł",
      type: "localizedString",
    }),
    defineField({
      name: "globalCtaSubtitle",
      title: "Formularz - podtytuł",
      type: "localizedString",
    }),
    defineField({
      name: "globalCtaNamePlaceholder",
      title: "Formularz - placeholder Imię i nazwisko",
      type: "localizedString",
    }),
    defineField({
      name: "globalCtaEmailPlaceholder",
      title: "Formularz - placeholder E-mail",
      type: "localizedString",
    }),
    defineField({
      name: "globalCtaMessagePlaceholder",
      title: "Formularz - placeholder Wiadomość",
      type: "localizedString",
    }),
    defineField({
      name: "globalCtaSubmitLabel",
      title: "Formularz - tekst przycisku Wyślij",
      type: "localizedString",
    }),
  ],
  preview: { prepare: () => ({ title: "Global (mapa)" }) },
});
