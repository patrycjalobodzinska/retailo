import type { SchemaTypeDefinition } from "sanity";

import { localizedString } from "./objects/localizedString";
import { localizedText } from "./objects/localizedText";
import { localizedBlockContent } from "./objects/localizedBlockContent";

import { language } from "./documents/language";
import { siteSettings } from "./documents/siteSettings";
import { homeHero } from "./documents/home/homeHero";
import { homeQa } from "./documents/home/homeQa";
import { homeProduct } from "./documents/home/homeProduct";
import { homeRealizations } from "./documents/home/homeRealizations";
import { homeIntegration } from "./documents/home/homeIntegration";
import { homeGlobal } from "./documents/home/homeGlobal";
import { homeModels } from "./documents/home/homeModels";
import { realization } from "./documents/realization";
import { realizationsPage } from "./documents/realizationsPage";
import { lockerModule } from "./documents/lockerModule";
import { legalPage } from "./documents/legalPage";

export const schemaTypes: SchemaTypeDefinition[] = [
  localizedString,
  localizedText,
  localizedBlockContent,

  language,
  siteSettings,
  homeHero,
  homeQa,
  homeProduct,
  homeRealizations,
  homeIntegration,
  homeGlobal,
  homeModels,
  realizationsPage,
  realization,
  lockerModule,
  legalPage,
];
