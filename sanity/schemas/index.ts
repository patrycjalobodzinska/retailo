import type { SchemaTypeDefinition } from "sanity";

import { localizedString } from "./objects/localizedString";
import { localizedText } from "./objects/localizedText";

import { language } from "./documents/language";
import { siteSettings } from "./documents/siteSettings";
import { homePage } from "./documents/homePage";
import { realization } from "./documents/realization";
import { realizationsPage } from "./documents/realizationsPage";

export const schemaTypes: SchemaTypeDefinition[] = [
  // helpers
  localizedString,
  localizedText,

  // documents
  language,
  siteSettings,
  homePage,
  realizationsPage,
  realization,
];
