import { defineField, defineType } from "sanity";
import { LockerMatrixInput } from "../../components/LockerMatrixInput";
import { ColorHexInput } from "../../components/ColorHexInput";

/**
 * Model pojedynczego modułu PickUpWall (np. Master z ekranem, Slave bez
 * ekranu, model trzeci). Z tych modeli edytor składa ścianę w realizacji,
 * wybierając je w kolejności. Układ skrytek przechowywany jest jako macierz
 * (proporcjonalne szerokości kolumn + wysokości wierszy) — patrz
 * LockerMatrixInput.
 */
export const lockerModule = defineType({
  name: "lockerModule",
  title: "Model",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nazwa modelu",
      type: "string",
      description: "np. „Master — 39 skrytek + ekran”, „Slave — 40 skrytek”.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "accent",
      title: "Kolor akcentu",
      type: "string",
      description:
        "Używany na obrysie i ekranie modułu (np. #0086b0 dla Master, #7ed5e6 dla Slave).",
      initialValue: "#0086b0",
      components: { input: ColorHexInput },
    }),
    defineField({
      name: "lockers",
      title: "Liczba skrytek (do legendy)",
      type: "number",
    }),
    defineField({
      name: "matrix",
      title: "Układ skrytek (macierz)",
      type: "text",
      description:
        "Wizualny edytor siatki — ustaw kolumny, wiersze i ewentualny ekran.",
      components: { input: LockerMatrixInput },
    }),
  ],
  preview: {
    select: { title: "title", lockers: "lockers", accent: "accent" },
    prepare: ({ title, lockers }) => ({
      title: title ?? "(model bez nazwy)",
      subtitle: lockers ? `${lockers} skrytek` : "—",
    }),
  },
});
