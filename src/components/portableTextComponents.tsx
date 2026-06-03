import type { PortableTextComponents } from "next-sanity";

/* Mapa stylów edytora Sanity → typografia strony. Rozmiary odwzorowują
   hierarchię z edytora (H1 > H2 > H3 > H4 > normal). Współdzielona przez
   detal realizacji i strony prawne. */
export const BODY_COMPONENTS: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="m-0 mt-4 first:mt-0 text-[1rem] leading-relaxed text-[#3a5a60]">
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h2 className="m-0 mt-10 first:mt-0 mb-4 text-[clamp(1.8rem,3vw,2.4rem)] font-bold tracking-tight text-[#0a2a2e]">
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h2 className="m-0 mt-8 first:mt-0 mb-3 text-[clamp(1.4rem,2.4vw,1.8rem)] font-bold tracking-tight text-[#0a2a2e]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="m-0 mt-6 first:mt-0 mb-2 text-[clamp(1.15rem,1.8vw,1.35rem)] font-semibold text-[#0a2a2e]">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="m-0 mt-5 first:mt-0 mb-2 text-[1.05rem] font-semibold uppercase tracking-[0.08em] text-[#0a2a2e]">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="m-0 mt-6 border-l-2 border-[#0086b0] pl-4 italic text-[#3a5a60]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="m-0 mt-4 list-disc pl-5 text-[1rem] leading-relaxed text-[#3a5a60]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="m-0 mt-4 list-decimal pl-5 text-[1rem] leading-relaxed text-[#3a5a60]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="mt-1">{children}</li>,
    number: ({ children }) => <li className="mt-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[#0a2a2e]">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#0086b0] underline underline-offset-2 hover:text-[#0a2a2e] transition-colors">
        {children}
      </a>
    ),
  },
};
