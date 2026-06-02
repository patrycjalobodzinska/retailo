import type { StructureResolver } from "sanity/structure";

/**
 * Custom desk so the editor sees:
 *   – Strona główna  (singleton)
 *   – Strona realizacji  (singleton)
 *   – Realizacje  (collection)
 *   – Ustawienia strony  (singleton)
 *   – Języki  (collection)
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Treści")
    .items([
      S.listItem()
        .title("Strona główna")
        .id("homePage")
        .child(
          S.document()
            .schemaType("homePage")
            .documentId("homePage")
            .title("Strona główna"),
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
      S.listItem()
        .title("Ustawienia strony")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Ustawienia strony"),
        ),
      S.documentTypeListItem("language").title("Języki"),
    ]);
