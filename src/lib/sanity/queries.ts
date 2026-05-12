/**
 * GROQ queries used by Server Components.
 * Each translatable field is selected as the full {translations[]} object;
 * the i18n helper resolves to a plain string at render time.
 */

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
    navigation[]{
      href,
      label ${localized}
    },
    ctaLabel ${localized},
    ctaHref
  }
`;

export const HOME_PAGE_QUERY = /* groq */ `
  *[_type == "homePage"][0] {
    heroSubtitle ${localized},
    heroDescription ${localized},
    heroScrollLabel ${localized},

    qaEyebrow ${localized},
    qaHeadline ${localized},
    qaSubtitle ${localized},
    qaTiles[]{
      title ${localized},
      description ${localized}
    },

    productEyebrow ${localized},
    productHeadline ${localized},
    productFeatures[]{
      title ${localized},
      description ${localized}
    },
    productBrandLabel ${localized},
    productBrandName ${localized},
    productSpecs[]{
      label ${localized},
      value ${localized}
    },
    productBenefitsHeadline ${localized},
    productBenefits[]{
      title ${localized},
      description ${localized}
    },

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
    },

    integrationEyebrow ${localized},
    integrationHeadline ${localized},
    integrationIntro ${localized},
    integrationItems[]{
      title ${localized},
      description ${localized}
    },

    globalEyebrow ${localized},
    globalHeadline ${localized},
    globalIntro ${localized}
  }
`;

export const REALIZATIONS_PAGE_QUERY = /* groq */ `
  *[_type == "realizationsPage"][0] {
    eyebrow ${localized},
    headline ${localized},
    intro ${localized},
    backToHomeLabel ${localized}
  }
`;

export const REALIZATIONS_LIST_QUERY = /* groq */ `
  *[_type == "realization"] | order(publishedAt desc, _createdAt desc) {
    _id,
    "slug": slug.current,
    title ${localized},
    category ${localized},
    summary ${localized},
    coverImage,
    year
  }
`;

export const REALIZATION_BY_SLUG_QUERY = /* groq */ `
  *[_type == "realization" && slug.current == $slug][0] {
    _id,
    "slug": slug.current,
    title ${localized},
    category ${localized},
    client,
    location ${localized},
    year,
    lockerCount,
    integration ${localized},
    rolloutTime ${localized},
    summary ${localized},
    story ${localized},
    coverImage,
    gallery
  }
`;

export const NEXT_REALIZATIONS_QUERY = /* groq */ `
  *[_type == "realization" && slug.current != $slug] | order(publishedAt desc) [0...3] {
    _id,
    "slug": slug.current,
    title ${localized},
    coverImage
  }
`;
