
const localized = `{ translations[]{ value, language->{code} } }`;

export const LANGUAGES_QUERY = /* groq */ `
  *[_type == "language"] | order(order asc, code asc) {
    _id,
    code,
    name,
    isDefault,
    order
  }
`;

export const SITE_SETTINGS_QUERY = /* groq */ `
  *[_type == "siteSettings"][0] {
    logoText,
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url,
    siteUrl,
    navigation[]{
      href,
      label ${localized}
    },
    ctaLabel ${localized},
    ctaHref,
    footerTagline ${localized},
    footerEmail,
    footerPhone,
    footerAddress ${localized},
    footerCopyright ${localized},
    footerPrivacyLabel ${localized},
    footerTermsLabel ${localized},
    cookieTitle ${localized},
    cookieText ${localized},
    cookieAcceptLabel ${localized},
    cookieRejectLabel ${localized},
    cookieCustomizeLabel ${localized},
    cookieSaveLabel ${localized},
    cookieSettingsTitle ${localized},
    cookieNecessaryTitle ${localized},
    cookieNecessaryDesc ${localized},
    cookieAnalyticsTitle ${localized},
    cookieAnalyticsDesc ${localized},
    cookieSettingsLinkLabel ${localized}
  }
`;

export const LEGAL_PAGE_QUERY = /* groq */ `
  *[_type == "legalPage" && slug.current == $slug][0] {
    "slug": slug.current,
    title ${localized},
    effectiveDate ${localized},
    body { translations[]{ value, language->{code} } }
  }
`;

export const HOME_PAGE_QUERY = /* groq */ `{
  "hero": *[_type == "homeHero"][0]{
    "heroImage": heroImage.asset->url,
    "heroInstallImage": heroInstallImage.asset->url,
    heroSubtitle ${localized},
    heroDescription ${localized},
    heroScrollLabel ${localized},
    heroBadges[]{
      value ${localized},
      label ${localized}
    },
    heroInstallEyebrow ${localized},
    heroInstallTitle ${localized},
    heroInstallSubtitle ${localized}
  },
  "qa": *[_type == "homeQa"][0]{
    "qaClientLogo": qaClientLogo.asset->url,
    qaEyebrow ${localized},
    qaHeadline ${localized},
    qaSubtitle ${localized},
    qaTiles[]{
      title ${localized},
      description ${localized}
    }
  },
  "product": *[_type == "homeProduct"][0]{
    "productPhoto": productPhoto.asset->url,
    "productSketch": productSketch.asset->url,
    productEyebrow ${localized},
    productHeadline ${localized},
    productFeatures[]{
      title ${localized},
      description ${localized}
    },
    productBrandLabel ${localized},
    productBrandName ${localized},
    productBenefitsHeadline ${localized},
    productBenefits[]{
      title ${localized},
      description ${localized}
    },
    productStepsLabel ${localized},
    productSpecsHeadline ${localized},
    productPersonalizationKicker ${localized},
    productPersonalizationHeadline ${localized},
    productPersonalizationText ${localized},
    productHardwareLabel ${localized},
    productHardwareRows[]{
      label ${localized},
      value ${localized}
    }
  },
  "realizations": *[_type == "homeRealizations"][0]{
    realizationsEyebrow ${localized},
    realizationsHeadline ${localized},
    realizationsIntro ${localized},
    realizationsCtaLabel ${localized},
    realizationsCtaHref,
    realizationsSystemEyebrow ${localized},
    realizationsSystemHeadline ${localized},
    realizationsSystemItems[]{
      title ${localized},
      description ${localized}
    }
  },
  "integration": *[_type == "homeIntegration"][0]{
    integrationEyebrow ${localized},
    integrationHeadline ${localized},
    integrationIntro ${localized},
    integrationItems[]{
      title ${localized},
      description ${localized}
    }
  },
  "models": *[_type == "homeModels"][0]{
    modelsVisible,
    modelsHeadline ${localized},
    models[]{
      name ${localized},
      description ${localized},
      featured,
      "image": image.asset->url
    }
  },
  "global": *[_type == "homeGlobal"][0]{
    globalEyebrow ${localized},
    globalHeadline ${localized},
    globalIntro ${localized},
    globalCountriesLeft[] ${localized},
    globalCountriesRight[] ${localized},
    globalMapCountries,
    globalCtaToggleLabel ${localized},
    globalCtaTitle ${localized},
    globalCtaSubtitle ${localized},
    globalCtaNamePlaceholder ${localized},
    globalCtaEmailPlaceholder ${localized},
    globalCtaMessagePlaceholder ${localized},
    globalCtaSubmitLabel ${localized}
  }
}`;

export const REALIZATIONS_PAGE_QUERY = /* groq */ `
  *[_type == "realizationsPage"][0] {
    eyebrow ${localized},
    headline ${localized},
    intro ${localized},
    backToHomeLabel ${localized}
  }
`;

export const REALIZATIONS_LIST_QUERY = /* groq */ `
  *[_type == "realization"] | order(featured desc, _createdAt desc) {
    _id,
    "slug": slug.current,
    title ${localized},
    summary ${localized},
    client,
    location ${localized},
    lockerCount,
    coverImage,
    year,
    featured
  }
`;

export const REALIZATION_BY_SLUG_QUERY = /* groq */ `
  *[_type == "realization" && slug.current == $slug][0] {
    _id,
    "slug": slug.current,
    title ${localized},
    client,
    location ${localized},
    year,
    lockerCount,
    specs[]{ label ${localized}, value ${localized} },
    masterCount,
    slaveCount,
    modules[]->{
      "id": _id,
      title,
      accent,
      lockers,
      matrix
    },
    devices[]{
      label,
      modules[]->{
        "id": _id,
        title,
        accent,
        lockers,
        matrix
      }
    },
    summary ${localized},
    body,
    coverImage,
    gallery
  }
`;

export const NEXT_REALIZATIONS_QUERY = /* groq */ `
  *[_type == "realization" && slug.current != $slug] | order(_createdAt desc) [0...3] {
    _id,
    "slug": slug.current,
    title ${localized},
    coverImage
  }
`;
