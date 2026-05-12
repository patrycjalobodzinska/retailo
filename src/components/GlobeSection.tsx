"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./GlobeSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const GlobeComponent = dynamic(() => import("./GlobeInner"), {
  ssr: false,
  loading: () => <div className={styles.globePlaceholder} />,
});

const LEFT_COUNTRIES = [
  { name: "Polska", flag: "🇵🇱" },
  { name: "Niemcy", flag: "🇩🇪" },
  { name: "Francja", flag: "🇫🇷" },
  { name: "Hiszpania", flag: "🇪🇸" },
  { name: "Wlochy", flag: "🇮🇹" },
  { name: "Wielka Brytania", flag: "🇬🇧" },
];

const RIGHT_COUNTRIES = [
  { name: "Czechy", flag: "🇨🇿" },
  { name: "Slowacja", flag: "🇸🇰" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Rumunia", flag: "🇷🇴" },
  { name: "Szwecja", flag: "🇸🇪" },
  { name: "Holandia", flag: "🇳🇱" },
];

export default function GlobeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const [globeSize, setGlobeSize] = useState(550);

  useEffect(() => {
    const updateSize = () => {
      setGlobeSize(window.innerWidth < 900 ? 500 : 1500);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        titleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      ).fromTo(
        globeWrapRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: "power3.out" },
        "-=0.5",
      );

      // Countries appear one by one, alternating left-right
      const leftItems = leftRef.current?.children;
      const rightItems = rightRef.current?.children;
      if (leftItems && rightItems) {
        const maxLen = Math.max(leftItems.length, rightItems.length);
        for (let i = 0; i < maxLen; i++) {
          const delay = 1 + i * 0.25;
          if (leftItems[i]) {
            tl.fromTo(
              leftItems[i],
              { x: -40, opacity: 0, scale: 0.8 },
              {
                x: 0,
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.4)",
              },
              delay,
            );
          }
          if (rightItems[i]) {
            tl.fromTo(
              rightItems[i],
              { x: 40, opacity: 0, scale: 0.8 },
              {
                x: 0,
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.4)",
              },
              delay + 0.07,
            );
          }
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <h2 ref={titleRef} className={styles.title}>
        Dzialamy w calej Europie
      </h2>

      <div className={styles.globeRow}>
        <div ref={leftRef} className={styles.countryList}>
          {LEFT_COUNTRIES.map((c) => (
            <div key={c.name} className={styles.countryItem}>
              <span className={styles.flag}>{c.flag}</span>
              <span className={styles.countryName}>{c.name}</span>
            </div>
          ))}
        </div>

        <div ref={globeWrapRef} className={styles.globeWrap}>
          <GlobeComponent width={globeSize} height={globeSize} />
        </div>

        <div ref={rightRef} className={styles.countryList}>
          {RIGHT_COUNTRIES.map((c) => (
            <div key={c.name} className={styles.countryItem}>
              <span className={styles.flag}>{c.flag}</span>
              <span className={styles.countryName}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
