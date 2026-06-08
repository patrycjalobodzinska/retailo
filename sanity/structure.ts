import type { StructureResolver } from "sanity/structure";

const singleton = (
  S: Parameters<StructureResolver>[0],
  id: string,
  type: string,
  title: string,
) =>
  S.listItem()
    .title(title)
    .id(id)
    .child(S.document().schemaType(type).documentId(id).title(title));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Treści")
    .items([
      S.listItem()
        .title("Strona główna")
        .id("home")
        .child(
          S.list()
            .title("Strona główna")
            .items([
              singleton(S, "homeHero", "homeHero", "Hero"),
              singleton(S, "homeQa", "homeQa", "Nasze rozwiązanie"),
              singleton(S, "homeProduct", "homeProduct", "PickUpWall (specs)"),
              singleton(
                S,
                "homeRealizations",
                "homeRealizations",
                "Realizacje (karuzela)",
              ),
              singleton(
                S,
                "homeIntegration",
                "homeIntegration",
                "Integracja, instalacja, wsparcie",
              ),
              singleton(S, "homeModels", "homeModels", "Modele PickUpWall"),
              singleton(S, "homeGlobal", "homeGlobal", "Global (mapa)"),
            ]),
        ),
      S.listItem()
        .title("Strona realizacji")
        .id("realizationsPage")
        .child(
          S.document()
            .schemaType("realizationsPage")
            .documentId("realizationsPage")
            .title("Strona realizacji"),
        ),
      S.documentTypeListItem("realization").title("Realizacje"),
      S.documentTypeListItem("lockerModule").title("Modele"),
      S.divider(),
      singleton(S, "siteSettings", "siteSettings", "Ustawienia strony"),
      S.documentTypeListItem("language").title("Języki"),
    ]);
