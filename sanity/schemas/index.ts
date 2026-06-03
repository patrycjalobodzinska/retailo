import type { SchemaTypeDefinition } from "sanity";

import { localizedString } from "./objects/localizedString";
import { localizedText } from "./objects/localizedText";
import { localizedBlockContent } from "./objects/localizedBlockContent";

import { language } from "./documents/language";
import { siteSettings } from "./documents/siteSettings";
import { homePage } from "./documents/homePage";
import { realization } from "./documents/realization";
import { realizationsPage } from "./documents/realizationsPage";
import { lockerModule } from "./documents/lockerModule";
import { legalPage } from "./documents/legalPage";

export const schemaTypes: SchemaTypeDefinition[] = [
  // helpers
  localizedString,
  localizedText,
  localizedBlockContent,

  // documents
  language,
  siteSettings,
  homePage,
  realizationsPage,
  realization,
  lockerModule,
  legalPage,
];
