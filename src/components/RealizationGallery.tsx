"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function RealizationGallery({
  images,
  title,
}: {
  images: { src: string; thumb: string }[];
  title: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () =>
      setOpen((i) =>
        i === null ? i : (i - 1 + images.length) % images.length,
      ),
    [images.length],
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  if (!images.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Powiększ zdjęcie ${i + 1}`}
            className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-[#0a2a2e]/15 cursor-pointer">
            <img
              src={img.thumb}
              alt={`${title} - zdjęcie ${i + 1}`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {open !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4"
            onClick={close}
            role="dialog"
            aria-modal="true">
          <button
            type="button"
            onClick={close}
            aria-label="Zamknij"
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white text-2xl leading-none transition hover:bg-white/20">
            &times;
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-3 md:left-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 5l-7 7 7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <img
            src={images[open].src}
            alt={`${title} - zdjęcie ${open + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[88vw] object-contain rounded-lg shadow-2xl"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Następne zdjęcie"
              className="absolute right-3 md:right-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm tracking-wider">
              {open + 1} / {images.length}
            </div>
          )}
          </div>,
          document.body,
        )}
    </>
  );
}
